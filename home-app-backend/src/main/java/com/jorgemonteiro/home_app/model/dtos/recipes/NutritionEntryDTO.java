package com.jorgemonteiro.home_app.model.dtos.recipes;

import com.jorgemonteiro.home_app.model.dtos.shared.NutrientSummaryDTO;
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

    @NotNull(message = "Nutrient info is required")
    private NutrientSummaryDTO nutrient;

    @NotNull(message = "Value is required")
    private BigDecimal value;

    /**
     * Legacy constructor for backward compatibility and simplified mapping
     */
    public NutritionEntryDTO(String nutrientName, BigDecimal value, String unit) {
        this.nutrient = new NutrientSummaryDTO(null, nutrientName, unit);
        this.value = value;
    }
}
