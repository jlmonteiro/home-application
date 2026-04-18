package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.controller.profiles.resource.user.UserProfileResource;
import com.jorgemonteiro.home_app.controller.profiles.resource.user.UserProfileResourceAssembler;
import com.jorgemonteiro.home_app.exception.AuthenticationException;
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserAdapter;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserProfileAdapter;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.service.profiles.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for user profile management.
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final UserProfileResourceAssembler resourceAssembler;
    private final PagedResourcesAssembler<UserProfileDTO> pagedResourcesAssembler;

    /**
     * Returns the profile of the currently authenticated user.
     *
     * @param principal the authenticated OAuth2 user
     * @return 200 with the UserProfileResource
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResource> getMyProfile(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new AuthenticationException("Authentication principal is missing email attribute");
        }

        return userProfileService.getUserProfile(email)
                .map(resourceAssembler::toModel)
                .map(resource -> {
                    // Add supplementary 'me' link pointing back to this alias
                    resource.add(linkTo(methodOn(UserProfileController.class).getMyProfile(null)).withRel("me"));
                    return resource;
                })
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ObjectNotFoundException("User record not found for authenticated email: " + email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userProfileService.listAllUsers());
    }

    /**
     * Retrieves a user profile by ID.
     * @param id the ID of the user.
     * @return the profile resource.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResource> getUserProfile(@PathVariable Long id) {
        return userProfileService.getUserProfile(id)
                .map(resourceAssembler::toModel)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ObjectNotFoundException("User profile with id " + id + " not found"));
    }

    /**
     * Returns a paginated list of all user profiles.
     *
     * @param pageable pagination parameters
     * @return 200 with a PagedUserProfileResource (hides PagedModel<EntityModel<T>>)
     */
    @GetMapping("/profiles")
    public PagedModel<UserProfileResource> getAllProfiles(Pageable pageable) {
        return pagedResourcesAssembler.toModel(userProfileService.findAll(pageable), resourceAssembler);
    }

    /**
     * Updates the currently authenticated user's profile.
     *
     * @param principal the authenticated OAuth2 user
     * @param profileDTO the profile data to update
     * @return 200 with the updated UserProfileResource
     */
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResource> updateMyProfile(
            @AuthenticationPrincipal OAuth2User principal,
            @Valid @RequestBody UserProfileDTO profileDTO) {
        
        String email = principal.getAttribute("email");
        profileDTO.setEmail(email);
        
        UserProfileDTO updated = userProfileService.updateMyProfile(profileDTO);

        UserProfileResource resource = resourceAssembler.toModel(updated);
        resource.add(linkTo(methodOn(UserProfileController.class).getMyProfile(null)).withRel("me"));

        return ResponseEntity.ok(resource);
    }
}
