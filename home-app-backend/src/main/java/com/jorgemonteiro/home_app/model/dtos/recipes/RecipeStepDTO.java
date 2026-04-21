package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.RecipeStep}.
 */
@Data
@NoArgsConstructor
public class RecipeStepDTO {
    private Long id;
    private String instruction;
    private Integer timeMinutes;
    private Integer sortOrder;
}
