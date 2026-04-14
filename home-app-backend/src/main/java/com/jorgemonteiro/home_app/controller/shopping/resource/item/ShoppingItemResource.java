package com.jorgemonteiro.home_app.controller.shopping.resource.item;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingItemResource extends HateoasResource<ShoppingItemDTO> {
    public ShoppingItemResource(ShoppingItemDTO dto) {
        super(dto, Collections.emptyList());
    }
}
