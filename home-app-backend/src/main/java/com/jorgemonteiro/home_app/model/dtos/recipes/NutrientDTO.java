package com.jorgemonteiro.home_app.model.dtos.recipes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.Nutrient}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Relation(collectionRelation = "nutrients", itemRelation = "nutrient")
public class NutrientDTO {
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 50, message = "Name must not exceed 50 characters")
    private String name;

    private String description;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    private Long version;
}
