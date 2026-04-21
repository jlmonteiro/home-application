package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import spock.lang.Narrative
import spock.lang.Title
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import jakarta.transaction.Transactional
import spock.lang.Subject
import spock.lang.Unroll

import java.time.LocalDate

@Title("Age Classification Service")
@Narrative("""
As a system architect,
I want users to be automatically classified into age groups based on their birthdate,
so that I can enforce age-appropriate permissions later.
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Subject(AgeClassificationService)
class AgeClassificationServiceSpec extends BaseIntegrationTest {

    @Autowired
    AgeClassificationService ageClassificationService

    @Unroll
    def "should classify user correctly based on age: #ageYears years old"() {
        given: "a birthdate calculated from age"
            def birthdate = LocalDate.now().minusYears(ageYears)

        when: "classifying the birthdate"
            def result = ageClassificationService.classify(birthdate)

        then: "the correct age group is returned"
            result == expectedGroup

        where: "various ages and their expected groups"
            ageYears | expectedGroup
            5        | "Child"
            12       | "Child"
            13       | "Teenager"
            17       | "Teenager"
            18       | "Adult"
            30       | "Adult"
    }

    def "should default to Adult if birthdate is null"() {
        when: "classifying a null birthdate"
            def result = ageClassificationService.classify(null)

        then: "it defaults to Adult"
            result == "Adult"
    }
}
