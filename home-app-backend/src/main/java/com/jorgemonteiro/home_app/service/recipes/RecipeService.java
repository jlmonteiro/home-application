package com.jorgemonteiro.home_app.service.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.Optional;

/**
 * Service managing business logic for {@link Recipe}s.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    /**
     * Lists all recipes in a paginated format.
     * @param pageable pagination and sorting information.
     * @return a page of recipe DTOs.
     */
    @Transactional(readOnly = true)
    public Page<RecipeDTO> listAllRecipes(Pageable pageable) {
        log.debug("Listing all recipes with pageable: {}", pageable);
        return recipeRepository.findAll(pageable).map(RecipeAdapter::toDTO);
    }

    /**
     * Retrieves a single recipe by its ID.
     * @param id the ID of the recipe.
     * @return the recipe DTO.
     * @throws ObjectNotFoundException if no recipe is found with the given ID.
     */
    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id) {
        log.debug("Retrieving recipe by id: {}", id);
        return recipeRepository.findById(id)
                .map(RecipeAdapter::toDTO)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + id + " not found"));
    }

    /**
     * Creates a new recipe.
     * @param dto the DTO containing the recipe details.
     * @param principal the authenticated user creating the recipe.
     * @return the created recipe DTO.
     */
    public RecipeDTO createRecipe(RecipeDTO dto, OAuth2User principal) {
        String email = principal.getAttribute("email");
        log.info("Creating new recipe '{}' for user {}", dto.getName(), email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));

        Recipe recipe = RecipeAdapter.toEntity(dto);
        recipe.setCreatedBy(user);

        Recipe saved = recipeRepository.save(recipe);
        return RecipeAdapter.toDTO(saved);
    }

    /**
     * Updates an existing recipe.
     * @param id the ID of the recipe to update.
     * @param dto the DTO containing the updated details.
     * @return the updated recipe DTO.
     * @throws ObjectNotFoundException if no recipe is found with the given ID.
     */
    public RecipeDTO updateRecipe(Long id, RecipeDTO dto) {
        log.info("Updating recipe id: {}", id);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + id + " not found"));

        recipe.setName(dto.getName());
        recipe.setDescription(dto.getDescription());
        recipe.setServings(dto.getServings());
        recipe.setSourceLink(dto.getSourceLink());
        recipe.setVideoLink(dto.getVideoLink());
        recipe.setPrepTimeMinutes(dto.getPrepTimeMinutes());

        Recipe updated = recipeRepository.save(recipe);
        return RecipeAdapter.toDTO(updated);
    }

    /**
     * Deletes a recipe by its ID.
     * @param id the ID of the recipe to delete.
     * @throws ObjectNotFoundException if no recipe is found with the given ID.
     */
    public void deleteRecipe(Long id) {
        log.info("Deleting recipe id: {}", id);
        if (!recipeRepository.existsById(id)) {
            throw new ObjectNotFoundException("Recipe with id " + id + " not found");
        }
        recipeRepository.deleteById(id);
    }
}
