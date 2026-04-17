package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.meals.MealAdapter;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO;
import com.jorgemonteiro.home_app.model.entities.meals.MealPlan;
import com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntry;
import com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntryRecipe;
import com.jorgemonteiro.home_app.model.entities.meals.MealPlanVote;
import com.jorgemonteiro.home_app.model.entities.meals.MealTime;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingList;
import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListItem;
import com.jorgemonteiro.home_app.repository.meals.MealPlanEntryRepository;
import com.jorgemonteiro.home_app.repository.meals.MealPlanRepository;
import com.jorgemonteiro.home_app.repository.meals.MealPlanVoteRepository;
import com.jorgemonteiro.home_app.repository.meals.MealTimeRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListItemRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingListRepository;
import com.jorgemonteiro.home_app.service.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing weekly meal plans.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanVoteRepository mealPlanVoteRepository;
    private final MealTimeRepository mealTimeRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final ShoppingItemRepository shoppingItemRepository;

    @Transactional(readOnly = true)
    public List<MealPlanExportItemDTO> getExportPreview(Long planId, Long targetListId) {
        MealPlan plan = mealPlanRepository.findById(planId)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + planId + " not found"));

        Map<String, MealPlanExportItemDTO> aggregated = new java.util.HashMap<>();

        plan.getEntries().forEach(entry -> {
            entry.getRecipes().forEach(recipeAssignment -> {
                recipeAssignment.getRecipe().getIngredients().forEach(ing -> {
                    String key = ing.getItem().getId() + ":" + ing.getUnit();
                    MealPlanExportItemDTO item = aggregated.getOrDefault(key, new MealPlanExportItemDTO(
                            ing.getItem().getId(),
                            ing.getItem().getName(),
                            BigDecimal.ZERO,
                            ing.getUnit(),
                            BigDecimal.ZERO
                    ));
                    item.setQuantity(item.getQuantity().add(ing.getQuantity()));
                    aggregated.put(key, item);
                });
            });
        });

        if (targetListId != null) {
            List<ShoppingListItem> existingItems = shoppingListItemRepository.findAllByShoppingListId(targetListId);
            existingItems.forEach(existing -> {
                String key = existing.getItem().getId() + ":" + existing.getUnit();
                if (aggregated.containsKey(key)) {
                    aggregated.get(key).setExistingQuantity(existing.getQuantity());
                }
            });
        }

        return new java.util.ArrayList<>(aggregated.values());
    }

    public void exportToList(Long planId, Long targetListId, List<MealPlanExportItemDTO> itemsToExport) {
        ShoppingList list = shoppingListRepository.findById(targetListId)
                .orElseThrow(() -> new ObjectNotFoundException("ShoppingList with id " + targetListId + " not found"));

        for (MealPlanExportItemDTO dto : itemsToExport) {
            ShoppingListItem existing = shoppingListItemRepository.findByShoppingListIdAndItemIdAndUnit(targetListId, dto.getItemId(), dto.getUnit())
                    .orElse(null);

            if (existing != null) {
                existing.setQuantity(existing.getQuantity().add(dto.getQuantity()));
                shoppingListItemRepository.save(existing);
            } else {
                ShoppingListItem newItem = new ShoppingListItem();
                newItem.setList(list);
                newItem.setItem(shoppingItemRepository.findById(dto.getItemId()).orElseThrow());
                newItem.setQuantity(dto.getQuantity());
                newItem.setUnit(dto.getUnit());
                newItem.setBought(false);
                shoppingListItemRepository.save(newItem);
            }
        }
    }

    @Transactional(readOnly = true)
    public MealPlanDTO getOrCreatePlan(LocalDate date) {
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        log.debug("Fetching meal plan for week starting {}", weekStart);
        
        return mealPlanRepository.findByWeekStartDate(weekStart)
                .map(MealAdapter::toMealPlanDTO)
                .orElseGet(() -> {
                    MealPlan newPlan = new MealPlan();
                    newPlan.setWeekStartDate(weekStart);
                    newPlan.setStatus("PENDING");
                    return MealAdapter.toMealPlanDTO(mealPlanRepository.save(newPlan));
                });
    }

    public MealPlanDTO updatePlan(Long id, MealPlanDTO dto) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + id + " not found"));

        syncEntries(plan, dto);

        return MealAdapter.toMealPlanDTO(mealPlanRepository.save(plan));
    }

    public void notifyHousehold(Long id, String senderEmail) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + id + " not found"));
        User sender = userRepository.findByEmail(senderEmail).orElseThrow(() -> new ObjectNotFoundException("User with email " + senderEmail + " not found"));

        plan.setStatus("PUBLISHED");
        mealPlanRepository.save(plan);

        List<User> users = userRepository.findAll();
        for (User recipient : users) {
            if (!recipient.getEmail().equals(senderEmail)) {
                notificationService.createNotification(
                        recipient, sender, "MEAL_PLAN_PUBLISHED",
                        "New Meal Plan Published",
                        "The meal plan for week starting " + plan.getWeekStartDate() + " has been published. Please review and accept.",
                        "/recipes/planner?date=" + plan.getWeekStartDate()
                );
            }
        }
    }

    public void acceptPlan(Long id) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + id + " not found"));
        plan.setStatus("ACCEPTED");
        mealPlanRepository.save(plan);
    }

    public void voteEntry(Long entryId, String email, boolean vote) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));
        MealPlanEntry entry = mealPlanEntryRepository.findById(entryId)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlanEntry with id " + entryId + " not found"));

        MealPlanVote v = mealPlanVoteRepository.findByEntryIdAndUserId(entryId, user.getId())
                .orElse(new MealPlanVote());
        
        v.setEntry(entry);
        v.setUser(user);
        v.setVote(vote);
        mealPlanVoteRepository.save(v);
    }

    private void syncEntries(MealPlan plan, MealPlanDTO dto) {
        if (dto.getEntries() != null) {
            plan.getEntries().clear();
            plan.getEntries().addAll(dto.getEntries().stream()
                    .map(eDto -> {
                        MealPlanEntry entry = new MealPlanEntry();
                        entry.setPlan(plan);
                        entry.setDayOfWeek(eDto.getDayOfWeek());
                        entry.setIsDone(eDto.getIsDone() != null ? eDto.getIsDone() : false);
                        
                        MealTime mt = mealTimeRepository.findById(eDto.getMealTimeId())
                                .orElseThrow(() -> new ObjectNotFoundException("MealTime with id " + eDto.getMealTimeId() + " not found"));
                        entry.setMealTime(mt);

                        if (eDto.getRecipes() != null) {
                            entry.getRecipes().addAll(eDto.getRecipes().stream()
                                    .map(rDto -> {
                                        MealPlanEntryRecipe er = new MealPlanEntryRecipe();
                                        er.setEntry(entry);
                                        er.setRecipe(recipeRepository.findById(rDto.getRecipeId())
                                                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + rDto.getRecipeId() + " not found")));
                                        
                                        if (rDto.getUserId() != null) {
                                            er.setUser(userRepository.findById(rDto.getUserId())
                                                    .orElseThrow(() -> new ObjectNotFoundException("User with id " + rDto.getUserId() + " not found")));
                                        }
                                        return er;
                                    })
                                    .collect(Collectors.toList()));
                        }
                        return entry;
                    })
                    .collect(Collectors.toList()));
        }
    }
}
