package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for reactions (thumbs up/down) on a meal plan entry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanReactionDTO {
    private long thumbsUp;
    private long thumbsDown;
}
