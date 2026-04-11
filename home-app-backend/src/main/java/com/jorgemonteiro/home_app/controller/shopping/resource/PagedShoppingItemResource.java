package com.jorgemonteiro.home_app.controller.shopping.resource;

import org.springframework.hateoas.Links;
import org.springframework.hateoas.PagedModel;

import java.util.Collection;

/**
 * Concrete paged resource for {@link ShoppingItemResource}.
 */
public class PagedShoppingItemResource extends PagedModel<ShoppingItemResource> {
    public PagedShoppingItemResource(Collection<ShoppingItemResource> content, PageMetadata metadata, Links links) {
        super(content, metadata, links);
    }
}
