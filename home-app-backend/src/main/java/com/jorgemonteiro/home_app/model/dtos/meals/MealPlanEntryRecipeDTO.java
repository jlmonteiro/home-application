package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntryRecipe}.
 */
@Data
@NoArgsConstructor
public class MealPlanEntryRecipeDTO {
    private Long id;
    private Long recipeId;
    private String recipeName;
    private Long userId;
    private String userName;
}
