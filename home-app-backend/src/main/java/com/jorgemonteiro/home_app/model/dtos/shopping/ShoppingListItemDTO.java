package com.jorgemonteiro.home_app.model.dtos.shopping;

import com.jorgemonteiro.home_app.model.dtos.shared.ItemSummaryDTO;
import com.jorgemonteiro.home_app.model.dtos.shared.StoreSummaryDTO;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

import java.math.BigDecimal;

/**
 * Data transfer object for reading and updating a shopping list item.
 */
@Data
@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingListItemDTO {

    private Long id;

    private ItemSummaryDTO item;

    private StoreSummaryDTO store;

    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    private String unit;

    private Pricing pricing;

    private Boolean bought;

    private Boolean unavailable;

    private Long version;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Pricing {
        private BigDecimal price;
        private BigDecimal previousPrice;
    }
}
