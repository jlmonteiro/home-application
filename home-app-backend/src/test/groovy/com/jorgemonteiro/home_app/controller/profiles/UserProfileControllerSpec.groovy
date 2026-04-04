package com.jorgemonteiro.home_app.controller.profiles

import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

import static org.hamcrest.Matchers.containsString
import static org.springframework.hateoas.MediaTypes.HAL_JSON_VALUE
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("UserProfileController")
@Narrative("""
As a client of the API
I want to retrieve and update user profiles via REST endpoints with HATEOAS links
So that profile data can be read and modified over HTTP using hypermedia
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class UserProfileControllerSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    UserRepository userRepository

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "GET /api/user should return paginated list of profiles"() {
        when: "requesting all user profiles"
            def response = mockMvc.perform(get("/api/user"))

        then: "response status and content type are correct"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "the list contains the expected users"
            response.andExpect(jsonPath('$._embedded.userProfiles').isArray())
                    .andExpect(jsonPath('$._embedded.userProfiles.length()').value(2))
                    .andExpect(jsonPath('$._embedded.userProfiles[0].email').value("existing@example.com"))
                    .andExpect(jsonPath('$._embedded.userProfiles[0].firstName').value("John"))
                    .andExpect(jsonPath('$._embedded.userProfiles[1].email').value("withprofile@example.com"))
                    .andExpect(jsonPath('$._embedded.userProfiles[1].firstName').value("Jane"))

        and: "collection-level hypermedia links are present"
            response.andExpect(jsonPath('$._links.self.href').value(containsString("/api/user?page=0&size=10&sort=email,asc")))

        and: "pagination metadata is correct"
            response.andExpect(jsonPath('$.page.size').value(10))
                    .andExpect(jsonPath('$.page.totalElements').value(2))
                    .andExpect(jsonPath('$.page.totalPages').value(1))
                    .andExpect(jsonPath('$.page.number').value(0))
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "GET /api/user/{id} should return user profile with HATEOAS links when exists"() {
        given: "an existing user ID"
            def id = userRepository.findByEmail("withprofile@example.com").get().id

        when: "requesting existing user profile by ID"
            def response = mockMvc.perform(get("/api/user/${id}"))

        then: "user profile is returned with self and collection links"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))
                    .andExpect(jsonPath('$.id').value(id))
                    .andExpect(jsonPath('$._links.self.href').value(containsString("/api/user/${id}")))
                    .andExpect(jsonPath('$._links.collection.href').value(containsString("/api/user")))
    }

    def "GET /api/user/{id} should return 404 when user does not exist"() {
        when: "requesting non-existent user by ID"
            def response = mockMvc.perform(get("/api/user/999"))

        then: "404 is returned"
            response.andExpect(status().isNotFound())
                    .andExpect(jsonPath('$.type').value("NOT_FOUND"))
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/{id} should update user profile and return HATEOAS links"() {
        given: "an existing user ID and a valid update request"
            def id = userRepository.findByEmail("existing@example.com").get().id
            def requestBody = validUpdateRequestBody() + [id: id, firstName: "Updated"]

        when: "updating user profile by ID"
            def response = mockMvc.perform(put("/api/user/${id}")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(requestBody)))

        then: "user profile is updated and self link is returned"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))
                    .andExpect(jsonPath('$.firstName').value("Updated"))
                    .andExpect(jsonPath('$._links.self.href').value(containsString("/api/user/${id}")))
    }

    def "PUT /api/user/{id} should return 400 ProblemDetail when #field is #scenario"() {
        given: "an update request with #scenario"
            def requestBody = validUpdateRequestBody() + [(field): value]

        when: "updating user profile with invalid data"
            def response = mockMvc.perform(put("/api/user/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(requestBody)))

        then: "400 ProblemDetail is returned with specific field error"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.type').value("VALIDATION_ERROR"))
                    .andExpect(jsonPath('$.title').value("Constraint Violation"))
                    .andExpect(jsonPath("\$.errors.${field}").value(message))

        where:
            field           | scenario          | value                                 | message
            "email"         | "missing"         | null                                  | "Email is required"
            "email"         | "empty"           | ""                                    | "Email is required"
            "email"         | "invalid format"  | "not-an-email"                        | "Email must be valid"
            "email"         | "too long"        | ("a" * 64) + "@" + ("b" * 33) + ".com" | "Email must not exceed 100 characters"
            "firstName"     | "too long"        | "a" * 51                              | "First name must not exceed 50 characters"
            "lastName"      | "too long"        | "a" * 51                              | "Last name must not exceed 50 characters"
    }

    private Map validUpdateRequestBody() {
        [
            email: "valid@example.com",
            firstName: "John",
            lastName: "Doe",
            enabled: true
        ]
    }
}
