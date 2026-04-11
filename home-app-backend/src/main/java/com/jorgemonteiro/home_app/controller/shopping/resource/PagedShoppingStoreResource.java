package com.jorgemonteiro.home_app.controller.shopping.resource;

import org.springframework.hateoas.Links;
import org.springframework.hateoas.PagedModel;

import java.util.Collection;

/**
 * Concrete paged resource for {@link ShoppingStoreResource}.
 */
public class PagedShoppingStoreResource extends PagedModel<ShoppingStoreResource> {
    public PagedShoppingStoreResource(Collection<ShoppingStoreResource> content, PageMetadata metadata, Links links) {
        super(content, metadata, links);
    }
}
