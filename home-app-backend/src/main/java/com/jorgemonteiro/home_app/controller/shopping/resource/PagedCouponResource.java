package com.jorgemonteiro.home_app.controller.shopping.resource;

import org.springframework.hateoas.Links;
import org.springframework.hateoas.PagedModel;

import java.util.Collection;

/**
 * Concrete paged resource for {@link CouponResource}.
 */
public class PagedCouponResource extends PagedModel<CouponResource> {
    public PagedCouponResource(Collection<CouponResource> content, PageMetadata metadata, Links links) {
        super(content, metadata, links);
    }
}
