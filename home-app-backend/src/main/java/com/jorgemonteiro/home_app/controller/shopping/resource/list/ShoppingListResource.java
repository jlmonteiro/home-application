package com.jorgemonteiro.home_app.controller.shopping.resource.list;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "lists", itemRelation = "list")
public class ShoppingListResource extends HateoasResource<ShoppingListDTO> {
    public ShoppingListResource(ShoppingListDTO dto) {
        super(dto, Collections.emptyList());
    }
}
