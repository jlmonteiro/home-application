package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.adapter.meals.MealAdapter;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO;
import com.jorgemonteiro.home_app.model.entities.meals.*;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.repository.meals.*;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import com.jorgemonteiro.home_app.repository.shopping.ShoppingItemRepository;
import com.jorgemonteiro.home_app.service.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing weekly meal plans.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanVoteRepository mealPlanVoteRepository;
    private final MealTimeRepository mealTimeRepository;
    private final RecipeRepository recipeRepository;
    private final ShoppingItemRepository shoppingItemRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MealPlanExportService exportService;
    private final MealAdapter mealAdapter;

    @Transactional(readOnly = true)
    public List<MealPlanExportItemDTO> getExportPreview(Long planId, Long targetListId) {
        return exportService.getExportPreview(planId, targetListId);
    }

    public void exportToList(Long planId, Long targetListId, List<MealPlanExportItemDTO> items, String newListName, String userEmail) {
        exportService.exportToList(planId, targetListId, items, newListName, userEmail);
    }

    @Transactional
    public MealPlanDTO findByDate(LocalDate date) {
        LocalDate weekStart = getWeekStartDate(date);
        return mealPlanRepository.findByWeekStartDate(weekStart)
                .map(mealAdapter::toMealPlanDTO)
                .orElseGet(() -> {
                    MealPlan newPlan = new MealPlan();
                    newPlan.setWeekStartDate(weekStart);
                    newPlan.setStatus(MealPlanStatus.PENDING);
                    return mealAdapter.toMealPlanDTO(mealPlanRepository.save(newPlan));
                });
    }

    public MealPlanDTO updatePlan(Long id, MealPlanDTO dto, String senderEmail) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + id + " not found"));
        User sender = userRepository.findByEmail(senderEmail).orElseThrow(() -> new ObjectNotFoundException("User with email " + senderEmail + " not found"));

        plan.setStatus(dto.getStatus());
        syncEntries(plan, dto);

        return mealAdapter.toMealPlanDTO(mealPlanRepository.save(plan));
    }

    public void notifyHousehold(Long id, String senderEmail) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + id + " not found"));

        plan.setStatus(MealPlanStatus.PUBLISHED);
        mealPlanRepository.save(plan);

        User sender = userRepository.findByEmail(senderEmail).orElse(null);

        notificationService.createBroadcastNotification(
                sender,
                "MEAL_PLAN",
                "New Meal Plan",
                "A new meal plan for the week of " + plan.getWeekStartDate() + " is ready for review.",
                "/recipes/planner?date=" + plan.getWeekStartDate()
        );
    }

    public void acceptPlan(Long id) {
        MealPlan plan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlan with id " + id + " not found"));
        plan.setStatus(MealPlanStatus.ACCEPTED);
        mealPlanRepository.save(plan);
    }

    public void voteEntry(Long entryId, String userEmail, boolean vote) {
        MealPlanEntry entry = mealPlanEntryRepository.findById(entryId)
                .orElseThrow(() -> new ObjectNotFoundException("MealPlanEntry with id " + entryId + " not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ObjectNotFoundException("User with email " + userEmail + " not found"));

        MealPlanVote v = mealPlanVoteRepository.findByEntryIdAndUserId(entryId, user.getId())
                .orElse(new MealPlanVote());

        v.setEntry(entry);
        v.setUser(user);
        v.setVote(vote);
        mealPlanVoteRepository.save(v);
    }

    private void syncEntries(MealPlan plan, MealPlanDTO dto) {
        if (dto.getEntries() == null) {
            log.debug("No entries to sync in DTO");
            return;
        }

        log.info("Syncing {} entries for plan id {}", dto.getEntries().size(), plan.getId());

        // 1. Identify what to keep/update and what to add
        java.util.Map<String, com.jorgemonteiro.home_app.model.dtos.meals.MealPlanEntryDTO> dtoMap = dto.getEntries().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> {
                            String key = e.getDayOfWeek() + "-" + e.getMealTimeId();
                            log.debug("DTO Entry Key: {}", key);
                            return key;
                        },
                        e -> e,
                        (e1, e2) -> {
                            log.warn("Duplicate entry found for key {}-{}, merging...", e1.getDayOfWeek(), e1.getMealTimeId());
                            if ((e1.getRecipes() == null || e1.getRecipes().isEmpty()) &&
                                (e2.getRecipes() != null && !e2.getRecipes().isEmpty())) {
                                return e2;
                            }
                            return e1;
                        }
                ));

        // 2. Remove entries not in DTO and update existing ones
        java.util.Iterator<MealPlanEntry> iterator = plan.getEntries().iterator();
        while (iterator.hasNext()) {
            MealPlanEntry entry = iterator.next();
            String key = entry.getDayOfWeek() + "-" + entry.getMealTime().getId();
            log.debug("Existing Entry Key: {}", key);
            var eDto = dtoMap.remove(key);

            if (eDto == null) {
                log.info("Removing entry for key {}", key);
                iterator.remove();
            } else {
                log.info("Updating existing entry for key {}", key);
                entry.setIsDone(eDto.getIsDone() != null ? eDto.getIsDone() : false);
                syncRecipes(entry, eDto.getRecipes());
                syncItems(entry, eDto.getItems());
            }
        }

        // 3. Add remaining entries from DTO
        for (var eDto : dtoMap.values()) {
            String key = eDto.getDayOfWeek() + "-" + eDto.getMealTimeId();
            log.info("Adding new entry for key {}", key);
            MealPlanEntry entry = new MealPlanEntry();
            entry.setPlan(plan);
            entry.setDayOfWeek(eDto.getDayOfWeek());

            MealTime mt = mealTimeRepository.findById(eDto.getMealTimeId())
                    .orElseThrow(() -> new ObjectNotFoundException("MealTime with id " + eDto.getMealTimeId() + " not found"));
            entry.setMealTime(mt);
            entry.setIsDone(eDto.getIsDone() != null ? eDto.getIsDone() : false);
            syncRecipes(entry, eDto.getRecipes());
            syncItems(entry, eDto.getItems());

            plan.getEntries().add(entry);
        }
    }

    private void syncItems(MealPlanEntry entry, List<com.jorgemonteiro.home_app.model.dtos.meals.MealPlanEntryItemDTO> itemDtos) {
        if (itemDtos == null) {
            entry.getItems().clear();
            return;
        }

        entry.getItems().clear();
        for (var iDto : itemDtos) {
            if (iDto.getItem() == null || iDto.getItem().getId() == null) {
                throw new ValidationException("Item is required for all meal entry items");
            }

            MealPlanEntryItem ei = new MealPlanEntryItem();
            ei.setEntry(entry);
            ei.setItem(shoppingItemRepository.findById(iDto.getItem().getId())
                    .orElseThrow(() -> new ObjectNotFoundException("Item with id " + iDto.getItem().getId() + " not found")));

            ei.setQuantity(iDto.getQuantity() != null ? iDto.getQuantity() : BigDecimal.ONE);
            ei.setUnit(iDto.getUnit() != null ? iDto.getUnit() : ei.getItem().getUnit());

            if (iDto.getUsers() != null && !iDto.getUsers().isEmpty()) {
                Long userId = iDto.getUsers().get(0).getId();
                if (userId != null) {
                    ei.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new ObjectNotFoundException("User with id " + userId + " not found")));
                }
            }
            entry.getItems().add(ei);
        }
    }

    private void syncRecipes(MealPlanEntry entry, java.util.List<com.jorgemonteiro.home_app.model.dtos.meals.MealPlanEntryRecipeDTO> recipeDtos) {
        if (recipeDtos == null) {
            entry.getRecipes().clear();
            return;
        }

        // Recipes are simpler to just replace or match by ID if they have it,
        // but let's at least handle the basic replacement without clearing the list if possible,
        // though entries are more sensitive to unique constraints than recipes.
        // However, to be safe, let's just clear and add for recipes since they usually don't have
        // unique constraints on (entry_id, recipe_id, user_id) that would be violated by temporary duplicates.
        // Actually, they might have. Let's just clear and rebuild for now, but in a way that respects JPA.
        entry.getRecipes().clear();
        for (var rDto : recipeDtos) {
            if (rDto.getRecipe() == null || rDto.getRecipe().getId() == null) {
                throw new ValidationException("Recipe is required for all meal entry recipes");
            }

            MealPlanEntryRecipe er = new MealPlanEntryRecipe();
            er.setEntry(entry);
            er.setRecipe(recipeRepository.findById(rDto.getRecipe().getId())
                    .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + rDto.getRecipe().getId() + " not found")));

            er.setMultiplier(rDto.getMultiplier() != null ? rDto.getMultiplier() : BigDecimal.ONE);

            if (rDto.getUsers() != null && !rDto.getUsers().isEmpty()) {
                Long userId = rDto.getUsers().get(0).getId();
                if (userId != null) {
                    er.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new ObjectNotFoundException("User with id " + userId + " not found")));
                }
            }
            entry.getRecipes().add(er);
        }
    }

    private LocalDate getWeekStartDate(LocalDate date) {
        // Find Monday of the week containing 'date'
        return date.minusDays(date.getDayOfWeek().getValue() - 1);
    }
}
