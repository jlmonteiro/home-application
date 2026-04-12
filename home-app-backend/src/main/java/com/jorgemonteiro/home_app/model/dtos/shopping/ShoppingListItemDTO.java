package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

import java.math.BigDecimal;

/**
 * Data transfer object for reading and updating a shopping list item.
 */
@Data
@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingListItemDTO {

    private Long id;

    private Long itemId;

    private String itemName;

    private String itemPhoto;

    private String categoryName;

    private String categoryIcon;

    private Long storeId;

    private String storeName;

    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal price;

    private Boolean bought;

    private Boolean unavailable;

    private Long version;
}
