package com.jorgemonteiro.home_app.service.meals

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO
import com.jorgemonteiro.home_app.model.entities.meals.MealPlan
import com.jorgemonteiro.home_app.model.entities.meals.MealPlanStatus
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.model.entities.recipes.Recipe
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeIngredient
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingList
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListItem
import com.jorgemonteiro.home_app.repository.meals.MealPlanRepository
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.repository.recipes.RecipeIngredientRepository
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListItemRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingStoreRepository
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import java.math.BigDecimal

@Title("Meal Plan Export Service")
@Narrative("""
As a user
I want to export meal plan ingredients to shopping lists
So that I can easily shop for the ingredients I need
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
@Subject(MealPlanExportService)
class MealPlanExportServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    MealPlanExportService service

    @Autowired
    MealPlanRepository mealPlanRepository

    @Autowired
    ShoppingListRepository shoppingListRepository

    @Autowired
    ShoppingListItemRepository shoppingListItemRepository

    @Autowired
    ShoppingItemRepository shoppingItemRepository

    @Autowired
    ShoppingStoreRepository storeRepository

    @Autowired
    UserRepository userRepository

    @Autowired
    RecipeRepository recipeRepository

    @Autowired
    RecipeIngredientRepository recipeIngredientRepository

    @Autowired
    PhotoService photoService

    @Sql("/scripts/sql/meal-plan-export-test-data.sql")
    def "should get export preview for meal plan"() {
        when: "getting export preview"
            def plan = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 25)).get()
            def preview = service.getExportPreview(plan.id, null)

        then: "ingredients are aggregated correctly"
            preview.size() == 2

            def flourItem = preview.find { it.itemName == "Flour" }
            flourItem != null
            flourItem.quantity == new BigDecimal("200")

            def eggsItem = preview.find { it.itemName == "Eggs" }
            eggsItem != null
            eggsItem.quantity == new BigDecimal("2")
    }

    @Sql("/scripts/sql/meal-plan-export-test-data.sql")
    def "should get export preview with existing items"() {
        given: "an existing shopping list with items"
            def user = userRepository.findByEmail("export-test@example.com").get()
            def flourItem = shoppingItemRepository.findByName("Flour")
            def list = new ShoppingList(
                name: "Test List",
                status: ShoppingListStatus.PENDING,
                createdBy: user
            )
            list = shoppingListRepository.save(list)

            def existingItem = new ShoppingListItem(
                list: list,
                item: flourItem,
                quantity: new BigDecimal("100"),
                bought: false
            )
            shoppingListItemRepository.save(existingItem)

        when: "getting export preview with existing items"
            def plan = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 25)).get()
            def preview = service.getExportPreview(plan.id, list.id)

        then: "existing quantities are included"
            def flourItemPreview = preview.find { it.itemName == "Flour" }
            flourItemPreview != null
            flourItemPreview.quantity == new BigDecimal("200")
            flourItemPreview.existingQuantity == new BigDecimal("100")
    }

    def "should throw exception for non-existent meal plan"() {
        when: "getting export preview for non-existent plan"
            service.getExportPreview(999L, null)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    @Sql("/scripts/sql/meal-plan-export-test-data.sql")
    def "should export to new shopping list"() {
        when: "exporting to new list"
            def plan = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 25)).get()
            def flourItem = shoppingItemRepository.findByName("Flour")
            def dto = new MealPlanExportItemDTO(
                itemId: flourItem.id,
                itemName: "Flour",
                quantity: new BigDecimal("200"),
                unit: "g",
                existingQuantity: BigDecimal.ZERO
            )
            def user = userRepository.findByEmail("export-test@example.com").get()
            service.exportToList(plan.id, null, [dto], "New List", user.email)

        then: "new shopping list is created with items"
            def lists = shoppingListRepository.findAll()
            def newList = lists.find { it.name == "New List" }
            newList != null
            newList.status == ShoppingListStatus.PENDING

            def listItems = shoppingListItemRepository.findAllByListId(newList.id)
            listItems.size() == 1
            listItems[0].item.name == "Flour"
            listItems[0].quantity == new BigDecimal("200")
    }

    @Sql("/scripts/sql/meal-plan-export-test-data.sql")
    def "should export to existing shopping list"() {
        given: "an existing shopping list"
            def user = userRepository.findByEmail("export-test@example.com").get()
            def flourItem = shoppingItemRepository.findByName("Flour")
            def list = new ShoppingList(
                name: "Existing List",
                status: ShoppingListStatus.PENDING,
                createdBy: user
            )
            list = shoppingListRepository.save(list)

            def existingItem = new ShoppingListItem(
                list: list,
                item: flourItem,
                quantity: new BigDecimal("100"),
                bought: false
            )
            shoppingListItemRepository.save(existingItem)

        when: "exporting to existing list"
            def plan = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 25)).get()
            def dto = new MealPlanExportItemDTO(
                itemId: flourItem.id,
                itemName: "Flour",
                quantity: new BigDecimal("200"),
                unit: "g",
                existingQuantity: BigDecimal.ZERO
            )
            service.exportToList(plan.id, list.id, [dto], null, user.email)

        then: "existing list is updated with new items"
            def listItems = shoppingListItemRepository.findAllByListId(list.id)
            listItems.size() == 1
            listItems[0].quantity == new BigDecimal("300")
    }

    def "should throw exception for non-existent shopping list"() {
        given: "a non-existent list id"
            def dto = new MealPlanExportItemDTO(
                itemId: 1L,
                itemName: "Test",
                quantity: BigDecimal.ONE,
                unit: "pcs",
                existingQuantity: BigDecimal.ZERO
            )

        when: "exporting to non-existent list"
            service.exportToList(1L, 999L, [dto], null, "test@example.com")

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "should throw exception for non-existent user"() {
        given: "a meal plan"
            def plan = new MealPlan(weekStartDate: LocalDate.of(2026, 4, 25), status: MealPlanStatus.PENDING)
            plan = mealPlanRepository.save(plan)

        when: "exporting with non-existent user"
            def dto = new MealPlanExportItemDTO(
                itemId: 1L,
                itemName: "Test",
                quantity: BigDecimal.ONE,
                unit: "pcs",
                existingQuantity: BigDecimal.ZERO
            )
            service.exportToList(plan.id, null, [dto], "New List", "nonexistent@example.com")

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }
}
