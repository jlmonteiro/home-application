package com.jorgemonteiro.home_app.service.profiles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Custom OAuth 2.0 user service that hooks into the Spring Security OAuth flow.
 * After Google authenticates the user, this service extracts the user's profile
 * attributes and delegates to {@link UserService} to find or create the local account.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    /**
     * Loads the OAuth 2.0 user from Google and synchronises the local database record.
     * The Google {@link OAuth2User} is returned unchanged so that Spring Security can
     * establish the authentication context.
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

        userService.findOrCreateUser(email, givenName, familyName, pictureUrl);

        return oauth2User;
    }
}