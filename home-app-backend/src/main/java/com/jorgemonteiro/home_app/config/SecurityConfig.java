package com.jorgemonteiro.home_app.config;

import com.jorgemonteiro.home_app.service.profiles.CustomOAuth2UserService;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Spring Security configuration for non-test environments.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Profile("!test")
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final String frontendUrl;

    public SecurityConfig(
            CustomOAuth2UserService customOAuth2UserService,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.customOAuth2UserService = customOAuth2UserService;
        this.frontendUrl = frontendUrl;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Configure CSRF protection with cookie-based token repository
            // Allows React frontend to read XSRF-TOKEN cookie and send it back as X-XSRF-TOKEN header
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            // Add custom filter after CSRF filter to ensure XSRF-TOKEN cookie is written on every request
            .addFilterAfter(csrfCookieFilter(), CsrfFilter.class)

            // Configure URL-based authorization rules
            // Public endpoints: home, login page, error page, OAuth2 callback, public images
            // All other endpoints require authentication
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/error", "/oauth2/**", "/api/images/**").permitAll()
                .anyRequest().authenticated()
            )

            // Configure exception handling for authentication failures
            // API requests (starting with /api) return 401 Unauthorized status
            // Other requests use default handling (typically redirect to login)
            .exceptionHandling(exception -> exception
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    request -> request.getServletPath().startsWith("/api")
                )
            )

            // Configure OAuth2 login flow
            // Uses custom user service to load/create user profile after successful authentication
            // Redirects to frontend URL on success, or to login error page on failure
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl(frontendUrl, true)
                .failureUrl(frontendUrl + "/login?error=true")
            )

            // Configure logout behavior
            // Clears session, deletes JSESSIONID cookie, redirects to login page
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl(frontendUrl + "/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }

    /**
     * Forces the deferred CSRF token to be loaded on every request,
     * ensuring the XSRF-TOKEN cookie is always set for the frontend.
     */
    private OncePerRequestFilter csrfCookieFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
                    throws ServletException, IOException {
                // Retrieve the CSRF token from the request attributes (Spring Security stores it here)
                CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());

                // If a CSRF token exists, call getToken() to trigger Spring Security to write the XSRF-TOKEN cookie
                // This ensures the React frontend can read the token and include it in subsequent requests
                if (csrfToken != null) csrfToken.getToken();

                // Continue the filter chain to process the rest of the request
                filterChain.doFilter(request, response);
            }
        };
    }
}
