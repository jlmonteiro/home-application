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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("User Profile API Integration")
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

    def "GET /api/user/me should return 302 redirection when unauthenticated"() {
        when: "requesting the 'me' endpoint without authentication"
            def response = mockMvc.perform(get("/api/user/me"))

        then: "302 Redirect to login is returned"
            response.andExpect(status().is3xxRedirection())
                    .andExpect(header().string("Location", containsString("/oauth2/authorization/google")))
    }

    @Sql("/scripts/sql/pagination-test-data.sql")
    def "GET /api/user should return paginated navigation links when dataset exceeds one page"() {
        when: "requesting a specific page of user profiles"
            def response = mockMvc.perform(get("/api/user")
                    .param("page", "1")
                    .param("size", "5")
                    .param("sort", "email,asc"))

        then: "response status and content type are correct"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "the specific page content is returned"
            response.andExpect(jsonPath('$._embedded.userProfiles.length()').value(5))
            response.andExpect(jsonPath('$._embedded.userProfiles[0].email').value("user06@example.com"))

        and: "all pagination navigation links are present and correct"
            response.andExpect(jsonPath('$._links.first.href').value(containsString("/api/user?page=0&size=5&sort=email,asc")))
            response.andExpect(jsonPath('$._links.prev.href').value(containsString("/api/user?page=0&size=5&sort=email,asc")))
            response.andExpect(jsonPath('$._links.self.href').value(containsString("/api/user?page=1&size=5&sort=email,asc")))
            response.andExpect(jsonPath('$._links.next.href').value(containsString("/api/user?page=2&size=5&sort=email,asc")))
            response.andExpect(jsonPath('$._links.last.href').value(containsString("/api/user?page=3&size=5&sort=email,asc")))

        and: "pagination metadata is accurate"
            response.andExpect(jsonPath('$.page.totalElements').value(20))
            response.andExpect(jsonPath('$.page.totalPages').value(4))
            response.andExpect(jsonPath('$.page.number').value(1))
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "GET /api/user should preserve sorting parameters in links"() {
        when: "requesting profiles with custom sorting"
            def response = mockMvc.perform(get("/api/user")
                    .param("sort", "firstName,desc"))

        then: "self link preserves the sorting parameter"
            response.andExpect(jsonPath('$._links.self.href').value(containsString("sort=firstName,desc")))
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "GET /api/user/me should return authenticated user profile with canonical links"() {
        given: "an authenticated user session"
            def targetEmail = "existing@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id
            def auth = oauth2Login().attributes { it.put("email", targetEmail) }

        when: "requesting the 'me' endpoint"
            def response = mockMvc.perform(get("/api/user/me").with(auth))

        then: "response status is 200 OK"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "the returned profile matches the authenticated user"
            response.andExpect(jsonPath('$.id').value(expectedId))
            response.andExpect(jsonPath('$.email').value(targetEmail))

        and: "the links contain both canonical self and 'me' alias"
            response.andExpect(jsonPath('$._links.self.href').value(containsString("/api/user/${expectedId}")))
            response.andExpect(jsonPath('$._links.me.href').value(containsString("/api/user/me")))
    }

    def "GET /api/user/me should return 404 when authenticated user is missing from DB"() {
        given: "an authenticated user session for a non-existent local user"
            def auth = oauth2Login().attributes { it.put("email", "ghost@example.com") }

        when: "requesting the 'me' endpoint"
            def response = mockMvc.perform(get("/api/user/me").with(auth))

        then: "404 ProblemDetail is returned"
            response.andExpect(status().isNotFound())
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/not-found"))
                    .andExpect(jsonPath('$.detail').value(containsString("ghost@example.com")))
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
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/not-found"))
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
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/validation-error"))
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
