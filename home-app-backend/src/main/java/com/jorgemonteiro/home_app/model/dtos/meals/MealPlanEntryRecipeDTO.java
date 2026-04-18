package com.jorgemonteiro.home_app.model.dtos.meals;

import com.jorgemonteiro.home_app.model.dtos.shared.EntitySummaryDTO;
import com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntryRecipe}.
 */
@Data
@NoArgsConstructor
public class MealPlanEntryRecipeDTO {
    private Long id;
    private EntitySummaryDTO recipe;
    private List<UserSummaryDTO> users;
    private BigDecimal multiplier;
}
