package com.jorgemonteiro.home_app.model.dtos.recipes;

import com.jorgemonteiro.home_app.model.dtos.shared.ItemSummaryDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.RecipeIngredient}.
 */
@Data
@NoArgsConstructor
public class RecipeIngredientDTO {
    private Long id;
    private ItemSummaryDTO item;
    private BigDecimal quantity;
    private String groupName;
    private List<NutritionEntryDTO> nutritionEntries;
}
