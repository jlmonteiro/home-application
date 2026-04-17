package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

/**
 * Data transfer object for reading and updating a shopping item.
 */
@Data
@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingItemDTO {

    /** The database-generated surrogate primary key. */
    private Long id;

    /** The name of the item. */
    @NotBlank(message = "Item name is required")
    @Size(max = 100, message = "Item name must not exceed 100 characters")
    private String name;

    /** Base64-encoded photo data or URL. */
    private String photo;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    /** The category this item belongs to. */
    @NotNull(message = "Category is required")
    private Category category;

    /** Version number for optimistic locking. */
    private Long version;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Category {
        private Long id;
        private String name;
        private String icon;
    }
}
