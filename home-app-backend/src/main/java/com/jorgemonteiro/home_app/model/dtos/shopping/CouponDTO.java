package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDateTime;

/**
 * Data transfer object for reading and updating a coupon.
 */
@Data
@Relation(collectionRelation = "coupons", itemRelation = "coupon")
public class CouponDTO {

    private Long id;

    private Long storeId;

    private String storeName;

    @NotBlank(message = "Coupon name is required")
    @Size(max = 100, message = "Coupon name must not exceed 100 characters")
    private String name;

    private String description;

    @Size(max = 100, message = "Value description must not exceed 100 characters")
    private String value;

    private String photo;

    private LocalDateTime dueDate;

    private String code;

    @Pattern(regexp = "^(QR|CODE_128)$", message = "Barcode type must be QR or CODE_128")
    private String barcodeType;

    private boolean used;

    private Long version;
}
