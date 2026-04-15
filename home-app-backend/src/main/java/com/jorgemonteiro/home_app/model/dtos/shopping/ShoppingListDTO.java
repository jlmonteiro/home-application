package com.jorgemonteiro.home_app.model.dtos.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data transfer object for reading and updating a shopping list.
 */
@Data
@Relation(collectionRelation = "lists", itemRelation = "list")
public class ShoppingListDTO {

    private Long id;

    @NotBlank(message = "List name is required")
    @Size(max = 100, message = "List name must not exceed 100 characters")
    private String name;

    private String description;

    private ShoppingListStatus status;

    private String createdBy;

    private String creatorName;

    private List<ShoppingListItemDTO> items;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    private Long version;

}
