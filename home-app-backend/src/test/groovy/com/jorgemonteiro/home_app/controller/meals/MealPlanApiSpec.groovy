package com.jorgemonteiro.home_app.controller.meals

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListRepository
import com.jorgemonteiro.home_app.controller.meals.MealPlanController
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import java.time.LocalDate

import static org.hamcrest.Matchers.containsString
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("Meal Plan API Integration")
@Narrative("""
As a household member
I want to manage weekly meal plans via REST API
So that my family knows what to eat each day
""")
@SpringBootTest(classes = [HomeApplication])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@Subject(MealPlanController)
class MealPlanApiSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    UserRepository userRepository

    @Autowired
    ShoppingListRepository shoppingListRepository

    User testUser

    def setup() {
        testUser = userRepository.save(new User(
            email: "chef@example.com",
            firstName: "Master",
            lastName: "Chef",
            enabled: true
        ))
    }

    def "GET /api/meals/plans should return plan for specified date"() {
        given: "an authenticated user session"
            def auth = oauth2Login().attributes { it.put("email", testUser.email) }
            def dateStr = "2026-04-17"

        when: "requesting the meal plan for a specific date"
            def response = mockMvc.perform(get("/api/meals/plans")
                    .with(auth)
                    .param("date", dateStr))
            println "DEBUG MEAL PLAN JSON: " + response.andReturn().getResponse().getContentAsString()

        then: "response status is 200 OK"
            response.andExpect(status().isOk())

        and: "the returned plan week starts on the correct Monday"
            response.andExpect(jsonPath('$.weekStartDate').value(containsString("2026-04-13")))
            response.andExpect(jsonPath('$.status').value("PENDING"))
    }

    def "GET /api/meals/plans should default to today's date if parameter is missing"() {
        given: "an authenticated user session"
            def auth = oauth2Login().attributes { it.put("email", testUser.email) }

        when: "requesting the meal plan without the date parameter"
            def response = mockMvc.perform(get("/api/meals/plans")
                    .with(auth))

        then: "response status is 200 OK instead of 400 Bad Request"
            response.andExpect(status().isOk())

        and: "the returned plan is for the current week"
            String expectedMonday = LocalDate.now().with(java.time.DayOfWeek.MONDAY).toString()
            response.andExpect(jsonPath('$.weekStartDate').value(containsString(expectedMonday)))
    }

    def "POST /api/meals/plans/{id}/export should create a new list when targetListId is 0"() {
        given: "an authenticated user and a meal plan"
            def auth = oauth2Login().attributes { it.put("email", testUser.email) }
            def planJson = mockMvc.perform(get("/api/meals/plans").with(auth))
                    .andReturn().getResponse().getContentAsString()
            def planData = new groovy.json.JsonSlurper().parseText(planJson)
            def planId = planData.id

        and: "an empty list of items (for simplicity)"
            def itemsJson = "[]"

        when: "exporting to a new list"
            def response = mockMvc.perform(post("/api/meals/plans/$planId/export")
                    .with(auth)
                    .param("targetListId", "0")
                    .param("newListName", "My Test Export List")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(itemsJson))

        then: "response status is 200 OK"
            response.andExpect(status().isOk())

        and: "a new shopping list was created in the database"
            def lists = shoppingListRepository.findAll()
            lists.any { it.name == "My Test Export List" }
    }
}
