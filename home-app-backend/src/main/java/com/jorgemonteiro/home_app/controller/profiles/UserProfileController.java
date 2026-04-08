package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.controller.profiles.resource.PagedUserProfileResource;
import com.jorgemonteiro.home_app.controller.profiles.resource.UserProfileResource;
import com.jorgemonteiro.home_app.controller.profiles.resource.UserProfileResourceAssembler;
import com.jorgemonteiro.home_app.exception.AuthenticationException;
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.service.profiles.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * REST controller for user profile operations.
 * Adheres to HATEOAS using concrete resource wrappers to hide generic verbosity.
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;
    private final UserProfileResourceAssembler resourceAssembler;
    private final PagedResourcesAssembler<UserProfileDTO> pagedResourcesAssembler;

    /**
     * Returns the profile for the currently authenticated user.
     *
     * @param principal the authenticated OAuth2 user
     * @return 200 with the UserProfileResource and canonical links
     * @throws HomeAppException if the principal is missing the required email attribute
     * @throws ObjectNotFoundException if the user record is missing from the database
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

    /**
     * Returns a paginated list of all user profiles.
     *
     * @param pageable pagination parameters
     * @return 200 with a PagedUserProfileResource (hides PagedModel<EntityModel<T>>)
     */
    @GetMapping
    public ResponseEntity<PagedUserProfileResource> list(
            @PageableDefault(size = 10, sort = "email", direction = Sort.Direction.ASC) Pageable pageable) {
        
        Page<UserProfileDTO> page = userProfileService.findAll(pageable);
        
        // Assemble standard PagedModel using our custom resource assembler
        PagedModel<UserProfileResource> pagedModel = pagedResourcesAssembler.toModel(page, resourceAssembler);
        
        // Wrap in our concrete type to keep the controller signature clean
        PagedUserProfileResource resource = new PagedUserProfileResource(
                pagedModel.getContent(), 
                pagedModel.getMetadata(), 
                pagedModel.getLinks());
        
        return ResponseEntity.ok(resource);
    }

    /**
     * Returns the profile for the user identified by the given database ID.
     *
     * @param id the user's surrogate ID
     * @return 200 with the UserProfileResource, or 404 if no user is found
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResource> getUserProfile(@PathVariable Long id) {
        return userProfileService.getUserProfile(id)
                .map(resourceAssembler::toModel)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ObjectNotFoundException("User not found with ID: " + id));
    }

    /**
     * Updates the profile for the user identified by the given database ID.
     *
     * @param id             the user's surrogate ID
     * @param userProfileDTO the updated profile data
     * @return 200 with the updated UserProfileResource
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserProfileResource> updateUserProfile(
            @PathVariable Long id,
            @RequestBody @Valid UserProfileDTO userProfileDTO) {

        userProfileDTO.setId(id);
        UserProfileDTO updated = userProfileService.updateUserProfile(userProfileDTO);

        return ResponseEntity.ok(resourceAssembler.toModel(updated));
    }

    /**
     * Updates the profile of the currently authenticated user.
     *
     * @param principal      the authenticated OAuth2 user
     * @param userProfileDTO updated profile data
     * @return 200 with the updated UserProfileResource
     * @throws HomeAppException if the principal is missing the required email attribute
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResource> putUserProfile(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody @Valid UserProfileDTO userProfileDTO) {

        String email = principal.getAttribute("email");
        if (email == null || email.isBlank()) {
            throw new AuthenticationException("Authentication principal is missing email attribute");
        }

        userProfileDTO.setEmail(email);
        UserProfileDTO updated = userProfileService.updateMyProfile(userProfileDTO);

        UserProfileResource resource = resourceAssembler.toModel(updated);
        resource.add(linkTo(methodOn(UserProfileController.class).getMyProfile(null)).withRel("me"));

        return ResponseEntity.ok(resource);
    }
}
