package com.jorgemonteiro.home_app.config;

import com.jorgemonteiro.home_app.service.profiles.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration for non-test environments.
 * Enables Google OAuth 2.0 login and protects all endpoints except the root,
 * login, and error pages. Not active in the {@code test} profile — see
 * {@code TestSecurityConfig} for the test-profile equivalent.
 */
@Configuration
@EnableWebSecurity
@Profile("!test")
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    /**
     * Configures the main security filter chain.
     * <ul>
     *   <li>Public access: {@code /}, {@code /login}, {@code /error}</li>
     *   <li>All other requests require authentication</li>
     *   <li>OAuth 2.0 login via Google, redirecting to {@code /home} on success</li>
     *   <li>Logout invalidates the session and removes the {@code JSESSIONID} cookie</li>
     * </ul>
     *
     * @param http the {@link HttpSecurity} to configure
     * @return the built {@link SecurityFilterChain}
     * @throws Exception if the security configuration fails
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl("/home", true)
                .failureUrl("/login?error=true")
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }
}