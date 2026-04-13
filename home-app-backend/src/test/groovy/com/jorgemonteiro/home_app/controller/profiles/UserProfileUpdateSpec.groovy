package com.jorgemonteiro.home_app.controller.profiles

import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.profiles.PhotoService
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
                photo: "new-photo-base64",
                facebook: "https://facebook.com/new",
                mobilePhone: "+9876543210",
                instagram: "https://instagram.com/new",
                linkedin: "https://linkedin.com/new",
                // Immutable fields - should be ignored
                email: "hacker@example.com",
                firstName: "Hacker",
                lastName: "Man"
            ]

        when: "updating the 'me' profile"
            def response = mockMvc.perform(put("/api/user/me")
                    .with(auth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(requestBody)))

        then: "response status is 200 OK"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "allowed fields are updated"
            response.andExpect(jsonPath('$.photo').value("new-photo-base64"))
                    .andExpect(jsonPath('$.facebook').value("https://facebook.com/new"))
                    .andExpect(jsonPath('$.mobilePhone').value("+9876543210"))
                    .andExpect(jsonPath('$.instagram').value("https://instagram.com/new"))
                    .andExpect(jsonPath('$.linkedin').value("https://linkedin.com/new"))

        and: "immutable fields remain unchanged"
            response.andExpect(jsonPath('$.email').value(targetEmail))
                    .andExpect(jsonPath('$.firstName').value(existingUser.firstName))
                    .andExpect(jsonPath('$.lastName').value(existingUser.lastName))

        and: "database is updated correctly"
            def updatedUser = userRepository.findByEmail(targetEmail).get()
            updatedUser.userProfile.photo == "new-photo-base64"
            updatedUser.firstName == "John"
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/me should convert photo URL to base64 using PhotoService"() {
        given: "an authenticated user session"
            def targetEmail = "existing@example.com"
            def auth = oauth2Login().attributes { it.put("email", targetEmail) }

        and: "a request with a photo URL"
            def photoUrl = "https://example.com/photo.jpg"
            def requestBody = [ photo: photoUrl ]

        and: "stubbed network response via Spy (necessary to avoid real network call)"
            doReturn("converted-base64-data")
                .when(photoService).downloadAndConvertToBase64(anyString())

        when: "updating the 'me' profile"
            def response = mockMvc.perform(put("/api/user/me")
                    .with(auth)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(toJson(requestBody)))

        then: "response contains the converted base64 photo"
            response.andExpect(status().isOk())
                    .andExpect(jsonPath('$.photo').value("converted-base64-data"))
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/me should return 400 when validation fails"() {
        given: "an authenticated user session"
            def auth = oauth2Login().attributes { it.put("email", "existing@example.com") }

        and: "an invalid request body"
            def requestBody = [
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
