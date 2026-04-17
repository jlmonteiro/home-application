package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.context.jdbc.Sql
import org.springframework.transaction.annotation.Transactional
import spock.lang.Narrative
import spock.lang.Title

import static org.mockito.Mockito.*

@Title("User Service")
@Narrative("""
As the authentication system
I want to find or create a local user account on every OAuth login
So that new users are registered automatically and returning users are recognised without duplication
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UserServiceSpec extends BaseIntegrationTest {

    @Autowired
    UserService userService

    @Autowired
    UserRepository userRepository

    @MockitoBean
    PhotoService photoService

    @Sql("/scripts/sql/user-profile-test-data.sql")
    def "findOrCreateUser should return existing user when user already exists"() {
        given: "an existing user in the database"
            def targetEmail = "existing@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, "Updated", "Name", null, Optional.empty())

        then: "existing user is returned without creating a new one"
            result != null
            with(result) {
                email == targetEmail
                firstName == "John"
                lastName == "Doe"
            }
    }

    def "findOrCreateUser should create a new user when user does not exist"() {
        given: "a user that does not exist in the database"
            def targetEmail = "newuser@example.com"
            def targetFirstName = "New"
            def targetLastName = "User"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, targetFirstName, targetLastName, null, Optional.empty())

        then: "a new user is created and returned"
            result != null
            with(result) {
                id != null
                email == targetEmail
                firstName == targetFirstName
                lastName == targetLastName
                enabled == true
            }
    }

    def "findOrCreateUser should create user profile on first login"() {
        given: "a new user that does not exist"
            def targetEmail = "profiletest@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, "Profile", "Test", null, Optional.empty())

        then: "a user profile is created for the new user"
            result.userProfile != null
            result.userProfile.user.id == result.id
    }

    def "findOrCreateUser should download and set profile photo for new user when picture URL is provided"() {
        given: "a new user with a profile picture URL"
            def targetEmail = "photouser@example.com"
            def targetPictureUrl = "https://example.com/photo.jpg"
            def targetPhotoData = "base64encodedphoto"
            when(photoService.downloadAndConvertToBase64(targetPictureUrl)).thenReturn(targetPhotoData)

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, "Photo", "User", targetPictureUrl, Optional.empty())

        then: "the profile photo is set from the downloaded image"
            result.userProfile != null
            result.userProfile.photo == targetPhotoData

        and: "the photo service was called"
            verify(photoService).downloadAndConvertToBase64(targetPictureUrl) || true
    }

    def "findOrCreateUser should create user with null photo when picture URL is null"() {
        given: "a new user without a profile picture"
            def targetEmail = "nophoto@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, "No", "Photo", null, Optional.empty())

        then: "user is created with no profile photo"
            result.userProfile != null
            result.userProfile.photo == null

        and: "the photo service was never called"
            verify(photoService, never()).downloadAndConvertToBase64(any()) || true
    }

    def "findOrCreateUser should not download photo when picture URL is empty"() {
        given: "a new user with an empty picture URL"
            def targetEmail = "emptyphoto@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(targetEmail, "Empty", "Photo", "", Optional.empty())

        then: "user is created with no profile photo"
            result.userProfile != null
            result.userProfile.photo == null

        and: "the photo service was never called"
            verify(photoService, never()).downloadAndConvertToBase64(any()) || true
    }
}
