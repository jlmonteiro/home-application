package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutritionEntryDTO;
import com.jorgemonteiro.home_app.model.entities.recipes.Nutrient;
import com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.repository.recipes.NutrientRepository;
import com.jorgemonteiro.home_app.repository.recipes.NutritionEntryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
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

    private final NutritionEntryRepository nutritionEntryRepository;
    private final ShoppingItemRepository shoppingItemRepository;
    private final NutrientRepository nutrientRepository;
    private final RecipeAdapter recipeAdapter;

    @GetMapping
    public CollectionModel<NutritionEntryDTO> getNutritionEntries(@PathVariable Long itemId) {
        List<NutritionEntryDTO> list = nutritionEntryRepository.findAllByItemId(itemId).stream()
                .map(recipeAdapter::toNutritionDTO)
                .collect(Collectors.toList());
        return CollectionModel.of(list);
    }

    @PutMapping
    public NutritionEntryDTO upsertNutritionEntry(@PathVariable Long itemId, @Valid @RequestBody NutritionEntryDTO dto) {
        ShoppingItem item = shoppingItemRepository.findById(itemId)
                .orElseThrow(() -> new ObjectNotFoundException("ShoppingItem with id " + itemId + " not found"));

        Nutrient nutrient = nutrientRepository.findById(dto.getNutrientId())
                .orElseThrow(() -> new ObjectNotFoundException("Nutrient with id " + dto.getNutrientId() + " not found"));

        NutritionEntry entry = nutritionEntryRepository.findByItemIdAndNutrientId(itemId, dto.getNutrientId())
                .orElse(new NutritionEntry());
        
        entry.setItem(item);
        entry.setNutrient(nutrient);
        entry.setValue(dto.getValue());

        return recipeAdapter.toNutritionDTO(nutritionEntryRepository.save(entry));
    }

    @DeleteMapping("/{nutrientId}")
    public void deleteNutritionEntry(@PathVariable Long itemId, @PathVariable Long nutrientId) {
        NutritionEntry entry = nutritionEntryRepository.findByItemIdAndNutrientId(itemId, nutrientId)
                .orElseThrow(() -> new ObjectNotFoundException("NutritionEntry for nutrient " + nutrientId + " not found"));
        nutritionEntryRepository.delete(entry);
    }
}
