package com.jorgemonteiro.home_app.service.profiles

import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.repository.profiles.UserRepository
import com.jorgemonteiro.home_app.service.media.PhotoService
import com.jorgemonteiro.home_app.test.BaseIntegrationTest
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.transaction.annotation.Transactional

import java.util.Optional
import spock.lang.Narrative
import spock.lang.Subject
import spock.lang.Title

import static org.mockito.Mockito.when

@Title("OAuth2 Flow")
@Narrative("""
As the application
I want to automatically create or find a local user account when they log in via Google
So that I can maintain a local profile for authenticated users
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Subject(CustomOAuth2UserService)
class OAuth2FlowSpec extends BaseIntegrationTest {

    @Autowired
    UserRepository userRepository

    @Autowired
    UserService userService

    @MockitoBean
    PhotoService photoService

    def "loadUser should find or create a local user from Google OAuth2 attributes"() {
        given: "a mocked OAuth2User from Google"
            def targetEmail = "google-user@example.com"
            def targetFirstName = "Google"
            def targetLastName = "User"
            def targetPicture = "https://lh3.googleusercontent.com/photo.jpg"

            def oauth2User = Mock(OAuth2User)
            def attributes = [
                email: targetEmail,
                given_name: targetFirstName,
                family_name: targetLastName,
                picture: targetPicture
            ]
            oauth2User.attributes >> attributes
            oauth2User.getAttribute(_) >> { String key -> attributes[key] }

            def userRequest = Mock(OAuth2UserRequest)

        and: "a test version of the service that uses the real UserService"
            def googlePeopleServiceMock = Mock(GooglePeopleService)
            def service = new CustomOAuth2UserService(userService, googlePeopleServiceMock) {
                @Override
                OAuth2User loadUser(OAuth2UserRequest request) {
                    userService.findOrCreateUser(
                        oauth2User.getAttribute("email"),
                        oauth2User.getAttribute("given_name"),
                        oauth2User.getAttribute("family_name"),
                        oauth2User.getAttribute("picture"),
                        Optional.empty()
                    )
                    return oauth2User
                }
            }

        when: "loading the user"
            service.loadUser(userRequest)

        then: "a local user is created in the database with the correct data"
            def result = userRepository.findByEmail(targetEmail)
            result.isPresent()
            def localUser = result.get()

            with(localUser) {
                email == targetEmail
                firstName == targetFirstName
                lastName == targetLastName
                enabled == true
            }

        and: "the associated profile is initialized with the photo URL and no other details"
            with(localUser.userProfile) {
                it != null
                photo == targetPicture
                facebook == null
                mobilePhone == null
                instagram == null
                linkedin == null
            }
    }

    def "loadUser should return existing user if email is already registered"() {
        given: "an existing user in the database"
            def targetEmail = "existing@example.com"
            def existingUser = new User(
                email: targetEmail,
                firstName: "Old",
                lastName: "Name",
                enabled: true
            )
            userRepository.save(existingUser)

        and: "OAuth2 attributes with the same email but different names"
            def oauth2User = Mock(OAuth2User)
            def attributes = [
                email: targetEmail,
                given_name: "New",
                family_name: "Name"
            ]
            oauth2User.attributes >> attributes
            oauth2User.getAttribute(_) >> { String key -> attributes[key] }

            def userRequest = Mock(OAuth2UserRequest)

            def googlePeopleServiceMock = Mock(GooglePeopleService)
            def service = new CustomOAuth2UserService(userService, googlePeopleServiceMock) {
                @Override
                OAuth2User loadUser(OAuth2UserRequest request) {
                    userService.findOrCreateUser(
                        oauth2User.getAttribute("email"),
                        oauth2User.getAttribute("given_name"),
                        oauth2User.getAttribute("family_name"),
                        oauth2User.getAttribute("picture"),
                        Optional.empty()
                    )
                    return oauth2User
                }
            }

        when: "loading the user"
            service.loadUser(userRequest)

        then: "no new user is created and the existing record remains unchanged"
            userRepository.count() == 1
            def result = userRepository.findByEmail(targetEmail)
            result.isPresent()
            with(result.get()) {
                firstName == "Old"
                lastName == "Name"
            }
    }
}
