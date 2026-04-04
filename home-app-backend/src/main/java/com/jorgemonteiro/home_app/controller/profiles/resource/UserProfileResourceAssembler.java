package com.jorgemonteiro.home_app.controller.profiles.resource;

import com.jorgemonteiro.home_app.controller.profiles.UserProfileController;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Assembler to convert UserProfileDTOs into hypermedia-enabled UserProfileResources.
 * Centralizes the logic for adding standard links (self, collection).
 */
@Component
public class UserProfileResourceAssembler extends RepresentationModelAssemblerSupport<UserProfileDTO, UserProfileResource> {

    public UserProfileResourceAssembler() {
        super(UserProfileController.class, UserProfileResource.class);
    }

    @Override
    public UserProfileResource toModel(UserProfileDTO entity) {
        return new UserProfileResource(entity,
                linkTo(methodOn(UserProfileController.class).getUserProfile(entity.getId())).withSelfRel(),
                linkTo(methodOn(UserProfileController.class).list(Pageable.unpaged())).withRel("collection"));
    }
}
