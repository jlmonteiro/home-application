package com.jorgemonteiro.home_app.service.shopping

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ValidationException
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO
import com.jorgemonteiro.home_app.repository.shopping.ShoppingCategoryRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import org.springframework.data.domain.PageRequest
import spock.lang.Subject

@SpringBootTest(classes = [HomeApplication])
@Transactional
class ShoppingCatalogServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    ShoppingCatalogService shoppingCatalogService

    @Autowired
    ShoppingCategoryRepository categoryRepository

    @Autowired
    ShoppingItemRepository itemRepository

    def "createCategory should save a new category successfully"() {
        given: "a new category DTO"
            def dto = new ShoppingCategoryDTO(name: "Groceries-${UUID.randomUUID()}", description: "Food and home items", icon: "basket")

        when: "creating the category"
            def result = shoppingCatalogService.createCategory(dto)

        then: "category is saved and returned with an ID"
            result.id != null
            result.name == dto.name
            categoryRepository.findById(result.id).isPresent()
    }

    def "updateCategory should modify an existing category"() {
        given: "an existing category"
            def category = shoppingCatalogService.createCategory(new ShoppingCategoryDTO(name: "Groceries-${UUID.randomUUID()}"))
            def updateDto = new ShoppingCategoryDTO(name: "Food-${UUID.randomUUID()}", description: "Updated")

        when: "updating the category"
            def result = shoppingCatalogService.updateCategory(category.id, updateDto)

        then: "category is updated"
            result.name == updateDto.name
            result.description == "Updated"
            categoryRepository.findByName(updateDto.name).isPresent()
    }

    def "deleteCategory should remove category and its items"() {
        given: "a category with an item"
            def category = shoppingCatalogService.createCategory(new ShoppingCategoryDTO(name: "Groceries-${UUID.randomUUID()}"))
            categoryRepository.flush()
            shoppingCatalogService.createItem(new ShoppingItemDTO(name: "Milk", category: new ShoppingItemDTO.Category(id: category.id)))

        when: "deleting the category"
            shoppingCatalogService.deleteCategory(category.id)

        then: "category and item are removed"
            !categoryRepository.existsById(category.id)
            // Note: existing seed data might have items, so we check if this specific item is gone
            !itemRepository.existsByNameAndCategoryId("Milk", category.id)
    }

    def "createItem should save a new item in a category successfully"() {
        given: "an existing category and a new item DTO"
            def category = shoppingCatalogService.createCategory(new ShoppingCategoryDTO(name: "Groceries-${UUID.randomUUID()}"))
            def dto = new ShoppingItemDTO(name: "Milk", category: new ShoppingItemDTO.Category(id: category.id))

        when: "creating the item"
            def result = shoppingCatalogService.createItem(dto)

        then: "item is saved and returned with correct category info"
            result.id != null
            result.name == "Milk"
            result.category.name == category.name
    }

    def "createItem should throw ValidationException when item already exists in the same category"() {
        given: "a category with an existing item"
            def category = shoppingCatalogService.createCategory(new ShoppingCategoryDTO(name: "Groceries-${UUID.randomUUID()}"))
            shoppingCatalogService.createItem(new ShoppingItemDTO(name: "Milk", category: new ShoppingItemDTO.Category(id: category.id)))

        when: "creating the same item again"
            shoppingCatalogService.createItem(new ShoppingItemDTO(name: "Milk", category: new ShoppingItemDTO.Category(id: category.id)))

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "findAllCategories should return paginated categories"() {
        given: "initial category count"
            def initialCount = categoryRepository.count()
        and: "multiple new categories"
            (1..15).each {
                shoppingCatalogService.createCategory(new ShoppingCategoryDTO(name: "Category-${UUID.randomUUID()}"))
            }

        when: "fetching first page"
            def page = shoppingCatalogService.findAllCategories(PageRequest.of(0, 10))

        then: "10 items are returned and total elements matches initial + new"
            page.content.size() == 10
            page.totalElements == initialCount + 15
    }

    def "findAllItems should return paginated items"() {
        given: "initial item count"
            def initialCount = itemRepository.count()
        and: "multiple new items"
            def category = shoppingCatalogService.createCategory(new ShoppingCategoryDTO(name: "Groceries-${UUID.randomUUID()}"))
            (1..15).each {
                shoppingCatalogService.createItem(new ShoppingItemDTO(name: "Item-${UUID.randomUUID()}", category: new ShoppingItemDTO.Category(id: category.id)))
            }

        when: "fetching first page of items"
            def page = shoppingCatalogService.findAllItems(PageRequest.of(0, 10))

        then: "10 items are returned and total elements matches initial + new"
            page.content.size() == 10
            page.totalElements == initialCount + 15
    }
}
