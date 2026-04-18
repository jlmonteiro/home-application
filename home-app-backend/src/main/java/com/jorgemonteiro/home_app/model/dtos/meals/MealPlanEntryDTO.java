package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.util.List;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntry}.
 */
@Data
@NoArgsConstructor
public class MealPlanEntryDTO {
    private Long id;
    private Long mealTimeId;
    private String mealTimeName;
    private DayOfWeek dayOfWeek;
    private Boolean isDone;
    private List<MealPlanEntryRecipeDTO> recipes;
    private MealPlanReactionDTO reactions;
}
