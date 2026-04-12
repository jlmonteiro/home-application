package com.jorgemonteiro.home_app.controller.shopping.resource;

import com.jorgemonteiro.home_app.controller.shopping.ShoppingListController;
import com.jorgemonteiro.home_app.model.dtos.shopping.ShoppingListItemDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Assembler for {@link ShoppingListItemResource}.
 */
@Component
public class ShoppingListItemResourceAssembler extends RepresentationModelAssemblerSupport<ShoppingListItemDTO, ShoppingListItemResource> {

    public ShoppingListItemResourceAssembler() {
        super(ShoppingListController.class, ShoppingListItemResource.class);
    }

    @Override
    public ShoppingListItemResource toModel(ShoppingListItemDTO dto) {
        ShoppingListItemResource resource = new ShoppingListItemResource(dto);
        
        // Items are nested resources, usually managed via the list
        resource.add(linkTo(methodOn(ShoppingListController.class).updateListItem(dto.getId(), dto)).withRel("update"));
        resource.add(linkTo(methodOn(ShoppingListController.class).removeListItem(dto.getId())).withRel("remove"));
        
        return resource;
    }
}
