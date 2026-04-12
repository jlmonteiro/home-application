package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

/**
 * Data transfer object for reading and updating a loyalty card.
 */
@Data
@Relation(collectionRelation = "loyaltyCards", itemRelation = "loyaltyCard")
public class LoyaltyCardDTO {

    private Long id;

    private Long storeId;

    private String storeName;

    @NotBlank(message = "Card name is required")
    @Size(max = 100, message = "Card name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Card number is required")
    @Size(max = 100, message = "Card number must not exceed 100 characters")
    private String number;

    @NotBlank(message = "Barcode type is required")
    @Pattern(regexp = "^(QR|CODE_128)$", message = "Barcode type must be QR or CODE_128")
    private String barcodeType;

    private Long version;
}
