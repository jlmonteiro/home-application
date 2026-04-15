package com.jorgemonteiro.home_app.controller.shopping.resource.list;

import com.jorgemonteiro.home_app.controller.shopping.ShoppingListController;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class ShoppingListResourceAssembler extends RepresentationModelAssemblerSupport<ShoppingListDTO, ShoppingListResource> {
    public ShoppingListResourceAssembler() {
        super(ShoppingListController.class, ShoppingListResource.class);
    }

    @Override
    public ShoppingListResource toModel(ShoppingListDTO dto) {
        ShoppingListResource resource = new ShoppingListResource(dto);
        resource.add(linkTo(methodOn(ShoppingListController.class).getList(dto.getId())).withSelfRel());
        resource.add(linkTo(methodOn(ShoppingListController.class).getAllLists()).withRel("lists"));
        return resource;
    }
}
