package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

import java.math.BigDecimal;

/**
 * Concrete resource wrapper for {@link ShoppingListItemDTO}.
 */
@Getter
@Setter
@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingListItemResource extends RepresentationModel<ShoppingListItemResource> {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemPhoto;
    private String categoryName;
    private String categoryIcon;
    private Long storeId;
    private String storeName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal price;
    private BigDecimal previousPrice;
    private boolean bought;
    private boolean unavailable;
    private Long version;

    public ShoppingListItemResource(ShoppingListItemDTO dto) {
        this.id = dto.getId();
        this.itemId = dto.getItemId();
        this.itemName = dto.getItemName();
        this.itemPhoto = dto.getItemPhoto();
        this.categoryName = dto.getCategoryName();
        this.categoryIcon = dto.getCategoryIcon();
        this.storeId = dto.getStoreId();
        this.storeName = dto.getStoreName();
        this.quantity = dto.getQuantity();
        this.unit = dto.getUnit();
        this.price = dto.getPrice();
        this.previousPrice = dto.getPreviousPrice();
        this.bought = Boolean.TRUE.equals(dto.getBought());
        this.unavailable = Boolean.TRUE.equals(dto.getUnavailable());
        this.version = dto.getVersion();
    }
}
