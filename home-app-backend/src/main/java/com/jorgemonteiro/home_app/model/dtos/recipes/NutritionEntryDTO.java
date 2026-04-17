package com.jorgemonteiro.home_app.model.dtos.recipes;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

import java.math.BigDecimal;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Relation(collectionRelation = "nutritionEntries", itemRelation = "nutritionEntry")
public class NutritionEntryDTO {
    private Long id;

    @NotNull(message = "Nutrient ID is required")
    private Long nutrientId;

    private String nutrientName;

    @NotNull(message = "Value is required")
    private BigDecimal value;

    private String unit;

    /**
     * Legacy constructor for backward compatibility and simplified mapping
     */
    public NutritionEntryDTO(String nutrientName, BigDecimal value, String unit) {
        this.nutrientName = nutrientName;
        this.value = value;
        this.unit = unit;
    }
}
