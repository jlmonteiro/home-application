package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.AgeGroupConfigDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.FamilyRoleDTO;
import com.jorgemonteiro.home_app.service.profiles.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for application settings and household configuration.
 * Access is restricted to users in the "Adult" age group.
 */
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADULT')")
public class SettingsController {

    private final SettingsService settingsService;

    /**
     * Returns the current age group configuration.
     *
     * @return 200 with the list of age group ranges
     */
    @GetMapping("/age-groups")
    public ResponseEntity<List<AgeGroupConfigDTO>> getAgeGroups() {
        return ResponseEntity.ok(settingsService.getAgeGroups());
    }

    /**
     * Updates the age group configuration and triggers a recalculation for all users.
     *
     * @param dtos the new age range definitions
     * @return 204 No Content
     */
    @PutMapping("/age-groups")
    public ResponseEntity<Void> updateAgeGroups(@RequestBody List<AgeGroupConfigDTO> dtos) {
        settingsService.updateAgeGroups(dtos);
        return ResponseEntity.noContent().build();
    }

    /**
     * Returns the available family roles.
     *
     * @return 200 with the list of roles
     */
    @GetMapping("/roles")
    public ResponseEntity<List<FamilyRoleDTO>> getFamilyRoles() {
        return ResponseEntity.ok(settingsService.getFamilyRoles());
    }
}
