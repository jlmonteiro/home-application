package com.jorgemonteiro.home_app.service.recipes

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.repository.recipes.LabelRepository
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

@Title("Label Service")
@Narrative("""
As a system component
I want to manage recipe labels with automatic cleanup
So that the database doesn't get cluttered with unused tags
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
class LabelServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    LabelService labelService

    @Autowired
    LabelRepository labelRepository

    @Autowired
    RecipeRepository recipeRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getOrCreateLabels should return existing labels and create new ones"() {
        given: "a set of label names, some new and some existing"
            def names = ["Breakfast", "New Label"] as Set

        when: "getting or creating the labels"
            def result = labelService.getOrCreateLabels(names)

        then: "two labels are returned"
            result.size() == 2

        and: "the existing label 'Breakfast' is found"
            result.any { it.name == "Breakfast" }

        and: "the new label 'New Label' is created and persisted"
            result.any { it.name == "New Label" }
            labelRepository.findByName("New Label").isPresent()
    }

    def "getOrCreateLabels should return empty set for null input"() {
        expect: "null input returns empty set"
            labelService.getOrCreateLabels(null) == [] as Set
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "cleanupOrphanedLabels should remove labels not linked to any recipe"() {
        given: "a new label that is not associated with any recipe"
            def orphan = labelRepository.save(new com.jorgemonteiro.home_app.model.entities.recipes.Label("Deletable"))
            assert labelRepository.findByName("Deletable").isPresent()

        when: "running the cleanup logic"
            labelService.cleanupOrphanedLabels()

        then: "the orphaned label is removed"
            !labelRepository.findByName("Deletable").isPresent()

        and: "labels linked to recipes are preserved"
            labelRepository.findByName("Breakfast").isPresent()
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "searchLabels should return matching labels for a query"() {
        when: "searching for 'Break'"
            def result = labelService.searchLabels("Break")

        then: "matching labels are returned"
            result.size() >= 1
            result.any { it.name == "Breakfast" }
    }
}
