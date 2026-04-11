package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

/**
 * Data transfer object for reading and updating a shopping category.
 */
@Data
@Relation(collectionRelation = "categories", itemRelation = "category")
public class ShoppingCategoryDTO {

    /** The database-generated surrogate primary key. */
    private Long id;

    /** The unique name of the category. */
    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name must not exceed 100 characters")
    private String name;

    /** A brief description of the category. */
    private String description;

    /** The name of the icon for this category. */
    @Size(max = 100, message = "Icon name must not exceed 100 characters")
    private String icon;

    /** Version number for optimistic locking. */
    private Long version;
}
