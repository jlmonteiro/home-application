package com.jorgemonteiro.home_app.service.shopping

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.exception.ValidationException
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemPriceHistoryRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

import static com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus.COMPLETED
import static com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus.PENDING

@Title("Shopping List Service")
@Narrative("""
As a household member
I want to manage shopping lists and their items
So that I can plan and track my shopping trips
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShoppingListServiceSpec extends BaseIntegrationTest {

    @Autowired
    ShoppingListService listService

    @Autowired
    ShoppingCatalogService catalogService

    @Autowired
    ShoppingListRepository listRepository

    @Autowired
    ShoppingItemPriceHistoryRepository priceHistoryRepository

    // --- List CRUD ---

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "createList should save a new list for an existing user"() {
        given: "a list DTO"
            def dto = new ShoppingListDTO(name: "Weekly groceries")

        when: "creating the list"
            def result = listService.createList(dto, "existing@example.com")

        then: "list is saved with correct data"
            result.id != null
            result.name == "Weekly groceries"
            result.status == PENDING
            result.createdBy == "existing@example.com"
    }

    def "createList should throw ObjectNotFoundException for unknown user"() {
        when: "creating a list for a non-existent user"
            listService.createList(new ShoppingListDTO(name: "Test"), "nobody@example.com")

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getList should return list by ID"() {
        given: "a list exists"
            def list = listService.createList(new ShoppingListDTO(name: "Test"), "existing@example.com")

        when: "getting the list"
            def result = listService.getList(list.id)

        then: "list is returned"
            result.name == "Test"
    }

    def "getList should throw ObjectNotFoundException for non-existent ID"() {
        when: "getting a non-existent list"
            listService.getList(999999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateList should update name and description"() {
        given: "an existing list"
            def list = listService.createList(new ShoppingListDTO(name: "Old"), "existing@example.com")

        when: "updating the list"
            def result = listService.updateList(list.id, new ShoppingListDTO(name: "New", description: "Updated"))

        then: "list is updated"
            result.name == "New"
            result.description == "Updated"
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateList should set completedAt when status changes to COMPLETED"() {
        given: "an existing list"
            def list = listService.createList(new ShoppingListDTO(name: "Completable"), "existing@example.com")

        when: "marking as completed"
            def result = listService.updateList(list.id, new ShoppingListDTO(name: "Completable", status: COMPLETED))

        then: "status and completedAt are set"
            result.status == COMPLETED
            result.completedAt != null
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "deleteList should remove list"() {
        given: "an existing list"
            def list = listService.createList(new ShoppingListDTO(name: "Deletable"), "existing@example.com")

        when: "deleting the list"
            listService.deleteList(list.id)

        then: "list no longer exists"
            !listRepository.existsById(list.id)
    }

    // --- List Items ---

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "addItemToList should add item and record price history"() {
        given: "a list, category, and item"
            def list = listService.createList(new ShoppingListDTO(name: "Test"), "existing@example.com")
            def category = catalogService.createCategory(new ShoppingCategoryDTO(name: "ListTestCat-${UUID.randomUUID()}"))
            def item = catalogService.createItem(new ShoppingItemDTO(name: "Milk", categoryId: category.id))

        and: "a list item DTO with price and unit"
            def dto = new ShoppingListItemDTO(itemId: item.id, quantity: 2.0, unit: "pcs", price: 1.99)

        when: "adding item to list"
            def result = listService.addItemToList(list.id, dto)

        then: "item is added"
            result.id != null
            result.itemName == "Milk"
            result.quantity == 2.0

        and: "price history is recorded"
            !priceHistoryRepository.findAllByItemIdOrderByRecordedAtDesc(item.id).isEmpty()
    }

    def "addItemToList should throw ValidationException when itemId is null"() {
        when: "adding item without itemId"
            listService.addItemToList(1L, new ShoppingListItemDTO(quantity: 1.0))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "addItemToList should throw ValidationException when quantity is null"() {
        when: "adding item without quantity"
            listService.addItemToList(1L, new ShoppingListItemDTO(itemId: 1L))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateListItem should update quantity and mark as bought"() {
        given: "a list with an item"
            def list = listService.createList(new ShoppingListDTO(name: "Test"), "existing@example.com")
            def category = catalogService.createCategory(new ShoppingCategoryDTO(name: "UpdItemCat-${UUID.randomUUID()}"))
            def item = catalogService.createItem(new ShoppingItemDTO(name: "Bread", categoryId: category.id))
            def listItem = listService.addItemToList(list.id, new ShoppingListItemDTO(itemId: item.id, quantity: 1.0, unit: "pcs"))

        when: "updating the list item"
            def result = listService.updateListItem(listItem.id, new ShoppingListItemDTO(quantity: 3.0, bought: true))

        then: "item is updated"
            result.quantity == 3.0
            result.bought == true
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "removeListItem should delete the item"() {
        given: "a list with an item"
            def list = listService.createList(new ShoppingListDTO(name: "Test"), "existing@example.com")
            def category = catalogService.createCategory(new ShoppingCategoryDTO(name: "RemItemCat-${UUID.randomUUID()}"))
            def item = catalogService.createItem(new ShoppingItemDTO(name: "Butter", categoryId: category.id))
            def listItem = listService.addItemToList(list.id, new ShoppingListItemDTO(itemId: item.id, quantity: 1.0, unit: "pcs"))

        when: "removing the item"
            listService.removeListItem(listItem.id)

        and: "trying to remove it again"
            listService.removeListItem(listItem.id)

        then: "it no longer exists"
            thrown(ObjectNotFoundException)
    }

    // --- Price Suggestions ---

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "suggestPrice should return latest price for item"() {
        given: "a list item with a recorded price"
            def list = listService.createList(new ShoppingListDTO(name: "Test"), "existing@example.com")
            def category = catalogService.createCategory(new ShoppingCategoryDTO(name: "PriceCat-${UUID.randomUUID()}"))
            def item = catalogService.createItem(new ShoppingItemDTO(name: "Eggs", categoryId: category.id))
            listService.addItemToList(list.id, new ShoppingListItemDTO(itemId: item.id, quantity: 1.0, unit: "pcs", price: 2.49))

        when: "suggesting a price"
            def result = listService.suggestPrice(item.id, null)

        then: "latest price is returned"
            result == 2.49
    }

    def "suggestPrice should return null when no history exists"() {
        when: "suggesting price for item with no history"
            def result = listService.suggestPrice(999999L, null)

        then: "null is returned"
            result == null
    }
}
