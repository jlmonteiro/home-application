package com.jorgemonteiro.home_app.controller.profiles.resource;

import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedModel;

import java.util.Collection;

/**
 * A hypermedia-enabled resource representing a paginated collection of User Profiles.
 * Extends PagedModel to hide generic verbosity in controllers.
 */
public class PagedUserProfileResource extends PagedModel<UserProfileResource> {

    public PagedUserProfileResource(Collection<UserProfileResource> content, PageMetadata metadata, Iterable<Link> links) {
        super(content, metadata, links);
    }
}
