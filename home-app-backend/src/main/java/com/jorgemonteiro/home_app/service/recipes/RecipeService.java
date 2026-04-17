package com.jorgemonteiro.home_app.service.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutritionEntryDTO;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeIngredientDTO;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipePhotoDTO;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeStepDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeIngredient;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipePhoto;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeStep;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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
    private final LabelService labelService;
    private final ShoppingItemRepository shoppingItemRepository;

    @Transactional(readOnly = true)
    public Page<RecipeDTO> listAllRecipes(Pageable pageable) {
        return recipeRepository.findAll(pageable).map(RecipeAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + id + " not found"));
        
        RecipeDTO dto = RecipeAdapter.toDTO(recipe);
        dto.setNutritionTotals(calculateNutritionTotals(recipe));
        return dto;
    }

    public RecipeDTO createRecipe(RecipeDTO dto, OAuth2User principal) {
        String email = principal.getAttribute("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));

        Recipe recipe = RecipeAdapter.toEntity(dto);
        recipe.setCreatedBy(user);
        recipe.setLabels(labelService.getOrCreateLabels(dto.getLabels()));
        
        syncPhotos(recipe, dto);
        syncIngredients(recipe, dto);
        syncSteps(recipe, dto);

        Recipe saved = recipeRepository.save(recipe);
        RecipeDTO savedDto = RecipeAdapter.toDTO(saved);
        savedDto.setNutritionTotals(calculateNutritionTotals(saved));
        return savedDto;
    }

    public RecipeDTO updateRecipe(Long id, RecipeDTO dto) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + id + " not found"));

        recipe.setName(dto.getName());
        recipe.setDescription(dto.getDescription());
        recipe.setServings(dto.getServings());
        recipe.setSourceLink(dto.getSourceLink());
        recipe.setVideoLink(dto.getVideoLink());
        recipe.setPrepTimeMinutes(dto.getPrepTimeMinutes());
        
        recipe.setLabels(labelService.getOrCreateLabels(dto.getLabels()));
        
        syncPhotos(recipe, dto);
        syncIngredients(recipe, dto);
        syncSteps(recipe, dto);

        Recipe updated = recipeRepository.save(recipe);
        labelService.cleanupOrphanedLabels();
        
        RecipeDTO updatedDto = RecipeAdapter.toDTO(updated);
        updatedDto.setNutritionTotals(calculateNutritionTotals(updated));
        return updatedDto;
    }

    private void syncPhotos(Recipe recipe, RecipeDTO dto) {
        if (dto.getPhotos() != null) {
            // Surgical sync for photos
            Map<Long, RecipePhoto> existingPhotos = recipe.getPhotos().stream()
                    .filter(p -> p.getId() != null)
                    .collect(Collectors.toMap(RecipePhoto::getId, p -> p));

            List<RecipePhoto> newPhotos = dto.getPhotos().stream()
                    .map(photoDto -> {
                        RecipePhoto photo = existingPhotos.get(photoDto.getId());
                        if (photo == null) {
                            photo = RecipeAdapter.toPhotoEntity(photoDto);
                            photo.setRecipe(recipe);
                        } else {
                            photo.setPhotoData(photoDto.getPhotoData());
                            photo.setIsDefault(photoDto.getIsDefault());
                        }
                        return photo;
                    })
                    .collect(Collectors.toList());

            recipe.getPhotos().clear();
            recipe.getPhotos().addAll(newPhotos);
        }
    }

    private void syncIngredients(Recipe recipe, RecipeDTO dto) {
        if (dto.getIngredients() != null) {
            // Surgical sync for ingredients
            Map<Long, RecipeIngredient> existingIngs = recipe.getIngredients().stream()
                    .filter(i -> i.getId() != null)
                    .collect(Collectors.toMap(RecipeIngredient::getId, i -> i));

            List<RecipeIngredient> newIngs = dto.getIngredients().stream()
                    .map(ingDto -> {
                        RecipeIngredient ing = existingIngs.get(ingDto.getId());
                        if (ing == null) {
                            ing = new RecipeIngredient();
                            ing.setRecipe(recipe);
                        }
                        ing.setQuantity(ingDto.getQuantity());
                        ing.setUnit(ingDto.getUnit());
                        
                        ShoppingItem item = shoppingItemRepository.findById(ingDto.getItemId())
                                .orElseThrow(() -> new ObjectNotFoundException("ShoppingItem with id " + ingDto.getItemId() + " not found"));
                        ing.setItem(item);
                        return ing;
                    })
                    .collect(Collectors.toList());

            recipe.getIngredients().clear();
            recipe.getIngredients().addAll(newIngs);
        }
    }

    private void syncSteps(Recipe recipe, RecipeDTO dto) {
        if (dto.getSteps() != null) {
            // Surgical sync for steps to avoid Optimistic Locking issues
            Map<Long, RecipeStep> existingSteps = recipe.getSteps().stream()
                    .filter(s -> s.getId() != null)
                    .collect(Collectors.toMap(RecipeStep::getId, s -> s));

            List<RecipeStep> newSteps = dto.getSteps().stream()
                    .map(stepDto -> {
                        RecipeStep step = existingSteps.get(stepDto.getId());
                        if (step == null) {
                            step = RecipeAdapter.toStepEntity(stepDto);
                            step.setRecipe(recipe);
                        } else {
                            step.setInstruction(stepDto.getInstruction());
                            step.setTimeMinutes(stepDto.getTimeMinutes());
                            step.setSortOrder(stepDto.getSortOrder());
                        }
                        return step;
                    })
                    .collect(Collectors.toList());

            recipe.getSteps().clear();
            recipe.getSteps().addAll(newSteps);
        }
    }

    private List<NutritionEntryDTO> calculateNutritionTotals(Recipe recipe) {
        Map<String, List<NutritionEntryDTO>> groupedNutrients = recipe.getIngredients().stream()
                .flatMap(ing -> ing.getItem().getNutritionEntries().stream()
                        .map(ne -> new NutritionEntryDTO(
                                ne.getNutrientKey(),
                                ne.getValue().multiply(ing.getQuantity()),
                                ne.getUnit()
                        )))
                .collect(Collectors.groupingBy(NutritionEntryDTO::getNutrientKey));

        return groupedNutrients.entrySet().stream()
                .map(entry -> {
                    String key = entry.getKey();
                    List<NutritionEntryDTO> values = entry.getValue();
                    BigDecimal totalValue = values.stream()
                            .map(NutritionEntryDTO::getValue)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String unit = values.get(0).getUnit();
                    return new NutritionEntryDTO(key, totalValue, unit);
                })
                .collect(Collectors.toList());
    }

    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new ObjectNotFoundException("Recipe with id " + id + " not found");
        }
        recipeRepository.deleteById(id);
        labelService.cleanupOrphanedLabels();
    }

    /**
     * Reorders preparation steps for a recipe (US-4).
     * @param recipeId the ID of the recipe.
     * @param stepIds the ordered list of step IDs.
     * @return the updated recipe DTO.
     */
    public RecipeDTO reorderSteps(Long recipeId, List<Long> stepIds) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + recipeId + " not found"));

        Map<Long, RecipeStep> stepsMap = recipe.getSteps().stream()
                .collect(Collectors.toMap(RecipeStep::getId, s -> s));

        for (int i = 0; i < stepIds.size(); i++) {
            RecipeStep step = stepsMap.get(stepIds.get(i));
            if (step != null) {
                step.setSortOrder(i);
            }
        }

        Recipe saved = recipeRepository.save(recipe);
        return RecipeAdapter.toDTO(saved);
    }
}
