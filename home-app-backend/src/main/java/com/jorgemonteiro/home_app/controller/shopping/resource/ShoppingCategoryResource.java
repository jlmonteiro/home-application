package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

/**
 * Concrete resource wrapper for {@link ShoppingCategoryDTO} to provide HATEOAS links.
 */
@Getter
@Setter
@Relation(collectionRelation = "categories", itemRelation = "category")
public class ShoppingCategoryResource extends RepresentationModel<ShoppingCategoryResource> {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private Long version;

    public ShoppingCategoryResource(ShoppingCategoryDTO dto) {
        this.id = dto.getId();
        this.name = dto.getName();
        this.description = dto.getDescription();
        this.icon = dto.getIcon();
        this.version = dto.getVersion();
    }
}
