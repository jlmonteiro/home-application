package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.service.profiles.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for user profile operations.
 * All business logic is delegated to {@link UserProfileService};
 * this class is responsible for HTTP concerns only.
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Returns the profile for the user identified by the given email address.
     *
     * @param email the user's email address
     * @return 200 with the profile DTO, or 404 if no user is found
     */
    @GetMapping("/{email}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String email) {
        return userProfileService.getUserProfile(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Updates the profile for the user identified by the given email address.
     *
     * @param email          the user's email address (path variable, applied to the DTO)
     * @param userProfileDTO the updated profile data; must pass validation constraints
     * @return 200 with the updated profile DTO
     */
    @PutMapping("/{email}")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable String email,
            @RequestBody @Valid UserProfileDTO userProfileDTO) {

        userProfileDTO.setEmail(email);
        UserProfileDTO updated = userProfileService.updateUserProfile(userProfileDTO);

        return ResponseEntity.ok(updated);
    }
}