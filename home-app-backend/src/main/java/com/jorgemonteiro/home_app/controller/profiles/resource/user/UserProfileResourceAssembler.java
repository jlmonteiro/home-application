package com.jorgemonteiro.home_app.controller.profiles.resource.user;

import com.jorgemonteiro.home_app.controller.profiles.UserProfileController;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class UserProfileResourceAssembler extends RepresentationModelAssemblerSupport<UserProfileDTO, UserProfileResource> {
    public UserProfileResourceAssembler() {
        super(UserProfileController.class, UserProfileResource.class);
    }

    @Override
    public UserProfileResource toModel(UserProfileDTO entity) {
        UserProfileResource resource = new UserProfileResource(entity);
        resource.add(linkTo(methodOn(UserProfileController.class).getUserProfile(entity.getId())).withSelfRel());
        resource.add(linkTo(methodOn(UserProfileController.class).getAllProfiles(Pageable.unpaged())).withRel("collection"));
        return resource;
    }
}
