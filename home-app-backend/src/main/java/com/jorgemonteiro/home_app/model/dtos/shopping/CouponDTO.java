package com.jorgemonteiro.home_app.model.dtos.shopping;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDate;

/**
 * Data transfer object for reading and updating a coupon.
 */
@Data
@Relation(collectionRelation = "coupons", itemRelation = "coupon")
public class CouponDTO {

    private Long id;

    private Store store;

    @NotBlank(message = "Coupon name is required")
    @Size(max = 100, message = "Coupon name must not exceed 100 characters")
    private String name;

    private String description;

    @Size(max = 100, message = "Value description must not exceed 100 characters")
    private String value;

    private String photo;

    private LocalDate dueDate;

    private Barcode barcode;

    private boolean used;

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
