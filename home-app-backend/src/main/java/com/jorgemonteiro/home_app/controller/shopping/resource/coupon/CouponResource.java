package com.jorgemonteiro.home_app.controller.shopping.resource.coupon;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "coupons", itemRelation = "coupon")
public class CouponResource extends HateoasResource<CouponDTO> {
    public CouponResource(CouponDTO dto) {
        super(dto, Collections.emptyList());
    }
}
