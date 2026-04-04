package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

@Title("UserProfileService")
@Narrative("""
As a user
I want to retrieve and update my profile information
So that my account details are always accurate and up to date
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserProfileServiceSpec extends BaseIntegrationTest {

    @Autowired
    UserProfileService userProfileService

    @Autowired
    UserRepository userRepository

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile(Long id) should return user profile when user exists with profile"() {
        given: "a user exists with profile in the database"
            def targetEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id

        when: "getting user profile by ID"
            def result = userProfileService.getUserProfile(expectedId)

        then: "user profile is returned with correct data"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == targetEmail
                firstName == "Jane"
                lastName == "Smith"
                photo == "photo.jpg"
                mobilePhone == "+1234567890"
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile(String email) should return user profile when user exists with profile"() {
        given: "a user exists with profile in the database"
            def targetEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id

        when: "getting user profile by email"
            def result = userProfileService.getUserProfile(targetEmail)

        then: "user profile is returned with correct data"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == targetEmail
                firstName == "Jane"
            }
    }

    def "getUserProfile by ID should return empty optional when user does not exist"() {
        when: "getting user profile by non-existent ID"
            def result = userProfileService.getUserProfile(999L)

        then: "empty optional is returned"
            result.isEmpty()
    }

    def "getUserProfile by email should return empty optional when user does not exist"() {
        given: "no user exists in the database"
            def targetEmail = "nonexistent@example.com"

        when: "getting user profile by email"
            def result = userProfileService.getUserProfile(targetEmail)

        then: "empty optional is returned"
            result.isEmpty()
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile should handle user without profile"() {
        given: "a user exists without user profile in the database"
            def targetEmail = "existing@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id

        when: "getting user profile"
            def result = userProfileService.getUserProfile(expectedId)

        then: "user profile is returned with null profile fields"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == targetEmail
                photo == null
                facebook == null
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should update existing user by ID successfully"() {
        given: "an existing user ID and updated profile data"
            def targetEmail = "existing@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id
            def dto = createUserProfileDTO(expectedId, targetEmail, "Jane", "Smith", false, "new-photo.jpg")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "user is updated and correctly populated DTO is returned"
            result != null
            with(result) {
                id == expectedId
                email == targetEmail
                firstName == "Jane"
                lastName == "Smith"
                enabled == false
                photo == "new-photo.jpg"
            }
    }

    def "updateUserProfile should throw ObjectNotFoundException when user with ID does not exist"() {
        given: "a user profile DTO for non-existent ID"
            def dto = createUserProfileDTO(999L, "nonexistent@example.com", "Jane", "Smith", true, null)

        when: "updating user profile"
            userProfileService.updateUserProfile(dto)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should update existing user profile when profile already exists"() {
        given: "user with existing profile and new data"
            def targetEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id
            def dto = createUserProfileDTO(expectedId, targetEmail, "Updated", "User", false, "updated-photo.jpg")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "existing profile is updated with new values"
            result != null
            with(result) {
                id == expectedId
                firstName == "Updated"
                lastName == "User"
                photo == "updated-photo.jpg"
            }
    }

    private UserProfileDTO createUserProfileDTO(Long id, String email, String firstName, String lastName, Boolean enabled, String photo) {
        new UserProfileDTO(
            id: id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            enabled: enabled,
            photo: photo
        )
    }
}
