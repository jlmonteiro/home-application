package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutritionEntryDTO;
import com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.repository.recipes.NutritionEntryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    @GetMapping
    public List<NutritionEntryDTO> getNutritionEntries(@PathVariable Long itemId) {
        return nutritionEntryRepository.findAllByItemId(itemId).stream()
                .map(RecipeAdapter::toNutritionDTO)
                .collect(Collectors.toList());
    }

    @PutMapping
    public NutritionEntryDTO upsertNutritionEntry(@PathVariable Long itemId, @Valid @RequestBody NutritionEntryDTO dto) {
        ShoppingItem item = shoppingItemRepository.findById(itemId)
                .orElseThrow(() -> new ObjectNotFoundException("ShoppingItem with id " + itemId + " not found"));

        NutritionEntry entry = nutritionEntryRepository.findByItemIdAndNutrientKey(itemId, dto.getNutrientKey())
                .orElse(new NutritionEntry());
        
        entry.setItem(item);
        entry.setNutrientKey(dto.getNutrientKey());
        entry.setValue(dto.getValue());
        entry.setUnit(dto.getUnit());

        return RecipeAdapter.toNutritionDTO(nutritionEntryRepository.save(entry));
    }

    @DeleteMapping("/{nutrientKey}")
    public void deleteNutritionEntry(@PathVariable Long itemId, @PathVariable String nutrientKey) {
        NutritionEntry entry = nutritionEntryRepository.findByItemIdAndNutrientKey(itemId, nutrientKey)
                .orElseThrow(() -> new ObjectNotFoundException("NutritionEntry for " + nutrientKey));
        nutritionEntryRepository.delete(entry);
    }
}
