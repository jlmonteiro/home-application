package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.service.profiles.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{email}")
    public ResponseEntity<UserProfileDTO> getUserProfile(
            @PathVariable String email) {

        return userProfileService.getUserProfile(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{email}")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable String email,
            @RequestBody @Valid UserProfileDTO userProfileDTO) {

        userProfileDTO.setEmail(email);
        UserProfileDTO updated = userProfileService.updateUserProfile(userProfileDTO);

        return ResponseEntity.ok(updated);
    }
}
