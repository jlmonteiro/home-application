package com.jorgemonteiro.home_app.service.meals

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.meals.*
import com.jorgemonteiro.home_app.model.dtos.shared.EntitySummaryDTO
import com.jorgemonteiro.home_app.model.entities.meals.MealPlanStatus
import com.jorgemonteiro.home_app.repository.meals.MealPlanEntryRepository
import com.jorgemonteiro.home_app.repository.meals.MealPlanRepository
import com.jorgemonteiro.home_app.repository.meals.MealPlanVoteRepository
import com.jorgemonteiro.home_app.repository.meals.MealTimeRepository
import com.jorgemonteiro.home_app.repository.notifications.NotificationRepository
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
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

import java.time.LocalDate

@Title("Meal Plan Service")
@Narrative("""
As a household member
I want to plan my weekly meals and collaborate with others
So that we have a shared understanding of what to eat and can vote on suggestions
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
@Subject(MealPlanService)
class MealPlanServiceSpec extends BaseIntegrationTest {

    @Autowired
    MealPlanService mealPlanService

    @Autowired
    MealPlanRepository mealPlanRepository

    @Autowired
    MealTimeRepository mealTimeRepository

    @Autowired
    MealPlanEntryRepository entryRepository

    @Autowired
    MealPlanVoteRepository voteRepository

    @Autowired
    NotificationRepository notificationRepository

    @Autowired
    UserRepository userRepository

    @Autowired
    RecipeRepository recipeRepository

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getOrCreatePlan should return existing plan for the week"() {
        given: "a date within the week of the existing plan (2026-04-20)"
            def date = LocalDate.of(2026, 4, 22) 

        when: "fetching the plan"
            def result = mealPlanService.getOrCreatePlan(date)

        then: "the existing plan is returned"
            result.weekStartDate == LocalDate.of(2026, 4, 20)
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "getOrCreatePlan should create new plan for a week that doesn't have one"() {
        given: "a date in a future week"
            def date = LocalDate.of(2026, 5, 4) 

        when: "fetching the plan"
            def result = mealPlanService.getOrCreatePlan(date)

        then: "a new plan is created and returned"
            result.weekStartDate == LocalDate.of(2026, 5, 4)
            mealPlanRepository.findByWeekStartDate(result.weekStartDate).isPresent()
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "updatePlan should sync entries correctly"() {
        given: "the existing plan and necessary IDs"
            def plan = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 20)).get()
            def lunchId = mealTimeRepository.findAll().find { it.getName() == "Lunch" }.getId()
            def recipeId = recipeRepository.findAll().find { it.getName() == "Test Pasta" }.getId()
            
            def dto = mealPlanService.getOrCreatePlan(LocalDate.of(2026, 4, 20))
            dto.setEntries([
                new MealPlanEntryDTO(dayOfWeek: java.time.DayOfWeek.TUESDAY, mealTimeId: lunchId, recipes: [
                    new MealPlanEntryRecipeDTO(recipe: new EntitySummaryDTO(id: recipeId))
                ])
            ])

        when: "updating the plan"
            def result = mealPlanService.updatePlan(plan.getId(), dto)

        then: "the plan has exactly one entry (sync replaces entries)"
            result.entries.size() == 1
            result.entries[0].dayOfWeek == java.time.DayOfWeek.TUESDAY
            result.entries[0].mealTimeId == lunchId
            result.entries[0].recipes[0].recipe.id == recipeId
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "notifyHousehold should publish plan and create notifications"() {
        given: "the plan ID"
            def planId = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 20)).get().getId()
            def initialCount = notificationRepository.count()

        when: "notifying the household"
            mealPlanService.notifyHousehold(planId, "planner@example.com")

        then: "plan status is updated to PUBLISHED"
            mealPlanRepository.findById(planId).get().status == MealPlanStatus.PUBLISHED

        and: "a notification is created for the other user"
            notificationRepository.count() > initialCount
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "acceptPlan should update status to ACCEPTED"() {
        given: "the plan ID"
            def planId = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 20)).get().getId()

        when: "accepting the plan"
            mealPlanService.acceptPlan(planId)

        then: "status is updated"
            mealPlanRepository.findById(planId).get().status == MealPlanStatus.ACCEPTED
    }

    @Sql("/scripts/sql/integration-test-data.sql")
    def "voteEntry should record user vote"() {
        given: "the entry ID and user ID"
            def planId = mealPlanRepository.findByWeekStartDate(LocalDate.of(2026, 4, 20)).get().getId()
            def entryId = entryRepository.findAllByPlanId(planId)[0].getId()
            def userId = userRepository.findByEmail("household@example.com").get().getId()

        when: "user votes 'yes' on the entry"
            mealPlanService.voteEntry(entryId, "household@example.com", true)

        then: "vote is persisted"
            def vote = voteRepository.findByEntryIdAndUserId(entryId, userId).get()
            vote.getVote() == true
    }

    def "updatePlan should throw ObjectNotFoundException for invalid plan ID"() {
        when:
            mealPlanService.updatePlan(99999L, new MealPlanDTO())
        then:
            thrown(ObjectNotFoundException)
    }
}
