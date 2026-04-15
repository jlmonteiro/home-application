package com.jorgemonteiro.home_app.controller.shopping.resource.loyalty;

import com.jorgemonteiro.home_app.controller.shopping.StoreController;
import com.jorgemonteiro.home_app.model.dtos.shopping.LoyaltyCardDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@Component
public class LoyaltyCardResourceAssembler extends RepresentationModelAssemblerSupport<LoyaltyCardDTO, LoyaltyCardResource> {
    public LoyaltyCardResourceAssembler() {
        super(StoreController.class, LoyaltyCardResource.class);
    }

    @Override
    public LoyaltyCardResource toModel(LoyaltyCardDTO dto) {
        LoyaltyCardResource resource = new LoyaltyCardResource(dto);
        resource.add(linkTo(methodOn(StoreController.class).deleteLoyaltyCard(dto.getId())).withRel("delete"));
        return resource;
    }
}
