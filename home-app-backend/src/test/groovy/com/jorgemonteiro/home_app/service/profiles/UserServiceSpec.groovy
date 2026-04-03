package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.repository.profiles.UserRepository
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

@Title("UserService")
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
            def email = "existing@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(email, "Updated", "Name", null)

        then: "existing user is returned without creating a new one"
            result != null
            result.email == email
            result.firstName == "John"
            result.lastName == "Doe"
    }

    def "findOrCreateUser should create a new user when user does not exist"() {
        given: "a user that does not exist in the database"
            def email = "newuser@example.com"
            def firstName = "New"
            def lastName = "User"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(email, firstName, lastName, null)

        then: "a new user is created and returned"
            result != null
            result.id != null
            result.email == email
            result.firstName == firstName
            result.lastName == lastName
            result.enabled == true
    }

    def "findOrCreateUser should create user profile on first login"() {
        given: "a new user that does not exist"
            def email = "profiletest@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(email, "Profile", "Test", null)

        then: "a user profile is created for the new user"
            result.userProfile != null
            result.userProfile.user.id == result.id
    }

    def "findOrCreateUser should download and set profile photo for new user when picture URL is provided"() {
        given: "a new user with a profile picture URL"
            def email = "photouser@example.com"
            def pictureUrl = "https://example.com/photo.jpg"
            Mockito.when(photoService.downloadAndConvertToBase64(pictureUrl)).thenReturn("base64encodedphoto")

        when: "finding or creating user"
            def result = userService.findOrCreateUser(email, "Photo", "User", pictureUrl)

        then: "the profile photo is set from the downloaded image"
            result.userProfile != null
            result.userProfile.photo == "base64encodedphoto"
            Mockito.verify(photoService).downloadAndConvertToBase64(pictureUrl) || true
    }

    def "findOrCreateUser should create user with null photo when picture URL is null"() {
        given: "a new user without a profile picture"
            def email = "nophoto@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(email, "No", "Photo", null)

        then: "user is created with no profile photo"
            result.userProfile != null
            result.userProfile.photo == null
            Mockito.verify(photoService, Mockito.never()).downloadAndConvertToBase64(Mockito.any()) || true
    }

    def "findOrCreateUser should not download photo when picture URL is empty"() {
        given: "a new user with an empty picture URL"
            def email = "emptyphoto@example.com"

        when: "finding or creating user"
            def result = userService.findOrCreateUser(email, "Empty", "Photo", "")

        then: "user is created with no profile photo"
            result.userProfile != null
            result.userProfile.photo == null
            Mockito.verify(photoService, Mockito.never()).downloadAndConvertToBase64(Mockito.any()) || true
    }
}
