package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealPlan}.
 */
@Data
@NoArgsConstructor
public class MealPlanDTO {
    private Long id;
    private LocalDate weekStartDate;
    private String status;
    private List<MealPlanEntryDTO> entries;
    private Long version;
}
