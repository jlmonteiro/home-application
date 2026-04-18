package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO
import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO
import com.jorgemonteiro.home_app.model.entities.profiles.FamilyRole
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.repository.profiles.FamilyRoleRepository
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

import static org.mockito.ArgumentMatchers.anyString
import static org.mockito.Mockito.when

@Title("User Profile Service")
@Narrative("""
As a user
I want to retrieve and update my profile information
So that my account details are always accurate and up to date
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Subject(UserProfileService)
class UserProfileServiceSpec extends BaseIntegrationTest {

    @Autowired
    UserProfileService userProfileService

    @Autowired
    UserRepository userRepository

    @Autowired
    FamilyRoleRepository familyRoleRepository

    @MockitoBean
    PhotoService photoService

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile(Long id) should return user profile when user exists with profile"() {
        given: "a user exists with profile in the database"
            def targetEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id
            when(photoService.getPhotoUrl(anyString())).thenReturn("/api/photos/photo.jpg")

        when: "getting user profile by ID"
            def result = userProfileService.getUserProfile(expectedId)

        then: "user profile is returned with user data"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == targetEmail
                firstName == "Jane"
                lastName == "Smith"
                photo != null
                photo.url == "/api/photos/photo.jpg"
                mobilePhone == "+1234567890"
            }
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "getUserProfile(String email) should return user profile when user exists with profile"() {
        given: "a user exists with profile in the database"
            def targetEmail = "withprofile@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id
            when(photoService.getPhotoUrl(anyString())).thenReturn("/api/photos/photo.jpg")

        when: "getting user profile by email"
            def result = userProfileService.getUserProfile(targetEmail)

        then: "user profile is returned with user data"
            result.isPresent()
            with(result.get()) {
                id == expectedId
                email == targetEmail
                photo != null
                photo.url == "/api/photos/photo.jpg"
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
            // Remove the profile for this user
            def user = userRepository.findByEmail(targetEmail).get()
            user.setUserProfile(null)
            userRepository.save(user)
            when(photoService.getPhotoUrl(anyString())).thenReturn(null)

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
            def user = userRepository.findByEmail(targetEmail).get()
            def expectedId = user.id
            def roleId = familyRoleRepository.findByName("Mother").get().id
            def dto = createUserProfileDTO(expectedId, targetEmail, "Jane", "Smith", false, "new-photo.jpg", roleId)
            
            when(photoService.savePhoto(anyString(), anyString(), anyString())).thenReturn("new-photo.jpg")
            when(photoService.getPhotoUrl(anyString())).thenReturn("/api/photos/new-photo.jpg")

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
                photo != null
                photo.url == "/api/photos/new-photo.jpg"
                familyRoleId == roleId
            }
    }

    def "updateUserProfile should throw ObjectNotFoundException when user with ID does not exist"() {
        given: "a user profile DTO for non-existent ID"
            def dto = createUserProfileDTO(999L, "nonexistent@example.com", "Jane", "Smith", true, null, 1L)

        when: "updating user profile"
            userProfileService.updateUserProfile(dto)

        then: "ObjectNotFoundException is thrown"
            thrown(ObjectNotFoundException)
    }

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "updateUserProfile should update existing user profile when profile already exists"() {
        given: "user with existing profile and new data"
            def targetEmail = "withprofile@example.com"
            def user = userRepository.findByEmail(targetEmail).get()
            def expectedId = user.id
            def roleId = familyRoleRepository.findByName("Father").get().id
            def dto = createUserProfileDTO(expectedId, targetEmail, "Updated", "User", false, "updated-photo.jpg", roleId)

            when(photoService.savePhoto(anyString(), anyString(), anyString())).thenReturn("updated-photo.jpg")
            when(photoService.getPhotoUrl(anyString())).thenReturn("/api/photos/updated-photo.jpg")

        when: "updating user profile"
            def result = userProfileService.updateUserProfile(dto)

        then: "existing profile is updated with new values"
            result != null
            with(result) {
                id == expectedId
                firstName == "Updated"
                lastName == "User"
                photo != null
                photo.url == "/api/photos/updated-photo.jpg"
                familyRoleId == roleId
            }
    }

    private UserProfileDTO createUserProfileDTO(Long id, String email, String firstName, String lastName, Boolean enabled, String photoData, Long roleId) {
        new UserProfileDTO(
            id: id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            enabled: enabled,
            photo: new PhotoDTO(photoData, null),
            familyRoleId: roleId
        )
    }
}
