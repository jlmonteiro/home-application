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
    def "getUserProfile(Long id) should return user profile DTO when user exists with profile"() {
        given: "a user exists with profile in the database"
            def expectedEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(expectedEmail).get().id

        when: "getting user profile by ID"
            def result = userProfileService.getUserProfile(expectedId)

        then: "user profile DTO is returned"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == expectedEmail
                firstName == "Jane"
                lastName == "Smith"
                enabled == true
                photo == "photo.jpg"
                facebook == "facebook.com/jane"
                mobilePhone == "+1234567890"
                instagram == "instagram.com/jane"
                linkedin == "linkedin.com/jane"
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile(String email) should return user profile DTO when user exists with profile"() {
        given: "a user exists with profile in the database"
            def expectedEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(expectedEmail).get().id

        when: "getting user profile by email"
            def result = userProfileService.getUserProfile(expectedEmail)

        then: "user profile DTO is returned"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == expectedEmail
                firstName == "Jane"
                lastName == "Smith"
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
            def expectedEmail = "nonexistent@example.com"

        when: "getting user profile by email"
            def result = userProfileService.getUserProfile(expectedEmail)

        then: "empty optional is returned"
            result.isEmpty()
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile should handle user without profile"() {
        given: "a user exists without user profile in the database"
            def expectedEmail = "existing@example.com"
            def expectedId = userRepository.findByEmail(expectedEmail).get().id

        when: "getting user profile"
            def result = userProfileService.getUserProfile(expectedId)

        then: "user profile DTO is returned with null profile fields"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == expectedEmail
                firstName == "John"
                lastName == "Doe"
                enabled == true
                photo == null
                facebook == null
                mobilePhone == null
                instagram == null
                linkedin == null
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should update existing user by ID successfully"() {
        given: "an existing user ID and updated profile data"
            def expectedId = userRepository.findByEmail("existing@example.com").get().id
            def dto = createUserProfileDTO(expectedId, "existing@example.com", "Jane", "Smith", false, "new-photo.jpg", "https://facebook.com/jane", "+9876543210", "https://instagram.com/jane", "https://linkedin.com/in/jane")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "user is updated and DTO is returned"
            with(result) {
                id == expectedId
                email == "existing@example.com"
                firstName == "Jane"
                lastName == "Smith"
                enabled == false
                photo == "new-photo.jpg"
                facebook == "https://facebook.com/jane"
                mobilePhone == "+9876543210"
                instagram == "https://instagram.com/jane"
                linkedin == "https://linkedin.com/in/jane"
            }
    }

    def "updateUserProfile should throw ObjectNotFoundException when user with ID does not exist"() {
        given: "a user profile DTO for non-existent ID"
            def dto = createUserProfileDTO(999L, "nonexistent@example.com", "Jane", "Smith", true, null, null, null, null, null)

        when: "updating user profile"
            userProfileService.updateUserProfile(dto)

        then: "ObjectNotFoundException is thrown"
            def exception = thrown(ObjectNotFoundException)
            exception.message.contains("User not found with ID")
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should handle minimal profile data"() {
        given: "minimal user profile data"
            def expectedId = userRepository.findByEmail("existing@example.com").get().id
            def dto = createUserProfileDTO(expectedId, "existing@example.com", "", "", true, "", "", "", "", "")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "user is updated with minimal data"
            with(result) {
                id == expectedId
                email == "existing@example.com"
                firstName == ""
                lastName == ""
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should update existing user profile when profile already exists"() {
        given: "user with existing profile and new data"
            def expectedId = userRepository.findByEmail("withprofile@example.com").get().id
            def dto = createUserProfileDTO(expectedId, "withprofile@example.com", "Updated", "User", false, "updated-photo.jpg", "https://facebook.com/updated", "+9999999999", "https://instagram.com/updated", "https://linkedin.com/in/updated")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "existing profile is updated"
            with(result) {
                id == expectedId
                email == "withprofile@example.com"
                firstName == "Updated"
                lastName == "User"
                enabled == false
                photo == "updated-photo.jpg"
                facebook == "https://facebook.com/updated"
                mobilePhone == "+9999999999"
                instagram == "https://instagram.com/updated"
                linkedin == "https://linkedin.com/in/updated"
            }
    }

    private UserProfileDTO createUserProfileDTO(Long id, String email, String firstName, String lastName, Boolean enabled, String photo, String facebook, String mobilePhone, String instagram, String linkedin) {
        new UserProfileDTO(
            id: id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            enabled: enabled,
            photo: photo,
            facebook: facebook,
            mobilePhone: mobilePhone,
            instagram: instagram,
            linkedin: linkedin
        )
    }
}
