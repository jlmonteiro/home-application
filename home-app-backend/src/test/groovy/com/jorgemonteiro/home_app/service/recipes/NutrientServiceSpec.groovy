package com.jorgemonteiro.home_app.service.recipes

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.recipes.NutrientDTO
import com.jorgemonteiro.home_app.repository.recipes.NutrientRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title
import spock.lang.Unroll

@Title("Nutrient Service")
@Narrative("""
As a system administrator
I want to manage the master list of nutrients
So that users can associate accurate nutritional data with shopping items
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
class NutrientServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    NutrientService nutrientService

    @Autowired
    NutrientRepository nutrientRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should return all nutrients ordered by name"() {
        when: "listing all nutrients"
            def result = nutrientService.listAll()

        then: "seeded nutrients are returned"
            result.size() >= 3
            
        and: "standard nutrients like Energy are present"
            result.any { it.name == "Energy" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should persist a new nutrient"() {
        given: "a new nutrient DTO with a unique name"
            def dto = new NutrientDTO(name: "Vitamin K", unit: "mcg", description: "Unique Test Nutrient")

        when: "creating the nutrient"
            def result = nutrientService.create(dto)

        then: "the saved entity is returned with an ID"
            result.id != null
            result.name == "Vitamin K"

        and: "it is persisted in the database"
            nutrientRepository.findAll().any { it.name == "Vitamin K" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should modify an existing nutrient"() {
        given: "an existing nutrient from the database"
            def nutrient = nutrientRepository.findAll().find { it.name == "Energy" }
            def dto = new NutrientDTO(name: "Energy (kJ)", unit: "kJ", description: "Updated unit")

        when: "updating the nutrient"
            def result = nutrientService.update(nutrient.id, dto)

        then: "the changes are correctly applied"
            with(result) {
                name == "Energy (kJ)"
                unit == "kJ"
                description == "Updated unit"
            }

        and: "the update is reflected in the repository"
            nutrientRepository.findAll().any { it.name == "Energy (kJ)" }
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "should remove a nutrient from the repository"() {
        given: "a nutrient that is not linked to any nutrition entry (to avoid FK violation)"
            def nutrient = nutrientService.create(new NutrientDTO(name: "Deletable", unit: "x"))
            def nutrientId = nutrient.id

        when: "deleting the nutrient"
            nutrientService.delete(nutrientId)

        then: "the nutrient is no longer present in the database"
            !nutrientRepository.existsById(nutrientId)
    }

    @Unroll
    def "should throw ObjectNotFoundException for #action on non-existent ID"() {
        when: "attempting to #action a non-existent nutrient"
            if (action == "update") {
                nutrientService.update(99999L, new NutrientDTO(name: "X"))
            } else {
                nutrientService.delete(99999L)
            }

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)

        where:
            action << ["update", "delete"]
    }
}
