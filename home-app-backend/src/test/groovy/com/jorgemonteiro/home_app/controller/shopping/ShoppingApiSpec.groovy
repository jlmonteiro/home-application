package com.jorgemonteiro.home_app.controller.shopping

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO
import com.jorgemonteiro.home_app.service.shopping.ShoppingService
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("Shopping API Integration")
@Narrative("""
As a household member
I want to manage categories and items via REST API
So that I can use the shopping list module
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
class ShoppingApiSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    ShoppingService shoppingService

    def "should create and retrieve a category"() {
        given: "a category request"
            def categoryJson = JsonOutput.toJson([name: "Groceries", description: "Food"])

        when: "posting to categories endpoint"
            def createResponse = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(categoryJson)
                    .with(user("user")))

        then: "category is created"
            createResponse.andExpect(status().isCreated())
                .andExpect(jsonPath('$.name').value("Groceries"))
                .andExpect(jsonPath('$._links.self.href').exists())

        when: "retrieving all categories"
            def listResponse = mockMvc.perform(get("/api/shopping/categories")
                    .with(user("user")))

        then: "new category is in the list"
            listResponse.andExpect(status().isOk())
                .andExpect(jsonPath('$._embedded.categories[0].name').value("Groceries"))
    }

    def "should create an item in a category"() {
        given: "an existing category"
            def category = shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            def itemJson = JsonOutput.toJson([name: "Milk", categoryId: category.id])

        when: "posting to items endpoint"
            def createResponse = mockMvc.perform(post("/api/shopping/items")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(itemJson)
                    .with(user("user")))

        then: "item is created"
            createResponse.andExpect(status().isCreated())
                .andExpect(jsonPath('$.name').value("Milk"))
                .andExpect(jsonPath('$.categoryName').value("Groceries"))
    }

    def "should return 400 for duplicate category name"() {
        given: "an existing category"
            shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            def duplicateJson = JsonOutput.toJson([name: "Groceries"])

        when: "posting duplicate category"
            def response = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(duplicateJson)
                    .with(user("user")))

        then: "bad request is returned with Validation Error title"
            response.andExpect(status().isBadRequest())
                .andExpect(jsonPath('$.title').value("Validation Error"))
    }
}
