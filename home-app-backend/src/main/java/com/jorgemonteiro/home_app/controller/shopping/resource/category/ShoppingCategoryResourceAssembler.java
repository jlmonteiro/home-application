package com.jorgemonteiro.home_app.controller.shopping.resource.category;

import com.jorgemonteiro.home_app.controller.shopping.ShoppingController;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingCategoryDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class ShoppingCategoryResourceAssembler extends RepresentationModelAssemblerSupport<ShoppingCategoryDTO, ShoppingCategoryResource> {
    public ShoppingCategoryResourceAssembler() {
        super(ShoppingController.class, ShoppingCategoryResource.class);
    }

    @Override
    public ShoppingCategoryResource toModel(ShoppingCategoryDTO dto) {
        ShoppingCategoryResource resource = new ShoppingCategoryResource(dto);
        resource.add(linkTo(methodOn(ShoppingController.class).getCategory(dto.getId())).withSelfRel());
        return resource;
    }
}
