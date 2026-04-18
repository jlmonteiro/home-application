package com.jorgemonteiro.home_app.service.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.dtos.recipes.NutritionEntryDTO;
import com.jorgemonteiro.home_app.model.entities.recipes.Nutrient;
import com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.repository.recipes.NutrientRepository;
import com.jorgemonteiro.home_app.repository.recipes.NutritionEntryRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Service for managing nutrition data on shopping items.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class NutritionEntryService {

    private final NutritionEntryRepository nutritionEntryRepository;
    private final ShoppingItemRepository shoppingItemRepository;
    private final NutrientRepository nutrientRepository;

    @Transactional(readOnly = true)
    public List<NutritionEntry> getNutritionEntries(Long itemId) {
        return nutritionEntryRepository.findAllByItemId(itemId);
    }

    public NutritionEntry upsertNutritionEntry(Long itemId, NutritionEntryDTO dto) {
        ShoppingItem item = shoppingItemRepository.findById(itemId)
                .orElseThrow(() -> new ObjectNotFoundException("ShoppingItem with id " + itemId + " not found"));

        Long nutrientId = dto.getNutrient().getId();
        Nutrient nutrient = nutrientRepository.findById(nutrientId)
                .orElseThrow(() -> new ObjectNotFoundException("Nutrient with id " + nutrientId + " not found"));

        NutritionEntry entry = nutritionEntryRepository.findByItemIdAndNutrientId(itemId, nutrientId)
                .orElse(new NutritionEntry());
        
        entry.setItem(item);
        entry.setNutrient(nutrient);
        entry.setValue(dto.getValue());

        return nutritionEntryRepository.save(entry);
    }

    public void deleteNutritionEntry(Long itemId, Long nutrientId) {
        NutritionEntry entry = nutritionEntryRepository.findByItemIdAndNutrientId(itemId, nutrientId)
                .orElseThrow(() -> new ObjectNotFoundException("NutritionEntry for nutrient " + nutrientId + " not found"));
        nutritionEntryRepository.delete(entry);
    }
}
