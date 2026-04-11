package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.controller.shopping.StoreController;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingStoreDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Assembler for creating {@link ShoppingStoreResource}.
 */
@Component
public class ShoppingStoreResourceAssembler extends RepresentationModelAssemblerSupport<ShoppingStoreDTO, ShoppingStoreResource> {

    public ShoppingStoreResourceAssembler() {
        super(StoreController.class, ShoppingStoreResource.class);
    }

    @Override
    public ShoppingStoreResource toModel(ShoppingStoreDTO dto) {
        ShoppingStoreResource resource = new ShoppingStoreResource(dto);
        resource.add(linkTo(methodOn(StoreController.class).getStore(dto.getId())).withSelfRel());
        resource.add(linkTo(methodOn(StoreController.class).listLoyaltyCards(dto.getId())).withRel("loyaltyCards"));
        resource.add(linkTo(methodOn(StoreController.class).listCoupons(dto.getId(), null)).withRel("coupons"));
        return resource;
    }
}
