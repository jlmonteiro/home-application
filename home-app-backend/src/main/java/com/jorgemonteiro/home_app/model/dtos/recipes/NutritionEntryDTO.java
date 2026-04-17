package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry}.
 */
@Data
@NoArgsConstructor
public class NutritionEntryDTO {
    private Long id;
    private String nutrientKey;
    private BigDecimal value;
    private String unit;

    public NutritionEntryDTO(String nutrientKey, BigDecimal value, String unit) {
        this.nutrientKey = nutrientKey;
        this.value = value;
        this.unit = unit;
    }
}
