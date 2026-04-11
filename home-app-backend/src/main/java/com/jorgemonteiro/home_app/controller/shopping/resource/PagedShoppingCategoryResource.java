package com.jorgemonteiro.home_app.controller.shopping.resource;

import org.springframework.hateoas.Links;
import org.springframework.hateoas.PagedModel;

import java.util.Collection;

/**
 * Concrete paged resource for {@link ShoppingCategoryResource}.
 */
public class PagedShoppingCategoryResource extends PagedModel<ShoppingCategoryResource> {
    public PagedShoppingCategoryResource(Collection<ShoppingCategoryResource> content, PageMetadata metadata, Links links) {
        super(content, metadata, links);
    }
}
