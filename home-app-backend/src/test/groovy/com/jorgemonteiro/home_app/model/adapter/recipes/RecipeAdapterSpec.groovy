package com.jorgemonteiro.home_app.model.adapter.recipes

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.model.dtos.recipes.*
import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO
import com.jorgemonteiro.home_app.model.entities.recipes.*
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

@Title("Recipe Adapter")
@Narrative("""
As a developer
I want to convert between Recipe entities and DTOs
So that I can properly serialize and deserialize recipe data
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
class RecipeAdapterSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    RecipeAdapter adapter

    @Autowired
    UserRepository userRepository

    @Autowired
    PhotoService photoService

    def "should convert Recipe entity to DTO"() {
        given: "a user and recipe"
            def user = userRepository.save(new User(
                email: "test-recipe-${System.currentTimeMillis()}@example.com",
                firstName: "Test",
                lastName: "User",
                enabled: true
            ))
            def recipe = new Recipe(
                name: "Test Recipe",
                description: "Test description",
                servings: 4,
                prepTimeMinutes: 30
            )
            recipe.setCreatedBy(user)

        when: "converting to DTO"
            def dto = adapter.toDTO(recipe)

        then: "DTO is correctly populated"
            dto.name == "Test Recipe"
            dto.description == "Test description"
            dto.servings == 4
            dto.prepTimeMinutes == 30
            dto.creator != null
            dto.creator.name == "Test User"
    }

    def "should convert null Recipe entity to null DTO"() {
        when: "converting null entity"
            def dto = adapter.toDTO(null)

        then: "result is null"
            dto == null
    }

    def "should convert RecipePhoto entity to DTO"() {
        given: "a recipe photo"
            def photo = new RecipePhoto(
                photoName: "test-photo.jpg",
                isDefault: true
            )

        when: "converting to DTO"
            def dto = adapter.toPhotoDTO(photo)

        then: "DTO is correctly populated"
            dto.photoName == "test-photo.jpg"
            dto.isDefault == true
            dto.photoUrl != null
    }

    def "should convert null RecipePhoto entity to null DTO"() {
        when: "converting null entity"
            def dto = adapter.toPhotoDTO(null)

        then: "result is null"
            dto == null
    }

    def "should convert RecipeIngredient entity to DTO"() {
        given: "a recipe ingredient with item"
            def user = userRepository.save(new User(
                email: "test-ingredient-${System.currentTimeMillis()}@example.com",
                firstName: "Test",
                lastName: "User",
                enabled: true
            ))
            def item = new com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem(
                name: "Test Item",
                unit: "pcs"
            )
            item.setCategory(new com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory(name: "Test", description: "Test"))
            def ingredient = new RecipeIngredient(
                quantity: 2.0,
                item: item
            )

        when: "converting to DTO"
            def dto = adapter.toIngredientDTO(ingredient)

        then: "DTO is correctly populated"
            dto.quantity == 2.0
            dto.item != null
            dto.item.name == "Test Item"
    }

    def "should convert null RecipeIngredient entity to null DTO"() {
        when: "converting null entity"
            def dto = adapter.toIngredientDTO(null)

        then: "result is null"
            dto == null
    }

    def "should convert RecipeStep entity to DTO"() {
        given: "a recipe step"
            def step = new RecipeStep(
                instruction: "Step 1",
                timeMinutes: 10,
                sortOrder: 1
            )

        when: "converting to DTO"
            def dto = adapter.toStepDTO(step)

        then: "DTO is correctly populated"
            dto.instruction == "Step 1"
            dto.timeMinutes == 10
            dto.sortOrder == 1
    }

    def "should convert null RecipeStep entity to null DTO"() {
        when: "converting null entity"
            def dto = adapter.toStepDTO(null)

        then: "result is null"
            dto == null
    }

    def "should convert RecipeComment entity to DTO"() {
        given: "a recipe comment"
            def user = userRepository.save(new User(
                email: "test-comment-${System.currentTimeMillis()}@example.com",
                firstName: "Test",
                lastName: "User",
                enabled: true
            ))
            def comment = new RecipeComment(
                comment: "Great recipe!",
                user: user
            )

        when: "converting to DTO"
            def dto = adapter.toCommentDTO(comment)

        then: "DTO is correctly populated"
            dto.comment == "Great recipe!"
            dto.user != null
            dto.user.name == "Test User"
    }

    def "should convert null RecipeComment entity to null DTO"() {
        when: "converting null entity"
            def dto = adapter.toCommentDTO(null)

        then: "result is null"
            dto == null
    }

    def "should convert RecipeRating entity to DTO"() {
        given: "a recipe rating"
            def user = userRepository.save(new User(
                email: "test-rating-${System.currentTimeMillis()}@example.com",
                firstName: "Test",
                lastName: "User",
                enabled: true
            ))
            def rating = new RecipeRating(
                rating: 5,
                user: user
            )

        when: "converting to DTO"
            def dto = adapter.toRatingDTO(rating)

        then: "DTO is correctly populated"
            dto.rating == 5
            dto.user != null
            dto.user.name == "Test User"
    }

    def "should convert null RecipeRating entity to null DTO"() {
        when: "converting null entity"
            def dto = adapter.toRatingDTO(null)

        then: "result is null"
            dto == null
    }
}
