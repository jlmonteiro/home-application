package com.jorgemonteiro.home_app.controller.shopping.resource.category;

import com.jorgemonteiro.home_app.controller.shopping.resource.HateoasResource;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import org.springframework.hateoas.server.core.Relation;
import java.util.Collections;

@Relation(collectionRelation = "categories", itemRelation = "category")
public class ShoppingCategoryResource extends HateoasResource<ShoppingCategoryDTO> {
    public ShoppingCategoryResource(ShoppingCategoryDTO dto) {
        super(dto, Collections.emptyList());
    }
}
