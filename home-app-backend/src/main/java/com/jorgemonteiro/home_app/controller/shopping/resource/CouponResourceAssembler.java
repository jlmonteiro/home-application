package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.controller.shopping.StoreController;
import com.jorgemonteiro.home_app.model.dtos.shopping.CouponDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Assembler for creating {@link CouponResource}.
 */
@Component
public class CouponResourceAssembler extends RepresentationModelAssemblerSupport<CouponDTO, CouponResource> {

    public CouponResourceAssembler() {
        super(StoreController.class, CouponResource.class);
    }

    @Override
    public CouponResource toModel(CouponDTO dto) {
        CouponResource resource = new CouponResource(dto);
        resource.add(linkTo(methodOn(StoreController.class).updateCoupon(dto.getId(), dto)).withSelfRel());
        resource.add(linkTo(methodOn(StoreController.class).deleteCoupon(dto.getId())).withRel("delete"));
        return resource;
    }
}
