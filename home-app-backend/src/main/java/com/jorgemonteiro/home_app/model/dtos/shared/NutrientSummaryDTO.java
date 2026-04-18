package com.jorgemonteiro.home_app.model.dtos.shared;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared DTO for basic nutrient information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NutrientSummaryDTO {
    private Long id;
    private String name;
    private String unit;
}
