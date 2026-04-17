package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealTime}.
 */
@Data
@NoArgsConstructor
public class MealTimeDTO {
    private Long id;
    private String name;
    private Integer sortOrder;
    private List<MealTimeScheduleDTO> schedules;
    private Long version;
}
