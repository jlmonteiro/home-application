package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for an item in the meal plan export preview.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanExportItemDTO {
    private Long itemId;
    private String itemName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal existingQuantity; // Quantity already in the target shopping list
}
