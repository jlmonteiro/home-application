package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

/**
 * Concrete resource wrapper for {@link LoyaltyCardDTO}.
 */
@Getter
@Setter
@Relation(collectionRelation = "loyaltyCards", itemRelation = "loyaltyCard")
public class LoyaltyCardResource extends RepresentationModel<LoyaltyCardResource> {
    private Long id;
    private Long storeId;
    private String storeName;
    private String name;
    private String number;
    private String barcodeType;
    private Long version;

    public LoyaltyCardResource(LoyaltyCardDTO dto) {
        this.id = dto.getId();
        this.storeId = dto.getStoreId();
        this.storeName = dto.getStoreName();
        this.name = dto.getName();
        this.number = dto.getNumber();
        this.barcodeType = dto.getBarcodeType();
        this.version = dto.getVersion();
    }
}
