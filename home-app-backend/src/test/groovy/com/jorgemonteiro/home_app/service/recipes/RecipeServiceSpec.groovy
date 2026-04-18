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
@Subject(RecipeService)
class RecipeServiceSpec extends BaseIntegrationTest {

    @Autowired
    RecipeService recipeService

    @Autowired
    RecipeRepository recipeRepository

    @Autowired
    ShoppingItemRepository itemRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "listAllRecipes should return filtered recipes"() {
        when: "searching for 'Integration'"
            def result = recipeService.listAllRecipes("Integration", null, PageRequest.of(0, 10))

        then: "Integration Test Pancakes are found"
            result.content.any { it.name == "Integration Test Pancakes" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getRecipeById should return recipe with correctly calculated nutrition"() {
        given: "the test recipe ID"
            def recipeId = recipeRepository.findAll().find { it.getName() == "Integration Test Pancakes" }.getId()

        when: "fetching existing Pancakes recipe"
            def result = recipeService.getRecipeById(recipeId)

        then: "recipe details are correct"
            result.name == "Integration Test Pancakes"
            result.ingredients.size() == 2

        and: "nutrition is calculated correctly"
            def energy = result.nutritionTotals.find { it.nutrient.name == "Energy" }
            energy.value.compareTo(new BigDecimal("884.00")) == 0
            
            def protein = result.nutritionTotals.find { it.nutrient.name == "Protein" }
            protein.value.compareTo(new BigDecimal("33.24")) == 0
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "createRecipe should save a complex recipe graph"() {
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

        then: "recipe is saved"
            result.id != null
            result.name == "Fried Egg"
            result.nutritionTotals.find { it.nutrient.name == "Energy" }.value.compareTo(new BigDecimal("78.00")) == 0
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "updateRecipe should modify existing recipe components"() {
        given: "an updated recipe DTO for existing Pancakes"
            def recipeId = recipeRepository.findAll().find { it.getName() == "Integration Test Pancakes" }.getId()
            def existing = recipeService.getRecipeById(recipeId)
            existing.setName("Updated Pancakes")
            existing.getIngredients().get(0).setQuantity(300.0) 

        when: "updating the recipe"
            def result = recipeService.updateRecipe(recipeId, existing)

        then: "updates are applied"
            result.name == "Updated Pancakes"
            result.ingredients[0].quantity == 300.0
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "deleteRecipe should remove recipe"() {
        given: "the test recipe ID"
            def recipeId = recipeRepository.findAll().find { it.getName() == "Integration Test Pancakes" }.getId()

        when: "deleting the recipe"
            recipeService.deleteRecipe(recipeId)

        then: "recipe is gone"
            !recipeRepository.existsById(recipeId)
    }

    def "getRecipeById should throw ObjectNotFoundException for invalid ID"() {
        when:
            recipeService.getRecipeById(99999L)
        then:
            thrown(ObjectNotFoundException)
    }
}
