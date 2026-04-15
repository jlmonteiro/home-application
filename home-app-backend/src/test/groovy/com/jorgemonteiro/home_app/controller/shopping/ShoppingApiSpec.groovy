package com.jorgemonteiro.home_app.controller.shopping

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO
import com.jorgemonteiro.home_app.service.shopping.ShoppingCatalogService
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

import static org.hamcrest.Matchers.hasItem
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@Title("Shopping API Integration")
@Narrative("""
As a household member
I want to manage categories and items via REST API
So that I can use the shopping list module
""")
@SpringBootTest(classes = [HomeApplication])
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ShoppingApiSpec extends BaseIntegrationTest {

    @Autowired
    MockMvc mockMvc

    @Autowired
    ShoppingCatalogService shoppingService

    def "should create and retrieve a category"() {
        given: "a new category JSON"
            String categoryName = "Groceries-${UUID.randomUUID()}"
            def categoryJson = JsonOutput.toJson([name: categoryName, description: "Food stuff", icon: "basket"])

        when: "posting to categories endpoint"
            def createResponse = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(categoryJson))

        then: "category is created"
            createResponse.andExpect(status().isCreated())
                .andExpect(jsonPath('$.name').value(categoryName))

        when: "listing all categories"
            def listResponse = mockMvc.perform(get("/api/shopping/categories")
                    .accept("application/hal+json"))

        then: "new category is in the list"
            listResponse.andExpect(status().isOk())
                .andExpect(jsonPath('$._embedded.categories[*].name').value(hasItem(categoryName)))
    }

    def "should create an item in a category"() {
        given: "an existing category"
            String categoryName = "Category-${UUID.randomUUID()}"
            def category = shoppingService.createCategory(new ShoppingCategoryDTO(name: categoryName))
            def itemJson = JsonOutput.toJson([name: "Milk", category: [id: category.id]])

        when: "posting to items endpoint"
            def createResponse = mockMvc.perform(post("/api/shopping/items")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(itemJson))

        then: "item is created"
            createResponse.andExpect(status().isCreated())
                .andExpect(jsonPath('$.name').value("Milk"))
                .andExpect(jsonPath('$.category.name').value(categoryName))
    }

    def "should return 400 for duplicate category name"() {
        given: "an existing category"
            String categoryName = "UniqueCat-${UUID.randomUUID()}"
            shoppingService.createCategory(new ShoppingCategoryDTO(name: categoryName))
            def duplicateJson = JsonOutput.toJson([name: categoryName])

        when: "posting duplicate category"
            def response = mockMvc.perform(post("/api/shopping/categories")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(duplicateJson))

        then: "bad request is returned with Validation Error title"
            response.andExpect(status().isBadRequest())
                .andExpect(jsonPath('$.title').value("Validation Error"))
    }
}
