package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO;
import com.jorgemonteiro.home_app.model.entities.meals.MealPlan;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingList;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListItem;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus;
import com.jorgemonteiro.home_app.repository.meals.MealPlanRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListItemRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingStoreRepository;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service focused exclusively on the logic for exporting meal plan ingredients to shopping lists.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class MealPlanExportService {

    private final MealPlanRepository mealPlanRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final ShoppingItemRepository shoppingItemRepository;
    private final ShoppingStoreRepository storeRepository;
    private final UserRepository userRepository;
    private final PhotoService photoService;

    @Transactional(readOnly = true)
    public List<MealPlanExportItemDTO> getExportPreview(Long planId, Long targetListId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + planId + " not found"));

        Map<String, MealPlanExportItemDTO> aggregated = new HashMap<>();

        plan.getEntries().forEach(entry -> {
            entry.getRecipes().forEach(recipeAssignment -> {
                BigDecimal multiplier = recipeAssignment.getMultiplier() != null ? recipeAssignment.getMultiplier() : BigDecimal.ONE;
                
                recipeAssignment.getRecipe().getIngredients().forEach(ing -> {
                    ShoppingItem item = ing.getItem();
                    String key = item.getId() + ":" + item.getUnit();
                    
                    MealPlanExportItemDTO exportItem = aggregated.getOrDefault(key, new MealPlanExportItemDTO(
                            item.getId(),
                            item.getName(),
                            BigDecimal.ZERO,
                            item.getUnit(),
                            BigDecimal.ZERO
                    ));
                    
                    exportItem.setItemPhoto(photoService.getPhotoUrl(item.getPhoto()));
                    
                    BigDecimal scaledQuantity = ing.getQuantity().multiply(multiplier);
                    exportItem.setQuantity(exportItem.getQuantity().add(scaledQuantity));
                    
                    aggregated.put(key, exportItem);
                });
            });
        });

        if (targetListId != null && targetListId > 0) {
            List<ShoppingListItem> existingItems = shoppingListItemRepository.findAllByListId(targetListId);
            existingItems.forEach(existing -> {
                String key = existing.getItem().getId() + ":" + existing.getItem().getUnit();
                if (aggregated.containsKey(key)) {
                    aggregated.get(key).setExistingQuantity(existing.getQuantity());
                }
            });
        }

        return new ArrayList<>(aggregated.values());
    }

    public void exportToList(Long planId, Long targetListId, List<MealPlanExportItemDTO> itemsToExport, String newListName, String userEmail) {
        ShoppingList list;
        if (targetListId != null && targetListId > 0) {
            log.info("Exporting to existing list: {}", targetListId);
            list = shoppingListRepository.findById(targetListId)
                .orElseThrow(() -> new ObjectNotFoundException("ShoppingList with id " + targetListId + " not found"));
        } else {
            log.info("Creating new shopping list for export: {} (user: {})", newListName, userEmail);
            User creator = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ObjectNotFoundException("User not found: " + userEmail));
            list = new ShoppingList();
            list.setName(newListName != null && !newListName.isBlank() ? newListName : "Meal Plan Export - " + LocalDate.now());
            list.setCreatedBy(creator);
            list.setStatus(ShoppingListStatus.PENDING);
            list = shoppingListRepository.save(list);
            log.info("Created new shopping list with ID: {}", list.getId());
        }

        for (MealPlanExportItemDTO dto : itemsToExport) {
            ShoppingListItem existing = shoppingListItemRepository.findByListIdAndItemId(list.getId(), dto.getItemId())
                    .orElse(null);

            if (existing != null) {
                existing.setQuantity(existing.getQuantity().add(dto.getQuantity()));
                if (dto.getStoreId() != null) {
                    existing.setStore(storeRepository.findById(dto.getStoreId()).orElse(existing.getStore()));
                }
                shoppingListItemRepository.save(existing);
            } else {
                ShoppingListItem newItem = new ShoppingListItem();
                newItem.setList(list);
                newItem.setItem(shoppingItemRepository.findById(dto.getItemId())
                        .orElseThrow(() -> new ObjectNotFoundException("Item not found: " + dto.getItemId())));
                newItem.setQuantity(dto.getQuantity());
                newItem.setBought(false);
                if (dto.getStoreId() != null) {
                    newItem.setStore(storeRepository.findById(dto.getStoreId()).orElse(null));
                }
                shoppingListItemRepository.save(newItem);
            }
        }
    }
}
