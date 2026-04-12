package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotNull;
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

    @NotNull(message = "Item ID is required")
    private Long itemId;

    private String itemName;

    private String itemPhoto;

    private Long storeId;

    private String storeName;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal price;

    private boolean bought;

    private Long version;
}
