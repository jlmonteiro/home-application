package com.jorgemonteiro.home_app.model.adapter.profiles

import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO
import com.jorgemonteiro.home_app.model.entities.profiles.User
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile
import spock.lang.Specification

class UserProfileAdapterSpec extends Specification {

    def "toDTO should convert user with profile correctly"() {
        given: "a user with profile"
            def userProfile = new UserProfile()
            userProfile.photo = "photo.jpg"
            userProfile.facebook = "https://facebook.com/user"
            userProfile.mobilePhone = "+1234567890"
            userProfile.instagram = "https://instagram.com/user"
            userProfile.linkedin = "https://linkedin.com/in/user"

            def user = new User()
            user.email = "test@example.com"
            user.firstName = "John"
            user.lastName = "Doe"
            user.enabled = true
            user.userProfile = userProfile

        when: "converting to DTO"
            def dto = UserProfileAdapter.toDTO(user)

        then: "DTO is correctly populated"
            dto.email == "test@example.com"
            dto.firstName == "John"
            dto.lastName == "Doe"
            dto.enabled == true
            dto.photo == "photo.jpg"
            dto.facebook == "https://facebook.com/user"
            dto.mobilePhone == "+1234567890"
            dto.instagram == "https://instagram.com/user"
            dto.linkedin == "https://linkedin.com/in/user"
    }

    def "toDTO should convert user without profile correctly"() {
        given: "a user without profile"
            def user = new User()
            user.email = "test@example.com"
            user.firstName = "John"
            user.lastName = "Doe"
            user.enabled = true
            user.userProfile = null

        when: "converting to DTO"
            def dto = UserProfileAdapter.toDTO(user)

        then: "DTO has user data but null profile fields"
            dto.email == "test@example.com"
            dto.firstName == "John"
            dto.lastName == "Doe"
            dto.enabled == true
            dto.photo == null
            dto.facebook == null
            dto.mobilePhone == null
            dto.instagram == null
            dto.linkedin == null
    }

    def "toDTO should return null when user is null"() {
        when: "converting null user"
            def dto = UserProfileAdapter.toDTO(null)

        then: "null is returned"
            dto == null
    }

    def "toEntity should convert DTO correctly"() {
        given: "a user profile DTO"
            def dto = new UserProfileDTO()
            dto.email = "test@example.com"
            dto.firstName = "Jane"
            dto.lastName = "Smith"
            dto.enabled = false
            dto.photo = "new-photo.jpg"
            dto.facebook = "https://facebook.com/jane"
            dto.mobilePhone = "+9876543210"
            dto.instagram = "https://instagram.com/jane"
            dto.linkedin = "https://linkedin.com/in/jane"

        when: "converting to entity"
            def user = UserProfileAdapter.toEntity(dto)

        then: "user entity is correctly populated"
            user.email == "test@example.com"
            user.firstName == "Jane"
            user.lastName == "Smith"
            user.enabled == false
            user.userProfile != null
            user.userProfile.photo == "new-photo.jpg"
            user.userProfile.facebook == "https://facebook.com/jane"
            user.userProfile.mobilePhone == "+9876543210"
            user.userProfile.instagram == "https://instagram.com/jane"
            user.userProfile.linkedin == "https://linkedin.com/in/jane"
    }

    def "toEntity should return null when DTO is null"() {
        when: "converting null DTO"
            def user = UserProfileAdapter.toEntity(null)

        then: "null is returned"
            user == null
    }

    def "toUserProfileEntity should create profile correctly"() {
        given: "a DTO and user"
            def dto = new UserProfileDTO()
            dto.photo = "test-photo.jpg"
            dto.facebook = "https://facebook.com/test"
            dto.mobilePhone = "+1111111111"
            dto.instagram = "https://instagram.com/test"
            dto.linkedin = "https://linkedin.com/in/test"

            def user = new User()
            user.email = "test@example.com"

        when: "creating user profile entity"
            def userProfile = UserProfileAdapter.toUserProfileEntity(dto, user)

        then: "profile is correctly created"
            userProfile.photo == "test-photo.jpg"
            userProfile.facebook == "https://facebook.com/test"
            userProfile.mobilePhone == "+1111111111"
            userProfile.instagram == "https://instagram.com/test"
            userProfile.linkedin == "https://linkedin.com/in/test"
    }

    def "toUserProfileEntity should return null when DTO is null"() {
        given: "a user"
            def user = new User()

        when: "creating profile with null DTO"
            def userProfile = UserProfileAdapter.toUserProfileEntity(null, user)

        then: "null is returned"
            userProfile == null
    }

    def "toUserProfileEntity should return null when user is null"() {
        given: "a DTO"
            def dto = new UserProfileDTO()

        when: "creating profile with null user"
            def userProfile = UserProfileAdapter.toUserProfileEntity(dto, null)

        then: "null is returned"
            userProfile == null
    }
}
