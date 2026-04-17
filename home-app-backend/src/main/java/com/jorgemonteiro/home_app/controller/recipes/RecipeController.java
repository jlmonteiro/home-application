package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.controller.recipes.resource.recipes.RecipeResource;
import com.jorgemonteiro.home_app.controller.recipes.resource.recipes.RecipeResourceAssembler;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO;
import com.jorgemonteiro.home_app.service.recipes.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller providing endpoints for recipe management.
 */
@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;
    private final RecipeResourceAssembler recipeResourceAssembler;
    private final PagedResourcesAssembler<RecipeDTO> pagedResourcesAssembler;

    /**
     * Retrieves all recipes in a paginated format.
     * @param pageable pagination parameters.
     * @return paged model of recipe resources.
     */
    @GetMapping
    public PagedModel<RecipeResource> listAllRecipes(Pageable pageable) {
        var recipes = recipeService.listAllRecipes(pageable);
        return pagedResourcesAssembler.toModel(recipes, recipeResourceAssembler);
    }

    /**
     * Retrieves a specific recipe by ID.
     * @param id the ID of the recipe.
     * @return the recipe resource.
     */
    @GetMapping("/{id}")
    public RecipeResource getRecipeById(@PathVariable Long id) {
        return recipeResourceAssembler.toModel(recipeService.getRecipeById(id));
    }

    /**
     * Creates a new recipe.
     * @param dto recipe details.
     * @param principal authenticated user.
     * @return the created recipe resource.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecipeResource createRecipe(@Valid @RequestBody RecipeDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        return recipeResourceAssembler.toModel(recipeService.createRecipe(dto, principal));
    }

    /**
     * Updates an existing recipe.
     * @param id the ID of the recipe to update.
     * @param dto the updated recipe details.
     * @return the updated recipe resource.
     */
    @PutMapping("/{id}")
    public RecipeResource updateRecipe(@PathVariable Long id, @Valid @RequestBody RecipeDTO dto) {
        return recipeResourceAssembler.toModel(recipeService.updateRecipe(id, dto));
    }

    /**
     * Deletes a specific recipe.
     * @param id the ID of the recipe to delete.
     * @return 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
