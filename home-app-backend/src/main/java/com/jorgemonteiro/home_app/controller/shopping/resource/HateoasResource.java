package com.jorgemonteiro.home_app.controller.shopping.resource;

import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.Link;

import java.util.List;

/**
 * Generic HATEOAS resource wrapper for any DTO.
 * Eliminates the need for concrete resource classes.
 */
public class HateoasResource<T> extends EntityModel<T> {

    public HateoasResource(T content, Iterable<Link> links) {
        super(content, links);
    }

    public HateoasResource(T content, Link... links) {
        super(content, List.of(links));
    }
}
