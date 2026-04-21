package com.jorgemonteiro.home_app.model.adapter.profiles

import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO
import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import static org.mockito.ArgumentMatchers.anyString
import static org.mockito.Mockito.when

@Title("User Profile Adapter")
@Narrative("""
As a developer
I want the UserProfileAdapter to correctly convert between User/UserProfile entities and UserProfileDTO
So that entities are never exposed directly in API responses
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Subject(UserProfileAdapter)
class UserProfileAdapterSpec extends BaseIntegrationTest {

    @Autowired
    UserProfileAdapter userProfileAdapter

    @MockitoBean
    PhotoService photoService

    def "toDTO should convert user with profile correctly"() {
        given: "a user with profile"
            def targetEmail = "test@example.com"
            def targetFirstName = "John"
            def targetLastName = "Doe"
            def targetPhoto = "photo.jpg"

            def userProfile = new UserProfile(
                photo: targetPhoto,
                facebook: "https://facebook.com/user",
                mobilePhone: "+1234567890",
                instagram: "https://instagram.com/user",
                linkedin: "https://linkedin.com/in/user"
            )

            def user = new User(
                email: targetEmail,
                firstName: targetFirstName,
                lastName: targetLastName,
                enabled: true,
                userProfile: userProfile
            )

        and: "stubbed photo service"
            when(photoService.getPhotoUrl(targetPhoto)).thenReturn("/api/photos/" + targetPhoto)

        when: "converting to DTO"
            def result = userProfileAdapter.toDTO(user)

        then: "DTO is correctly populated"
            result != null
            with(result) {
                email == targetEmail
                firstName == targetFirstName
                lastName == targetLastName
                enabled == true
                photo != null
                photo.url == "/api/photos/photo.jpg"
                facebook == "https://facebook.com/user"
                mobilePhone == "+1234567890"
                instagram == "https://instagram.com/user"
                linkedin == "https://linkedin.com/in/user"
            }
    }

    def "toDTO should convert user without profile correctly"() {
        given: "a user without profile"
            def targetEmail = "test@example.com"
            def user = new User(
                email: targetEmail,
                firstName: "John",
                lastName: "Doe",
                enabled: true,
                userProfile: null
            )

        when: "converting to DTO"
            def result = userProfileAdapter.toDTO(user)

        then: "DTO has user data but null profile fields"
            result != null
            with(result) {
                email == targetEmail
                photo == null
                facebook == null
                mobilePhone == null
            }
    }

    def "toDTO should return null when user is null"() {
        when: "converting null user"
            def result = userProfileAdapter.toDTO(null)

        then: "null is returned"
            result == null
    }

    def "toEntity should convert DTO correctly"() {
        given: "a user profile DTO"
            def targetEmail = "test@example.com"
            def dto = new UserProfileDTO(
                email: targetEmail,
                firstName: "Jane",
                lastName: "Smith",
                enabled: false,
                photo: new PhotoDTO("new-photo.jpg", null),
                facebook: "https://facebook.com/jane",
                mobilePhone: "+9876543210",
                instagram: "https://instagram.com/jane",
                linkedin: "https://linkedin.com/in/jane"
            )

        when: "converting to entity"
            def result = userProfileAdapter.toEntity(dto)

        then: "user entity is correctly populated"
            result != null
            with(result) {
                email == targetEmail
                firstName == "Jane"
                lastName == "Smith"
                enabled == false
                userProfile != null
                userProfile.photo == "new-photo.jpg"
            }
    }

    def "toEntity should return null when DTO is null"() {
        when: "converting null DTO"
            def result = userProfileAdapter.toEntity(null)

        then: "null is returned"
            result == null
    }

    def "toUserProfileEntity should create profile correctly"() {
        given: "a DTO and user"
            def targetPhoto = "test-photo.jpg"
            def dto = new UserProfileDTO(
                photo: new PhotoDTO(targetPhoto, null),
                facebook: "https://facebook.com/test",
                mobilePhone: "+1111111111",
                instagram: "https://instagram.com/test",
                linkedin: "https://linkedin.com/in/test"
            )
            def user = new User(email: "test@example.com")

        when: "creating user profile entity"
            def result = userProfileAdapter.toUserProfileEntity(dto, user)

        then: "profile is correctly created"
            result != null
            with(result) {
                photo == targetPhoto
                facebook == "https://facebook.com/test"
                mobilePhone == "+1111111111"
            }
    }

    def "toUserProfileEntity should return null when DTO is null"() {
        given: "a user"
            def user = new User()

        when: "creating profile with null DTO"
            def result = userProfileAdapter.toUserProfileEntity(null, user)

        then: "null is returned"
            result == null
    }

    def "toUserProfileEntity should return null when user is null"() {
        given: "a DTO"
            def dto = new UserProfileDTO()

        when: "creating profile with null user"
            def result = userProfileAdapter.toUserProfileEntity(dto, null)

        then: "null is returned"
            result == null
    }
}
