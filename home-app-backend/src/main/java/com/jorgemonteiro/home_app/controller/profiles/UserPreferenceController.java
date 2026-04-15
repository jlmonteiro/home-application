package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserPreferenceDTO;
import com.jorgemonteiro.home_app.service.profiles.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user preferences.
 */
@RestController
@RequestMapping("/api/user/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {

    private final UserPreferenceService preferenceService;

    @GetMapping
    public ResponseEntity<UserPreferenceDTO> getPreferences(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        return ResponseEntity.ok(preferenceService.getPreferences(email));
    }

    @PutMapping
    public ResponseEntity<UserPreferenceDTO> updatePreferences(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody UserPreferenceDTO dto) {
        String email = principal.getAttribute("email");
        return ResponseEntity.ok(preferenceService.updatePreferences(email, dto));
    }
}
