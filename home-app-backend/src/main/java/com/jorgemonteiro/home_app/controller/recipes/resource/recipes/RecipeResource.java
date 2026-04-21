package com.jorgemonteiro.home_app.controller.recipes.resource.recipes;

import com.fasterxml.jackson.annotation.JsonUnwrapped;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO;
import lombok.Getter;
import org.springframework.hateoas.RepresentationModel;
import org.springframework.hateoas.server.core.Relation;

/**
 * HATEOAS resource for {@link RecipeDTO}.
 */
@Getter
@Relation(collectionRelation = "recipes", itemRelation = "recipe")
public class RecipeResource extends RepresentationModel<RecipeResource> {

    @JsonUnwrapped
    private final RecipeDTO content;

    public RecipeResource(RecipeDTO content) {
        this.content = content;
    }
}
