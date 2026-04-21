package com.jorgemonteiro.home_app.service.meals

import com.jorgemonteiro.home_app.HomeApplication
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.adapter.meals.MealAdapter
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeScheduleDTO
import com.jorgemonteiro.home_app.model.entities.meals.MealTime
import com.jorgemonteiro.home_app.repository.meals.MealTimeRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import java.time.DayOfWeek
import java.time.LocalTime

@Title("Meal Time Service")
@Narrative("""
As a user
I want to manage meal times and their schedules
So that I can plan my meals throughout the day
""")
@SpringBootTest(classes = [HomeApplication])
@ActiveProfiles("test")
@Transactional
@Subject(MealTimeService)
class MealTimeServiceSpec extends BaseIntegrationTest {

    @Autowired
    @Subject
    MealTimeService service

    @Autowired
    MealTimeRepository mealTimeRepository

    def "should list all meal times"() {
        when: "listing all meal times"
            def mealTimes = service.listAll()

        then: "meal times are returned in sort order"
            mealTimes.size() >= 1
            mealTimes[0].sortOrder == 1
    }

    def "should get meal time by id"() {
        given: "an existing meal time"
            def mealTime = mealTimeRepository.findAll().find { it.name == "Breakfast" }
            def dto = MealAdapter.toMealTimeDTO(mealTime)

        when: "getting by id"
            def result = service.getById(mealTime.id)

        then: "meal time is returned"
            result.id == mealTime.id
            result.name == mealTime.name
    }

    def "should throw exception for non-existent meal time"() {
        when: "getting non-existent meal time"
            service.getById(999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "should create meal time"() {
        when: "creating a new meal time"
            def dto = new MealTimeDTO(
                name: "Test Meal",
                sortOrder: 10,
                schedules: [
                    new MealTimeScheduleDTO(dayOfWeek: DayOfWeek.MONDAY, startTime: LocalTime.of(8, 0))
                ]
            )
            def result = service.create(dto)

        then: "meal time is created"
            result.id != null
            result.name == "Test Meal"
            result.schedules.size() == 1
            result.schedules[0].dayOfWeek == DayOfWeek.MONDAY
    }

    def "should update meal time"() {
        given: "an existing meal time"
            def mealTime = mealTimeRepository.findAll().find { it.name == "Breakfast" }
            def dto = MealAdapter.toMealTimeDTO(mealTime)
            dto.name = "Updated Breakfast"

        when: "updating the meal time"
            def result = service.update(mealTime.id, dto)

        then: "meal time is updated"
            result.name == "Updated Breakfast"
    }

    def "should throw exception when updating non-existent meal time"() {
        given: "a non-existent meal time id"
            def dto = new MealTimeDTO(
                name: "Test",
                sortOrder: 1
            )

        when: "updating non-existent meal time"
            service.update(999L, dto)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "should delete meal time"() {
        given: "a meal time to delete"
            def mealTime = new MealTime(name: "Delete Me", sortOrder: 100)
            mealTime = mealTimeRepository.save(mealTime)

        when: "deleting the meal time"
            service.delete(mealTime.id)

        then: "meal time is deleted"
            !mealTimeRepository.existsById(mealTime.id)
    }

    def "should throw exception when deleting non-existent meal time"() {
        when: "deleting non-existent meal time"
            service.delete(999L)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    def "should sync schedules when creating meal time"() {
        when: "creating a meal time with schedules"
            def dto = new MealTimeDTO(
                name: "Test with Schedules",
                sortOrder: 20,
                schedules: [
                    new MealTimeScheduleDTO(dayOfWeek: DayOfWeek.MONDAY, startTime: LocalTime.of(7, 0)),
                    new MealTimeScheduleDTO(dayOfWeek: DayOfWeek.WEDNESDAY, startTime: LocalTime.of(12, 0))
                ]
            )
            def result = service.create(dto)

        then: "schedules are synced"
            result.schedules.size() == 2
            result.schedules.find { it.dayOfWeek == DayOfWeek.MONDAY } != null
            result.schedules.find { it.dayOfWeek == DayOfWeek.WEDNESDAY } != null
    }

    def "should sync schedules when updating meal time"() {
        given: "an existing meal time with schedules"
            def mealTime = mealTimeRepository.findAll().find { it.name == "Breakfast" }
            def dto = MealAdapter.toMealTimeDTO(mealTime)
            dto.schedules = [
                new MealTimeScheduleDTO(dayOfWeek: DayOfWeek.MONDAY, startTime: LocalTime.of(8, 0)),
                new MealTimeScheduleDTO(dayOfWeek: DayOfWeek.TUESDAY, startTime: LocalTime.of(9, 0))
            ]

        when: "updating the meal time with new schedules"
            def result = service.update(mealTime.id, dto)

        then: "schedules are updated"
            result.schedules.size() == 2
            result.schedules.find { it.dayOfWeek == DayOfWeek.MONDAY } != null
            result.schedules.find { it.dayOfWeek == DayOfWeek.TUESDAY } != null
    }
}
