package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealTimeSchedule}.
 */
@Data
@NoArgsConstructor
public class MealTimeScheduleDTO {
    private Long id;
    private Integer dayOfWeek;
    private LocalTime startTime;
}
