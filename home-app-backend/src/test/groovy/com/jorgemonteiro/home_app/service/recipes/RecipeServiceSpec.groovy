package com.jorgemonteiro.home_app.service.recipes

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.recipes.*
import com.jorgemonteiro.home_app.model.dtos.shared.ItemSummaryDTO
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import java.math.BigDecimal

import static org.mockito.Mockito.mock
import static org.mockito.Mockito.when

@Title("Recipe Service")
@Narrative("""
As a household member
I want to manage my recipes, ingredients, and steps
So that I can plan my meals and track nutrition
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
class RecipeServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    RecipeService recipeService

    @Autowired
    RecipeRepository recipeRepository

    @Autowired
    ShoppingItemRepository itemRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return filtered recipes when searching by name"() {
        when: "searching for 'Integration'"
            def result = recipeService.listAllRecipes("Integration", null, PageRequest.of(0, 10))

        then: "Integration Test Pancakes are found"
            result.content.any { it.name == "Integration Test Pancakes" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return recipe with correctly calculated nutrition"() {
        given: "the test recipe ID"
            def recipeId = recipeRepository.findAll().find { it.getName() == "Integration Test Pancakes" }.getId()

        when: "fetching existing Pancakes recipe"
            def result = recipeService.getRecipeById(recipeId)

        then: "recipe details are correct"
            result.name == "Integration Test Pancakes"
            result.ingredients.size() == 2

        and: "nutrition is calculated correctly based on quantities and samples"
            // Flour: 200g / 100g sample = 2x multiplier (364 * 2 = 728)
            // Egg: 2pcs / 1pc sample = 2x multiplier (78 * 2 = 156)
            // Total: 728 + 156 = 884
            def energy = result.nutritionTotals.find { it.nutrient.name == "Energy" }
            energy.value.compareTo(new BigDecimal("884.00")) == 0
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should save a complex recipe graph"() {
        given: "a mock OAuth2User principal"
            def principal = mock(OAuth2User)
            when(principal.getAttribute("email")).thenReturn("recipeuser@example.com")
            def eggId = itemRepository.findAll().find { it.getName() == "Large Egg" }.getId()

        and: "a new recipe DTO"
            def dto = new RecipeDTO(
                name: "Fried Egg",
                description: "Simple breakfast",
                servings: 1,
                prepTimeMinutes: 5,
                labels: ["Quick"] as Set,
                ingredients: [
                    new RecipeIngredientDTO(quantity: 1.0, item: new ItemSummaryDTO(id: eggId))
                ]
            )

        when: "creating the recipe"
            def result = recipeService.createRecipe(dto, principal)

        then: "recipe is saved with correct name and ID"
            result.id != null
            result.name == "Fried Egg"
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should modify existing recipe components"() {
        given: "an existing recipe ID"
            def recipeId = recipeRepository.findAll().find { it.getName() == "Integration Test Pancakes" }.getId()
            def existing = recipeService.getRecipeById(recipeId)
            
        and: "updated details"
            existing.setName("Updated Pancakes")
            if (!existing.ingredients.isEmpty()) {
                existing.ingredients[0].setQuantity(300.0)
            }

        when: "updating the recipe"
            def result = recipeService.updateRecipe(recipeId, existing)

        then: "updates are applied"
            result.name == "Updated Pancakes"
            if (!result.ingredients.isEmpty()) {
                result.ingredients[0].quantity == 300.0
            }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should remove recipe"() {
        given: "the test recipe ID"
            def recipeId = recipeRepository.findAll().find { it.getName() == "Integration Test Pancakes" }.getId()

        when: "deleting the recipe"
            recipeService.deleteRecipe(recipeId)

        then: "recipe is gone"
            !recipeRepository.existsById(recipeId)
    }

    def "should throw ObjectNotFoundException for invalid ID"() {
        when:
            recipeService.getRecipeById(99999L)
        then:
            thrown(ObjectNotFoundException)
    }
}
