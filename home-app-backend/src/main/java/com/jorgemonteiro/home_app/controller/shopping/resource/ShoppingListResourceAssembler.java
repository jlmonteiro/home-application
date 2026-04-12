package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.controller.shopping.ShoppingListController;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Assembler for {@link ShoppingListResource}.
 */
@Component
public class ShoppingListResourceAssembler extends RepresentationModelAssemblerSupport<ShoppingListDTO, ShoppingListResource> {

    private final ShoppingListItemResourceAssembler itemAssembler;

    public ShoppingListResourceAssembler(ShoppingListItemResourceAssembler itemAssembler) {
        super(ShoppingListController.class, ShoppingListResource.class);
        this.itemAssembler = itemAssembler;
    }

    @Override
    public ShoppingListResource toModel(ShoppingListDTO dto) {
        ShoppingListResource resource = new ShoppingListResource(dto);
        
        resource.add(linkTo(methodOn(ShoppingListController.class).getList(dto.getId())).withSelfRel());
        resource.add(linkTo(methodOn(ShoppingListController.class).getAllLists()).withRel("lists"));
        
        if (dto.getItems() != null) {
            resource.setItems(dto.getItems().stream()
                    .map(itemAssembler::toModel)
                    .collect(Collectors.toList()));
        }
        
        return resource;
    }
}
