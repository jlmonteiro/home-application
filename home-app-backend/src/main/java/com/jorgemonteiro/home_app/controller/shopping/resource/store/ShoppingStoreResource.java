package com.jorgemonteiro.home_app.controller.shopping.resource.store;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "stores", itemRelation = "store")
public class ShoppingStoreResource extends HateoasResource<ShoppingStoreDTO> {
    public ShoppingStoreResource(ShoppingStoreDTO dto) {
        super(dto, Collections.emptyList());
    }
}
