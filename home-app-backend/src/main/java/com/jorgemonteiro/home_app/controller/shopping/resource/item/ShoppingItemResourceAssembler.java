package com.jorgemonteiro.home_app.controller.shopping.resource.item;

import com.jorgemonteiro.home_app.controller.shopping.ShoppingController;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingItemDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class ShoppingItemResourceAssembler extends RepresentationModelAssemblerSupport<ShoppingItemDTO, ShoppingItemResource> {
    public ShoppingItemResourceAssembler() {
        super(ShoppingController.class, ShoppingItemResource.class);
    }

    @Override
    public ShoppingItemResource toModel(ShoppingItemDTO dto) {
        ShoppingItemResource resource = new ShoppingItemResource(dto);
        resource.add(linkTo(methodOn(ShoppingController.class).getItem(dto.getId())).withSelfRel());
        return resource;
    }
}
