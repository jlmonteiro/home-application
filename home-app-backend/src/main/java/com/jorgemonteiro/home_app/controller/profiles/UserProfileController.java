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
     * Returns the profile for the user identified by the given database ID.
     *
     * @param id the user's surrogate ID
     * @return 200 with the profile DTO, or 404 if no user is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Long id) {
        return userProfileService.getUserProfile(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Updates the profile for the user identified by the given database ID.
     *
     * @param id             the user's surrogate ID (path variable, applied to the DTO)
     * @param userProfileDTO the updated profile data; must pass validation constraints
     * @return 200 with the updated profile DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
            @PathVariable Long id,
            @RequestBody @Valid UserProfileDTO userProfileDTO) {

        userProfileDTO.setId(id);
        UserProfileDTO updated = userProfileService.updateUserProfile(userProfileDTO);

        return ResponseEntity.ok(updated);
    }
}