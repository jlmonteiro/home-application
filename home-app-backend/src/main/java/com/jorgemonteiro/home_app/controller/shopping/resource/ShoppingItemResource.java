package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

/**
 * Concrete resource wrapper for {@link ShoppingItemDTO} to provide HATEOAS links.
 */
@Getter
@Setter
@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingItemResource extends RepresentationModel<ShoppingItemResource> {
    private Long id;
    private String name;
    private String photo;
    private Long categoryId;
    private String categoryName;
    private Long version;

    public ShoppingItemResource(ShoppingItemDTO dto) {
        this.id = dto.getId();
        this.name = dto.getName();
        this.photo = dto.getPhoto();
        this.categoryId = dto.getCategoryId();
        this.categoryName = dto.getCategoryName();
        this.version = dto.getVersion();
    }
}
