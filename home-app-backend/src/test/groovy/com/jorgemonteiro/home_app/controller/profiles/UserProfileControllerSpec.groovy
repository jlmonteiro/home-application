package com.jorgemonteiro.home_app.controller.profiles

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("UserProfileController")
@Narrative("""
As a client of the API
I want to retrieve and update user profiles via REST endpoints
So that profile data can be read and modified over HTTP
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class UserProfileControllerSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "GET /api/user/{email} should return user profile when exists"() {
        when: "requesting existing user profile"
            def response = mockMvc.perform(get("/api/user/withprofile@example.com"))

        then: "user profile is returned"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath('$.email').value("withprofile@example.com"))
                    .andExpect(jsonPath('$.firstName').value("Jane"))
                    .andExpect(jsonPath('$.lastName').value("Smith"))
                    .andExpect(jsonPath('$.enabled').value(true))
    }

    def "GET /api/user/{email} should return 404 when user does not exist"() {
        when: "requesting non-existent user"
            def response = mockMvc.perform(get("/api/user/nonexistent@example.com"))

        then: "404 is returned"
            response.andExpect(status().isNotFound())
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "PUT /api/user/{email} should update user profile successfully"() {
        given: "a valid update request"
            def requestBody = [
                    email: "existing@example.com",
                    firstName: "Updated",
                    lastName: "Name",
                    enabled: false
            ]

        when: "updating user profile"
            def response = mockMvc.perform(put("/api/user/existing@example.com")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(requestBody)))

        then: "user profile is updated"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath('$.email').value("existing@example.com"))
                    .andExpect(jsonPath('$.firstName').value("Updated"))
                    .andExpect(jsonPath('$.lastName').value("Name"))
                    .andExpect(jsonPath('$.enabled').value(false))
    }

    def "PUT /api/user/{email} should return 404 when updating non-existent user"() {
        given: "a valid update request"
            def requestBody = [
                    email: "nonexistent@example.com",
                    firstName: "Updated",
                    lastName: "Name",
                    enabled: false
            ]

        when: "updating non-existent user"
            def response = mockMvc.perform(put("/api/user/nonexistent@example.com")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(requestBody)))

        then: "404 is returned"
            response.andExpect(status().isNotFound())
    }

    def "PUT /api/user/{email} should return 400 when input is invalid"() {
        given: "an invalid update request"
            def requestBody = [
                    firstName: "a" * 51 // Exceeds max length of 50
            ]

        when: "updating user profile with invalid data"
            def response = mockMvc.perform(put("/api/user/existing@example.com")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(requestBody)))

        then: "400 is returned"
            response.andExpect(status().isBadRequest())
    }
}
