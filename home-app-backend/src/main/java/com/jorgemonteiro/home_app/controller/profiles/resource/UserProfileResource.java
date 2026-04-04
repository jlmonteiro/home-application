package com.jorgemonteiro.home_app.controller.profiles.resource;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.server.core.Relation;

import java.util.List;

/**
 * A hypermedia-enabled resource representing a User Profile.
 * Extends EntityModel to hide generic verbosity in controllers.
 */
@Relation(collectionRelation = "userProfiles", itemRelation = "userProfile")
public class UserProfileResource extends EntityModel<UserProfileDTO> {

    public UserProfileResource(UserProfileDTO content, Iterable<Link> links) {
        super(content, links);
    }

    public UserProfileResource(UserProfileDTO content, Link... links) {
        super(content, List.of(links));
    }
}
