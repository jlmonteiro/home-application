package com.jorgemonteiro.home_app.service.shopping

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.exception.ValidationException
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO
import com.jorgemonteiro.home_app.repository.shopping.ShoppingCategoryRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

@Title("ShoppingService")
@Narrative("""
As a household member
I want to manage shopping categories and items
So that I can organize my shopping needs
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShoppingServiceSpec extends BaseIntegrationTest {

    @Autowired
    ShoppingService shoppingService

    @Autowired
    ShoppingCategoryRepository categoryRepository

    @Autowired
    ShoppingItemRepository itemRepository

    def "createCategory should save a new category successfully"() {
        given: "a new category DTO"
            def dto = new ShoppingCategoryDTO(name: "Groceries", description: "Food and drinks")

        when: "creating the category"
            def result = shoppingService.createCategory(dto)

        then: "category is saved and returned with an ID"
            result.id != null
            result.name == "Groceries"
            categoryRepository.existsByName("Groceries")
    }

    def "createCategory should throw ValidationException when name already exists"() {
        given: "an existing category"
            shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            def duplicateDto = new ShoppingCategoryDTO(name: "Groceries")

        when: "creating a duplicate category"
            shoppingService.createCategory(duplicateDto)

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "updateCategory should update existing category successfully"() {
        given: "an existing category"
            def created = shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            def updateDto = new ShoppingCategoryDTO(name: "Food", description: "Updated")

        when: "updating the category"
            def result = shoppingService.updateCategory(created.id, updateDto)

        then: "category is updated"
            result.name == "Food"
            result.description == "Updated"
            categoryRepository.findByName("Food").isPresent()
    }

    def "deleteCategory should remove category and its items"() {
        given: "a category with an item"
            def category = shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            categoryRepository.flush() // Ensure it's in DB
            shoppingService.createItem(new ShoppingItemDTO(name: "Milk", categoryId: category.id))

        when: "deleting the category"
            shoppingService.deleteCategory(category.id)

        then: "category and item are removed"
            !categoryRepository.existsById(category.id)
            itemRepository.findAll().isEmpty()
    }

    def "createItem should save a new item in a category successfully"() {
        given: "an existing category and a new item DTO"
            def category = shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            def dto = new ShoppingItemDTO(name: "Milk", categoryId: category.id)

        when: "creating the item"
            def result = shoppingService.createItem(dto)

        then: "item is saved and returned with correct category info"
            result.id != null
            result.name == "Milk"
            result.categoryId == category.id
            result.categoryName == "Groceries"
    }

    def "createItem should throw ValidationException when item already exists in the same category"() {
        given: "a category and an existing item"
            def category = shoppingService.createCategory(new ShoppingCategoryDTO(name: "Groceries"))
            shoppingService.createItem(new ShoppingItemDTO(name: "Milk", categoryId: category.id))
            def duplicateDto = new ShoppingItemDTO(name: "Milk", categoryId: category.id)

        when: "creating a duplicate item"
            shoppingService.createItem(duplicateDto)

        then: "ValidationException is thrown"
            thrown(ValidationException)
    }

    def "findAllCategories should return paginated categories"() {
        given: "multiple categories"
            shoppingService.createCategory(new ShoppingCategoryDTO(name: "A"))
            shoppingService.createCategory(new ShoppingCategoryDTO(name: "B"))

        when: "finding all categories"
            def result = shoppingService.findAllCategories(PageRequest.of(0, 10))

        then: "correct page of categories is returned"
            result.totalElements >= 2
    }
}
