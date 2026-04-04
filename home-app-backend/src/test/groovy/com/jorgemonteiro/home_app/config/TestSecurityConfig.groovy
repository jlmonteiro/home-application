package com.jorgemonteiro.home_app.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
@Profile("test")
class TestSecurityConfig {

    @Bean
    SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests { auth -> 
                auth.requestMatchers("/api/user/me").authenticated()
                auth.anyRequest().permitAll() 
            }
            .csrf { csrf -> csrf.disable() }
            .oauth2Login { oauth2 -> } // Enable oauth2Login structure for tests
        return http.build()
    }
}
