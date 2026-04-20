package com.jorgemonteiro.home_app.model.dtos.meals;

import com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntryItem}.
 */
@Data
@NoArgsConstructor
public class MealPlanEntryItemDTO {
    private Long id;
    private ShoppingItemDTO item;
    private List<UserSummaryDTO> users;
    private BigDecimal quantity;
    private String unit;
}
