package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Concrete resource wrapper for {@link ShoppingListDTO}.
 */
@Getter
@Setter
@Relation(collectionRelation = "lists", itemRelation = "list")
public class ShoppingListResource extends RepresentationModel<ShoppingListResource> {
    private Long id;
    private String name;
    private String description;
    private String status;
    private String createdBy;
    private String creatorName;
    private List<ShoppingListItemResource> items;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long version;

    public ShoppingListResource(ShoppingListDTO dto) {
        this.id = dto.getId();
        this.name = dto.getName();
        this.description = dto.getDescription();
        this.status = dto.getStatus();
        this.createdBy = dto.getCreatedBy();
        this.creatorName = dto.getCreatorName();
        this.createdAt = dto.getCreatedAt();
        this.completedAt = dto.getCompletedAt();
        this.version = dto.getVersion();
    }
}
