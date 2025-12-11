package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserProfileServiceSpec extends BaseIntegrationTest {

    @Autowired
    UserProfileService userProfileService

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile should return user profile DTO when user exists with profile"() {
        given: "a user exists with profile in the database"
            def email = "withprofile@example.com"

        when: "getting user profile"
            def result = userProfileService.getUserProfile(email)

        then: "user profile DTO is returned"
            result.isPresent()
            with(result.get()) {
                email == "withprofile@example.com"
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

    def "getUserProfile should return empty optional when user does not exist"() {
        given: "no user exists in the database"
            def email = "nonexistent@example.com"

        when: "getting user profile"
            def result = userProfileService.getUserProfile(email)

        then: "empty optional is returned"
            result.isEmpty()
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile should handle user without profile"() {
        given: "a user exists without user profile in the database"
            def email = "existing@example.com"

        when: "getting user profile"
            def result = userProfileService.getUserProfile(email)

        then: "user profile DTO is returned with null profile fields"
            result.isPresent()
            with(result.get()) {
                email == "existing@example.com"
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
    def "updateUserProfile should update existing user successfully"() {
        given: "an existing user and updated profile data"
            def dto = createUserProfileDTO("existing@example.com", "Jane", "Smith", false, "new-photo.jpg", "https://facebook.com/jane", "+9876543210", "https://instagram.com/jane", "https://linkedin.com/in/jane")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "user is updated and DTO is returned"
            with(result) {
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

    def "updateUserProfile should throw ObjectNotFoundException when user does not exist"() {
        given: "a user profile DTO for non-existent user"
            def dto = createUserProfileDTO("nonexistent@example.com", "Jane", "Smith", true, null, null, null, null, null)

        when: "updating user profile"
            userProfileService.updateUserProfile(dto)

        then: "ObjectNotFoundException is thrown"
            def exception = thrown(ObjectNotFoundException)
            exception.message == "User not found"
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should handle minimal profile data"() {
        given: "minimal user profile data"
            def dto = createUserProfileDTO("existing@example.com", "", "", true, "", "", "", "", "")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "user is updated with minimal data"
            with(result) {
                email == "existing@example.com"
                firstName == ""
                lastName == ""
                enabled == true
                photo == ""
                facebook == ""
                mobilePhone == ""
                instagram == ""
                linkedin == ""
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should update existing user profile when profile already exists"() {
        given: "user with existing profile and new data"
            def dto = createUserProfileDTO("withprofile@example.com", "Updated", "User", false, "updated-photo.jpg", "https://facebook.com/updated", "+9999999999", "https://instagram.com/updated", "https://linkedin.com/in/updated")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "existing profile is updated"
            with(result) {
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

    private UserProfileDTO createUserProfileDTO(String email, String firstName, String lastName, Boolean enabled, String photo, String facebook, String mobilePhone, String instagram, String linkedin) {
        def dto = new UserProfileDTO()
        dto.email = email
        dto.firstName = firstName
        dto.lastName = lastName
        dto.enabled = enabled
        dto.photo = photo
        dto.facebook = facebook
        dto.mobilePhone = mobilePhone
        dto.instagram = instagram
        dto.linkedin = linkedin
        return dto
    }
}