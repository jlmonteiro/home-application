package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title
import spock.lang.Unroll

@Title("User Service")
@Narrative("""
As the application
I want to manage user lifecycle and authentication identity
So that new users are registered automatically and returning users are recognised without duplication
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Subject(UserService)
class UserServiceSpec extends BaseIntegrationTest {

    @Autowired
    UserService userService

    @Autowired
    UserRepository userRepository

    @MockitoBean
    PhotoService photoService

    def "findOrCreateUser should create a new user when email does not exist"() {
        given: "a non-existent email"
            def targetEmail = "new-user@example.com"
            def targetFirstName = "New"
            def targetLastName = "User"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, targetFirstName, targetLastName, null, Optional.empty())

        then: "a new user is saved in the repository"
            userRepository.count() == 1
            with(result) {
                email == targetEmail
                firstName == targetFirstName
                lastName == targetLastName
                enabled == true
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "findOrCreateUser should return existing user when email already exists"() {
        given: "an email that already exists in the database"
            def targetEmail = "existing@example.com"
            def initialCount = userRepository.count()

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, "New", "Name", null, Optional.empty())

        then: "the existing user is returned and no new record is created"
            userRepository.count() == initialCount
            result.email == targetEmail
            result.firstName == "John" // Remains unchanged
    }

    @Unroll
    def "findOrCreateUser should set profile photo to #expectedLabel when picture URL is #inputLabel"() {
        when: "creating a new user with picture URL: #inputLabel"
            def result = userService.findOrCreateUser("photo-test@example.com", "Test", "User", pictureUrl, Optional.empty())

        then: "the profile photo is set correctly"
            result.userProfile != null
            result.userProfile.photo == expectedPhoto

        where:
            pictureUrl                       | expectedPhoto                    | inputLabel       | expectedLabel
            "https://example.com/photo.jpg"  | "https://example.com/photo.jpg"  | "a valid URL"    | "that URL"
            null                             | null                             | "null"           | "null"
            ""                               | null                             | "empty string"   | "null"
    }
}
