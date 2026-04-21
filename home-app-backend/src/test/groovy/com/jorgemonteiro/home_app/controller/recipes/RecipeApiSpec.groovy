package com.jorgemonteiro.home_app.controller.recipes

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.recipes.RecipeService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import groovy.json.JsonOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import static org.hamcrest.Matchers.hasItem
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("Recipe API Integration")
@Narrative("""
As a household member
I want to manage recipes via REST API
So that I can build a shared cookbook
""")
@SpringBootTest(classes = [HomeApplication])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Subject(RecipeController)
class RecipeApiSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    UserRepository userRepository

    User testUser

    def setup() {
        testUser = userRepository.save(new User(
            email: "chef@example.com",
            firstName: "Master",
            lastName: "Chef",
            enabled: true
        ))
    }

    def "should create and retrieve a recipe"() {
        given: "a new recipe JSON"
            def recipeJson = JsonOutput.toJson([
                name: "Pasta Carbonara",
                description: "Authentic Italian recipe.",
                servings: 2,
                prepTimeMinutes: 20
            ])

        when: "posting to recipes endpoint"
            def createResponse = mockMvc.perform(post("/api/recipes")
                    .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                        .attributes(attrs -> attrs.put("email", testUser.email)))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(recipeJson))

        then: "recipe is created"
            createResponse.andExpect(status().isCreated())
                .andExpect(jsonPath('$.name').value("Pasta Carbonara"))
                .andExpect(jsonPath('$.creator.name').value("Master Chef"))

        when: "getting the recipe by ID"
            Long id = createResponse.andReturn().getResponse().getContentAsString().with {
                new groovy.json.JsonSlurper().parseText(it).id
            }
            def getResponse = mockMvc.perform(get("/api/recipes/$id")
                    .accept("application/hal+json"))

        then: "recipe details are returned"
            getResponse.andExpect(status().isOk())
                .andExpect(jsonPath('$.name').value("Pasta Carbonara"))
                .andExpect(jsonPath('$._links.self.href').exists())
    }

    def "should update an existing recipe"() {
        given: "an existing recipe"
            def recipeJson = JsonOutput.toJson([
                name: "Tacos",
                servings: 1,
                prepTimeMinutes: 10
            ])
            def id = mockMvc.perform(post("/api/recipes")
                    .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                        .attributes(attrs -> attrs.put("email", testUser.email)))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(recipeJson))
                    .andReturn().getResponse().getContentAsString().with {
                        new groovy.json.JsonSlurper().parseText(it).id
                    }

        when: "updating the recipe"
            def updatedJson = JsonOutput.toJson([
                name: "Fish Tacos",
                servings: 4,
                prepTimeMinutes: 30
            ])
            def updateResponse = mockMvc.perform(put("/api/recipes/$id")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(updatedJson))

        then: "recipe is updated"
            updateResponse.andExpect(status().isOk())
                .andExpect(jsonPath('$.name').value("Fish Tacos"))
                .andExpect(jsonPath('$.servings').value(4))
    }

    def "should delete a recipe"() {
        given: "an existing recipe"
            def recipeJson = JsonOutput.toJson([name: "Cake", servings: 1, prepTimeMinutes: 60])
            def id = mockMvc.perform(post("/api/recipes")
                    .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                        .attributes(attrs -> attrs.put("email", testUser.email)))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(recipeJson))
                    .andReturn().getResponse().getContentAsString().with {
                        new groovy.json.JsonSlurper().parseText(it).id
                    }

        when: "deleting the recipe"
            def deleteResponse = mockMvc.perform(delete("/api/recipes/$id"))

        then: "204 No Content is returned"
            deleteResponse.andExpect(status().isNoContent())

        and: "recipe no longer exists"
            mockMvc.perform(get("/api/recipes/$id")).andExpect(status().isNotFound())
    }

    def "should return 400 for invalid recipe data"() {
        given: "invalid recipe JSON (blank name)"
            def invalidJson = JsonOutput.toJson([name: "", servings: 0])

        when: "posting to recipes endpoint"
            def response = mockMvc.perform(post("/api/recipes")
                    .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                        .attributes(attrs -> attrs.put("email", testUser.email)))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson))

        then: "bad request is returned"
            response.andExpect(status().isBadRequest())
                .andExpect(jsonPath('$.title').value("Constraint Violation"))
    }
}
