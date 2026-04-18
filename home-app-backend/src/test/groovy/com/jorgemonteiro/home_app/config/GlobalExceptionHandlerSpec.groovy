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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import spock.lang.Narrative
import spock.lang.Title

import static org.springframework.http.MediaType.APPLICATION_PROBLEM_JSON_VALUE
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("Global Exception Handler")
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
                    .andExpect(content().contentType(APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Object Not Found"))
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/not-found"))
                    .andExpect(jsonPath('$.status').value(404))
    }

    def "should return 400 ProblemDetail for malformed JSON body"() {
        when: "sending malformed JSON to categories endpoint"
            def response = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{ invalid json }")
                    .with(user("user")))

        then: "400 ProblemDetail is returned"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Bad Request"))
    }

    def "should return 400 ProblemDetail for validation errors"() {
        given: "a request body with missing category name"
            def body = "{}"

        when: "sending invalid data"
            def response = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
                    .with(user("user")))

        then: "400 ProblemDetail with field errors is returned"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(APPLICATION_PROBLEM_JSON_VALUE))
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
            mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson([name: "Duplicate"]))
                    .with(user("user")))

        when: "creating a duplicate category"
            def response = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson([name: "Duplicate"]))
                    .with(user("user")))

        then: "400 ProblemDetail is returned"
            response.andExpect(status().isBadRequest())
                    .andExpect(content().contentType(APPLICATION_PROBLEM_JSON_VALUE))
                    .andExpect(jsonPath('$.title').value("Validation Error"))
                    .andExpect(jsonPath('$.type').value("http://localhost:8080/errors/validation-error"))
    }

    def "enrichWithExceptionDetails should recursively filter stack traces"() {
        given: "a handler instance with exclusions"
            def handler = new GlobalExceptionHandler("http://localhost:8080/errors", ["^java\\.base/.*", "^org\\.apache\\.tomcat\\..*"])
            def problemDetail = org.springframework.http.ProblemDetail.forStatus(500)
            
        and: "an exception with a cause"
            def root = new RuntimeException("Root error")
            root.stackTrace = [
                new StackTraceElement("com.jorgemonteiro.home_app.Service", "doWork", "Service.java", 10),
                new StackTraceElement("org.hibernate.Session", "save", "Session.java", 100),
                new StackTraceElement("org.springframework.data.Repo", "save", "Repo.java", 50),
                new StackTraceElement("java.base/Thread", "run", "Thread.java", 1000) // Filtered out
            ] as StackTraceElement[]

            def wrapper = new RuntimeException("Wrapper error", root)
            wrapper.stackTrace = [
                new StackTraceElement("com.jorgemonteiro.home_app.Controller", "handle", "Controller.java", 5),
                new StackTraceElement("org.apache.tomcat.Internal", "exec", "Internal.java", 1) // Filtered out
            ] as StackTraceElement[]

        when: "enriching problem detail"
            handler.enrichWithExceptionDetails(problemDetail, wrapper)
            List<String> trace = problemDetail.properties.stackTrace

        then: "exception message is set"
            problemDetail.properties.exceptionMessage == "Wrapper error"

        and: "trace contains app and valid external frames"
            trace.any { it.contains("com.jorgemonteiro.home_app.Controller") }
            trace.any { it.contains("com.jorgemonteiro.home_app.Service") }
            trace.any { it.contains("org.hibernate.Session") }
            trace.any { it.contains("org.springframework.data.Repo") }
            
        and: "framework noise is excluded"
            !trace.any { it.contains("java.base/") }
            !trace.any { it.contains("org.apache.tomcat") }

        and: "causality is marked"
            trace.any { it == "---" }
            trace.any { it.startsWith("Caused by: java.lang.RuntimeException: Root error") }
    }
}
