package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

/**
 * Data transfer object for reading and updating a shopping store.
 */
@Data
@Relation(collectionRelation = "stores", itemRelation = "store")
public class ShoppingStoreDTO {

    private Long id;

    @NotBlank(message = "Store name is required")
    @Size(max = 100, message = "Store name must not exceed 100 characters")
    private String name;

    private String description;

    @Size(max = 100, message = "Icon name must not exceed 100 characters")
    private String icon;

    private String photo;

    private Integer validCouponsCount;

    private Long version;
}
