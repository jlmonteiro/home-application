package com.jorgemonteiro.home_app.service.shopping

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.exception.ValidationException
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem
import com.jorgemonteiro.home_app.repository.shopping.ShoppingCategoryRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.PageRequest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

@Title("Shopping Catalog Service")
@Narrative("""
As a household member
I want to manage shopping categories and items
So that I can maintain an organized shopping list
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
class ShoppingCatalogServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    ShoppingCatalogService catalogService

    @Autowired
    ShoppingCategoryRepository categoryRepository

    @Autowired
    ShoppingItemRepository itemRepository

    def "should find all categories with pagination"() {
        when: "requesting all categories"
            def result = catalogService.findAllCategories(PageRequest.of(0, 10))

        then: "categories are returned"
            result.totalElements >= 0
    }

    def "should get a category by ID"() {
        given: "a category exists"
            def category = categoryRepository.save(new ShoppingCategory(name: "Test Category", description: "Test"))

        when: "requesting the category"
            def result = catalogService.getCategory(category.id)

        then: "category is returned"
            result.name == "Test Category"
    }

    def "should throw ObjectNotFoundException when category not found"() {
        when: "requesting non-existent category"
            catalogService.getCategory(999L)
        then: "exception is thrown"
            thrown(ObjectNotFoundException)
    }

    def "should create a new category"() {
        given: "a new category DTO"
            def initialCount = categoryRepository.count()
            def dto = new ShoppingCategoryDTO(name: "New Category", description: "New description")

        when: "creating the category"
            def result = catalogService.createCategory(dto)

        then: "category is created"
            categoryRepository.count() == initialCount + 1
            result.name == "New Category"
    }

    def "should throw ValidationException when category name already exists"() {
        given: "a category exists"
            categoryRepository.save(new ShoppingCategory(name: "Existing", description: "Test"))

        when: "trying to create duplicate category"
            catalogService.createCategory(new ShoppingCategoryDTO(name: "Existing", description: "Test"))
        then: "exception is thrown"
            thrown(ValidationException)
    }

    def "should update a category"() {
        given: "an existing category"
            def category = categoryRepository.save(new ShoppingCategory(name: "Old Name", description: "Old"))

        when: "updating the category"
            def result = catalogService.updateCategory(category.id, new ShoppingCategoryDTO(name: "New Name", description: "New", icon: "icon"))

        then: "category is updated"
            result.name == "New Name"
            result.description == "New"
    }

    def "should delete a category"() {
        given: "a category exists"
            def category = categoryRepository.save(new ShoppingCategory(name: "ToDelete", description: "Test"))
            def initialCount = categoryRepository.count()

        when: "deleting the category"
            catalogService.deleteCategory(category.id)

        then: "category is deleted"
            categoryRepository.count() == initialCount - 1
    }

    def "should find all items with pagination"() {
        when: "requesting all items"
            def result = catalogService.findAllItems(PageRequest.of(0, 10))

        then: "items are returned"
            result.totalElements >= 0
    }

    def "should get an item by ID"() {
        given: "an item exists"
            def category = categoryRepository.save(new ShoppingCategory(name: "Test", description: "Test"))
            def item = itemRepository.save(new ShoppingItem(name: "Test Item", category: category))

        when: "requesting the item"
            def result = catalogService.getItem(item.id)

        then: "item is returned"
            result.name == "Test Item"
    }

    def "should throw ObjectNotFoundException when item not found"() {
        when: "requesting non-existent item"
            catalogService.getItem(999L)
        then: "exception is thrown"
            thrown(ObjectNotFoundException)
    }
}
