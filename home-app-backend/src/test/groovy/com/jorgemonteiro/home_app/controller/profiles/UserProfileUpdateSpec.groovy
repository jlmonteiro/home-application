package com.jorgemonteiro.home_app.controller.profiles

import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import static groovy.json.JsonOutput.toJson
import static org.hamcrest.Matchers.containsString
import static org.mockito.ArgumentMatchers.anyString
import static org.mockito.Mockito.doReturn
import static org.springframework.hateoas.MediaTypes.HAL_JSON_VALUE
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("User Profile API Update Use Cases")
@Narrative("""
As an authenticated user
I want to update my profile information
So that my contact and social details are current
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
@Subject(UserProfileController)
class UserProfileUpdateSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    UserRepository userRepository

    @MockitoSpyBean
    PhotoService photoService

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/me should update allowed profile fields and ignore immutable ones"() {
        given: "an authenticated user session"
            def targetEmail = "existing@example.com"
            def auth = oauth2Login().attributes { it.put("email", targetEmail) }
            def existingUser = userRepository.findByEmail(targetEmail).get()

        and: "a request body with new values and some immutable values"
            def requestBody = [
                email: targetEmail,
                photo: [data: "new-photo-base64", url: null],
                facebook: "https://facebook.com/new",
                mobilePhone: "+9876543210",
                instagram: "https://instagram.com/new",
                linkedin: "https://linkedin.com/new",
                // Immutable fields - should be ignored
                firstName: "Hacker",
                lastName: "Man"
            ]

        and: "stubbed photo service"
            doReturn("user-1-profile.png")
                .when(photoService).savePhoto(anyString(), anyString(), anyString())

        when: "updating the 'me' profile"
            def response = mockMvc.perform(put("/api/user/me")
                    .with(auth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(requestBody)))

        then: "response status is 200 OK"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "allowed fields are updated"
            response.andExpect(jsonPath('$.photo.url').value("/api/images/user-1-profile.png"))
                    .andExpect(jsonPath('$.facebook').value("https://facebook.com/new"))
                    .andExpect(jsonPath('$.mobilePhone').value("+9876543210"))
                    .andExpect(jsonPath('$.instagram').value("https://instagram.com/new"))
                    .andExpect(jsonPath('$.linkedin').value("https://linkedin.com/new"))

        and: "immutable fields remain unchanged"
            response.andExpect(jsonPath('$.email').value(targetEmail))
            response.andExpect(jsonPath('$.firstName').value(existingUser.firstName))
            response.andExpect(jsonPath('$.lastName').value(existingUser.lastName))


        and: "database is updated correctly"
            def updatedUser = userRepository.findByEmail(targetEmail).get()
            updatedUser.userProfile.photo == "user-1-profile.png"
            updatedUser.firstName == "John"
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/me should save photo using PhotoService"() {
        given: "an authenticated user session"
            def targetEmail = "existing@example.com"
            def auth = oauth2Login().attributes { it.put("email", targetEmail) }

        and: "a request with base64 photo data"
            def photoData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            def requestBody = [
                email: targetEmail,
                photo: [data: photoData, url: null]
            ]

        and: "stubbed photo service"
            doReturn("user-1-profile.png")
                .when(photoService).savePhoto(anyString(), anyString(), anyString())

        when: "updating the 'me' profile"
            def response = mockMvc.perform(put("/api/user/me")
                    .with(auth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(requestBody)))

        then: "response contains the saved photo filename"
            response.andExpect(status().isOk())
                    .andExpect(jsonPath('$.photo.url').value("/api/images/user-1-profile.png"))

    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/me should return 400 when validation fails"() {
        given: "an authenticated user session"
            def auth = oauth2Login().attributes { it.put("email", "existing@example.com") }

        and: "an invalid request body"
            def requestBody = [
                email: "existing@example.com",
                facebook: "not-a-url",
                mobilePhone: "short"
            ]

        when: "updating the 'me' profile"
            def response = mockMvc.perform(put("/api/user/me")
                    .with(auth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(requestBody)))

        then: "400 ProblemDetail is returned with specific error messages"
            response.andExpect(status().isBadRequest())
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/validation-error"))
                    .andExpect(jsonPath('$.errors.facebook').value("Facebook must be a valid Facebook URL"))
                    .andExpect(jsonPath('$.errors.mobilePhone').value("Mobile phone must be a valid phone number"))
    }

    def "PUT /api/user/me should return 302 redirection when unauthenticated"() {
        when: "requesting the update endpoint without authentication"
            def response = mockMvc.perform(put("/api/user/me")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))

        then: "302 Redirect to login is returned"
            response.andExpect(status().is3xxRedirection())
                    .andExpect(header().string("Location", containsString("/oauth2/authorization/google")))
    }
}
