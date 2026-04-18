package com.jorgemonteiro.home_app.service.recipes

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.recipes.NutritionEntryDTO
import com.jorgemonteiro.home_app.model.dtos.shared.NutrientSummaryDTO
import com.jorgemonteiro.home_app.repository.recipes.NutrientRepository
import com.jorgemonteiro.home_app.repository.recipes.NutritionEntryRepository
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository
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

@Title("Nutrition Entry Service")
@Narrative("""
As a household cook
I want to manage the nutritional information of shopping items
So that the system can automatically calculate total nutrition for my recipes
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
class NutritionEntryServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    NutritionEntryService nutritionEntryService

    @Autowired
    ShoppingItemRepository itemRepository

    @Autowired
    NutrientRepository nutrientRepository

    @Autowired
    NutritionEntryRepository nutritionEntryRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return all nutrition entries for a specific item"() {
        given: "an existing shopping item with nutrition data"
            def item = itemRepository.findAll().find { it.name == "All-purpose Flour" }

        when: "retrieving nutrition entries"
            def result = nutritionEntryService.getNutritionEntries(item.id)

        then: "the expected number of entries is returned"
            result.size() == 2

        and: "the entries contain the correct nutrient information"
            result.any { it.nutrient.name == "Energy" && it.value.compareTo(new BigDecimal("364.00")) == 0 }
            result.any { it.nutrient.name == "Protein" && it.value.compareTo(new BigDecimal("10.33")) == 0 }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should insert a new nutrition entry for an item"() {
        given: "an item and a nutrient that are not yet linked"
            def item = itemRepository.findAll().find { it.name == "Large Egg" }
            def nutrient = nutrientRepository.findAll().find { it.name == "Carbohydrate" }
            def dto = new NutritionEntryDTO(
                nutrient: new NutrientSummaryDTO(id: nutrient.id),
                value: new BigDecimal("0.36")
            )

        when: "upserting the nutrition entry"
            def result = nutritionEntryService.upsertNutritionEntry(item.id, dto)

        then: "the new entry is persisted and returned"
            result.id != null
            result.value.compareTo(new BigDecimal("0.36")) == 0
            result.nutrient.id == nutrient.id
            result.item.id == item.id

        and: "it is present in the database"
            nutritionEntryRepository.findByItemIdAndNutrientId(item.id, nutrient.id).isPresent()
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should update an existing nutrition entry"() {
        given: "an existing nutrition entry"
            def item = itemRepository.findAll().find { it.name == "All-purpose Flour" }
            def nutrient = nutrientRepository.findAll().find { it.name == "Energy" }
            def dto = new NutritionEntryDTO(
                nutrient: new NutrientSummaryDTO(id: nutrient.id),
                value: new BigDecimal("370.00") // Updated value
            )

        when: "upserting the same nutrient for the item"
            def result = nutritionEntryService.upsertNutritionEntry(item.id, dto)

        then: "the value is updated in the database"
            result.value.compareTo(new BigDecimal("370.00")) == 0
            nutritionEntryRepository.findByItemIdAndNutrientId(item.id, nutrient.id).get().value.compareTo(new BigDecimal("370.00")) == 0
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should delete a nutrition entry"() {
        given: "an existing nutrition entry"
            def item = itemRepository.findAll().find { it.name == "All-purpose Flour" }
            def nutrient = nutrientRepository.findAll().find { it.name == "Energy" }

        when: "deleting the entry"
            nutritionEntryService.deleteNutritionEntry(item.id, nutrient.id)

        then: "the entry is removed from the database"
            !nutritionEntryRepository.findByItemIdAndNutrientId(item.id, nutrient.id).isPresent()
    }

    def "should throw ObjectNotFoundException when upserting for non-existent item"() {
        given: "a non-existent item ID"
            def dto = new NutritionEntryDTO(nutrient: new NutrientSummaryDTO(id: 1L))

        when: "upserting"
            nutritionEntryService.upsertNutritionEntry(99999L, dto)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should throw ObjectNotFoundException when upserting with non-existent nutrient"() {
        given: "a valid item and non-existent nutrient"
            def item = itemRepository.findAll().find { it.name == "Large Egg" }
            def dto = new NutritionEntryDTO(nutrient: new NutrientSummaryDTO(id: 99999L))

        when: "upserting"
            nutritionEntryService.upsertNutritionEntry(item.id, dto)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }
}
