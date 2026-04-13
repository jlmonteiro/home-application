package com.jorgemonteiro.home_app.controller.profiles

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.dtos.profiles.AgeGroupConfigDTO
import com.jorgemonteiro.home_app.repository.profiles.AgeGroupConfigRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Title("Settings API Integration")
@Narrative("""
As a system,
I want to restrict access to household settings to Adult users only,
so that children and teenagers cannot modify family configurations.
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class SettingsApiSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    AgeGroupConfigRepository ageGroupConfigRepository

    def "should allow Adult to retrieve age groups"() {
        when: "an Adult user requests age groups"
            def response = mockMvc.perform(get("/api/settings/age-groups")
                    .with(user("adult").roles("ADULT")))

        then: "access is granted"
            response.andExpect(status().isOk())
    }

    def "should deny access to Child for retrieving age groups"() {
        when: "a Child user requests age groups"
            def response = mockMvc.perform(get("/api/settings/age-groups")
                    .with(user("child").roles("CHILD")))

        then: "access is forbidden"
            response.andExpect(status().isForbidden())
    }

    def "should allow Adult to update age groups"() {
        given: "a valid age group configuration update"
            def child = ageGroupConfigRepository.findByName("Child").get()
            def teen = ageGroupConfigRepository.findByName("Teenager").get()
            def adult = ageGroupConfigRepository.findByName("Adult").get()
            
            def updates = [
                [id: child.id, name: "Child", minAge: 0, maxAge: 11],
                [id: teen.id, name: "Teenager", minAge: 12, maxAge: 17],
                [id: adult.id, name: "Adult", minAge: 18, maxAge: 120]
            ]

        when: "an Adult user updates age groups"
            def response = mockMvc.perform(put("/api/settings/age-groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(JsonOutput.toJson(updates))
                    .with(user("adult").roles("ADULT")))

        then: "update is successful"
            response.andExpect(status().isNoContent())
            
        and: "database reflects new ranges"
            ageGroupConfigRepository.findByName("Teenager").get().minAge == 12
    }

    def "should deny access to Teenager for updating age groups"() {
        when: "a Teenager user attempts to update age groups"
            def response = mockMvc.perform(put("/api/settings/age-groups")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("[]")
                    .with(user("teen").roles("TEENAGER")))

        then: "access is forbidden"
            response.andExpect(status().isForbidden())
    }
}
