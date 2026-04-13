package com.jorgemonteiro.home_app.config

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import spock.lang.Narrative
import spock.lang.Title

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("GlobalExceptionHandler")
@Narrative("""
As a frontend developer
I want all API errors to return RFC 7807 ProblemDetail format
So that error handling is consistent and predictable
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@AutoConfigureMockMvc
class GlobalExceptionHandlerSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    def "should return 404 ProblemDetail for ObjectNotFoundException"() {
        when: "requesting a non-existent user"
            def response = mockMvc.perform(get("/api/user/999")
                    .with(user("user")))

        then: "404 ProblemDetail is returned"
            response.andExpect(status().isNotFound())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Object Not Found"))
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/not-found"))
                    .andExpect(jsonPath('$.status').value(404))
    }

    def "should return 400 ProblemDetail for malformed JSON body"() {
        when: "sending malformed JSON"
            def response = mockMvc.perform(put("/api/user/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ invalid json }")
                    .with(user("user")))

        then: "400 ProblemDetail is returned"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Bad Request"))
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/validation-error"))
    }

    def "should return 400 ProblemDetail for validation errors"() {
        given: "a request body with invalid email"
            def body = JsonOutput.toJson([
                email: "not-an-email",
                firstName: "Test",
                lastName: "User",
                enabled: true
            ])

        when: "sending invalid data"
            def response = mockMvc.perform(put("/api/user/1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(user("user")))

        then: "400 ProblemDetail with field errors is returned"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Constraint Violation"))
                    .andExpect(jsonPath('$.errors').exists())
    }

    def "should return 403 for access denied and not swallow it as 500"() {
        when: "a non-adult user accesses settings"
            def response = mockMvc.perform(get("/api/settings/age-groups")
                    .with(user("child").roles("CHILD")))

        then: "403 Forbidden is returned"
            response.andExpect(status().isForbidden())
    }

    def "should return 400 ProblemDetail for duplicate category name"() {
        given: "an existing category"
            mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson([name: "Duplicate"]))
                    .with(user("user")))

        when: "creating a duplicate category"
            def response = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson([name: "Duplicate"]))
                    .with(user("user")))

        then: "400 ProblemDetail is returned"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Validation Error"))
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/validation-error"))
    }
}
