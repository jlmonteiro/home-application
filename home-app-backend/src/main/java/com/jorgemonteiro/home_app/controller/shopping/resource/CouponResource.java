package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDateTime;

/**
 * Concrete resource wrapper for {@link CouponDTO}.
 */
@Getter
@Setter
@Relation(collectionRelation = "coupons", itemRelation = "coupon")
public class CouponResource extends RepresentationModel<CouponResource> {
    private Long id;
    private Long storeId;
    private String storeName;
    private String name;
    private String description;
    private String value;
    private String photo;
    private LocalDateTime dueDate;
    private boolean used;
    private Long version;

    public CouponResource(CouponDTO dto) {
        this.id = dto.getId();
        this.storeId = dto.getStoreId();
        this.storeName = dto.getStoreName();
        this.name = dto.getName();
        this.description = dto.getDescription();
        this.value = dto.getValue();
        this.photo = dto.getPhoto();
        this.dueDate = dto.getDueDate();
        this.used = dto.isUsed();
        this.version = dto.getVersion();
    }
}
