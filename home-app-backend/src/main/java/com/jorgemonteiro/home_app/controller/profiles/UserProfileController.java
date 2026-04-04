package com.jorgemonteiro.home_app.controller.profiles;

import com.jorgemonteiro.home_app.controller.profiles.resource.PagedUserProfileResource;
import com.jorgemonteiro.home_app.controller.profiles.resource.UserProfileResource;
import com.jorgemonteiro.home_app.controller.profiles.resource.UserProfileResourceAssembler;
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
import org.springframework.web.bind.annotation.*;

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
}
