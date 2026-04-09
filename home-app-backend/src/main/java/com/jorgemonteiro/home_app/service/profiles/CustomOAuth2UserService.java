package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Custom OAuth 2.0 user service that hooks into the Spring Security OAuth flow.
 * After Google authenticates the user, this service extracts attributes,
 * fetches additional data from Google People API, and delegates to {@link UserService}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;
    private final GooglePeopleService googlePeopleService;

    /**
     * Loads the OAuth 2.0 user from Google and synchronises the local database record.
     * Includes birthdate fetching from Google People API and dynamic role assignment.
     *
     * @param userRequest the OAuth 2.0 user request containing the access token
     * @return the {@link OAuth2User} loaded from Google
     * @throws OAuth2AuthenticationException if loading the user from Google fails
     */
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String givenName = oauth2User.getAttribute("given_name");
        String familyName = oauth2User.getAttribute("family_name");
        String pictureUrl = oauth2User.getAttribute("picture");
        String accessToken = userRequest.getAccessToken().getTokenValue();

        Optional<LocalDate> birthdate = googlePeopleService.fetchBirthdate(accessToken);

        User user = userService.findOrCreateUser(email, givenName, familyName, pictureUrl, birthdate);

        List<GrantedAuthority> authorities = new ArrayList<>(oauth2User.getAuthorities());
        if (user.getUserProfile() != null && user.getUserProfile().getAgeGroupName() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getUserProfile().getAgeGroupName().toUpperCase()));
        }

        return new DefaultOAuth2User(authorities, oauth2User.getAttributes(), "email");
    }
}
