package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

/**
 * Concrete resource wrapper for {@link ShoppingStoreDTO}.
 */
@Getter
@Setter
@Relation(collectionRelation = "stores", itemRelation = "store")
public class ShoppingStoreResource extends RepresentationModel<ShoppingStoreResource> {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private String photo;
    private Long version;

    public ShoppingStoreResource(ShoppingStoreDTO dto) {
        this.id = dto.getId();
        this.name = dto.getName();
        this.description = dto.getDescription();
        this.icon = dto.getIcon();
        this.photo = dto.getPhoto();
        this.version = dto.getVersion();
    }
}
