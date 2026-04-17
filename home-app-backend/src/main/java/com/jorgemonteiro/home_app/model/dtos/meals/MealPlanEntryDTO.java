package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Integer dayOfWeek;
    private Boolean isDone;
    private List<MealPlanEntryRecipeDTO> recipes;
    private Long thumbsUpCount;
    private Long thumbsDownCount;
}
