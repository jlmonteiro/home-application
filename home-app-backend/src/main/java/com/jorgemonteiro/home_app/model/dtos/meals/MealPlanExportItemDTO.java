package com.jorgemonteiro.home_app.model.dtos.meals;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for previewing and selecting ingredients to export to a shopping list.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanExportItemDTO {
    private Long itemId;
    private String itemName;
    private String itemPhoto;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal existingQuantity;
    private Long storeId;

    public MealPlanExportItemDTO(Long itemId, String itemName, BigDecimal quantity, String unit, BigDecimal existingQuantity) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.quantity = quantity;
        this.unit = unit;
        this.existingQuantity = existingQuantity;
    }
}
