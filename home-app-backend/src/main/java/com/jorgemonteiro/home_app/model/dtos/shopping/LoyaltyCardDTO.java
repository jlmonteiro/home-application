package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

/**
 * Data transfer object for reading and updating a loyalty card.
 */
@Data
@Relation(collectionRelation = "loyaltyCards", itemRelation = "loyaltyCard")
public class LoyaltyCardDTO {

    private Long id;

    private Store store;

    @NotBlank(message = "Card name is required")
    @Size(max = 100, message = "Card name must not exceed 100 characters")
    private String name;

    private Barcode barcode;

    private Long version;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Store {
        private Long id;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Barcode {
        private String code;
        private String type;
    }
}
