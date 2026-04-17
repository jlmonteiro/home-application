package com.jorgemonteiro.home_app.controller.recipes.resource.recipes;

import com.jorgemonteiro.home_app.controller.recipes.RecipeController;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO;
import org.springframework.hateoas.server.mvc.RepresentationModelAssemblerSupport;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

/**
 * Assembler for creating {@link RecipeResource} from {@link RecipeDTO}.
 */
@Component
public class RecipeResourceAssembler extends RepresentationModelAssemblerSupport<RecipeDTO, RecipeResource> {

    public RecipeResourceAssembler() {
        super(RecipeController.class, RecipeResource.class);
    }

    @Override
    @NonNull
    public RecipeResource toModel(@NonNull RecipeDTO dto) {
        RecipeResource resource = new RecipeResource(dto);
        resource.add(linkTo(methodOn(RecipeController.class).getRecipeById(dto.getId())).withSelfRel());
        return resource;
    }
}
