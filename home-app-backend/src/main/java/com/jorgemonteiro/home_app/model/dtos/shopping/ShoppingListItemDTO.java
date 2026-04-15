package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    private Category category;

    private Store store;

    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String unit;

    private BigDecimal price;

    private BigDecimal previousPrice;

    private Boolean bought;

    private Boolean unavailable;

    private Long version;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Category {
        private String name;
        private String icon;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Store {
        private Long id;
        private String name;
    }
}
