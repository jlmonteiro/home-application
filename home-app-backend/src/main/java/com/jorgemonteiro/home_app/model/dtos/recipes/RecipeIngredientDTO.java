package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.RecipeIngredient}.
 */
@Data
@NoArgsConstructor
public class RecipeIngredientDTO {
    private Long id;
    private Long itemId;
    private String itemName;
    private String itemPhoto;
    private BigDecimal quantity;
    private String unit;
    private String groupName;
    private java.util.List<NutritionEntryDTO> nutritionEntries;
}
