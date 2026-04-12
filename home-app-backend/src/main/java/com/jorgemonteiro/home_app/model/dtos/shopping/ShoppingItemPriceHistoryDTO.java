package com.jorgemonteiro.home_app.model.dtos.shopping;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data transfer object for a price history entry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingItemPriceHistoryDTO {
    private Long id;
    private Long storeId;
    private String storeName;
    private BigDecimal price;
    private LocalDateTime recordedAt;
}
