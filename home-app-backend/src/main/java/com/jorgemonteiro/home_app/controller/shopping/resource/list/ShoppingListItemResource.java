package com.jorgemonteiro.home_app.controller.shopping.resource.list;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "items", itemRelation = "item")
public class ShoppingListItemResource extends HateoasResource<ShoppingListItemDTO> {
    public ShoppingListItemResource(ShoppingListItemDTO dto) {
        super(dto, Collections.emptyList());
    }
}
