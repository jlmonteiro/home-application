package com.jorgemonteiro.home_app.controller.shopping.resource.loyalty;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "loyaltyCards", itemRelation = "loyaltyCard")
public class LoyaltyCardResource extends HateoasResource<LoyaltyCardDTO> {
    public LoyaltyCardResource(LoyaltyCardDTO dto) {
        super(dto, Collections.emptyList());
    }
}
