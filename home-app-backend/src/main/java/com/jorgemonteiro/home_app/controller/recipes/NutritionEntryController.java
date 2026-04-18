package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutritionEntryDTO;
import com.jorgemonteiro.home_app.service.recipes.NutritionEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing nutrition data on shopping items.
 */
@RestController
@RequestMapping("/api/items/{itemId}/nutrition")
@RequiredArgsConstructor
public class NutritionEntryController {

    private final NutritionEntryService nutritionEntryService;
    private final RecipeAdapter recipeAdapter;

    @GetMapping
    public CollectionModel<NutritionEntryDTO> getNutritionEntries(@PathVariable Long itemId) {
        List<NutritionEntryDTO> list = nutritionEntryService.getNutritionEntries(itemId).stream()
                .map(recipeAdapter::toNutritionDTO)
                .collect(Collectors.toList());
        return CollectionModel.of(list);
    }

    @PutMapping
    public NutritionEntryDTO upsertNutritionEntry(@PathVariable Long itemId, @Valid @RequestBody NutritionEntryDTO dto) {
        return recipeAdapter.toNutritionDTO(nutritionEntryService.upsertNutritionEntry(itemId, dto));
    }

    @DeleteMapping("/{nutrientId}")
    public void deleteNutritionEntry(@PathVariable Long itemId, @PathVariable Long nutrientId) {
        nutritionEntryService.deleteNutritionEntry(itemId, nutrientId);
    }
}
