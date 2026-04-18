package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.meals.MealAdapter;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO;
import com.jorgemonteiro.home_app.model.entities.meals.*;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.repository.meals.MealPlanEntryRepository;
import com.jorgemonteiro.home_app.repository.meals.MealPlanRepository;
import com.jorgemonteiro.home_app.repository.meals.MealPlanVoteRepository;
import com.jorgemonteiro.home_app.repository.meals.MealTimeRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import com.jorgemonteiro.home_app.service.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
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
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final MealPlanExportService exportService;

    @Transactional(readOnly = true)
    public List<MealPlanExportItemDTO> getExportPreview(Long planId, Long targetListId) {
        return exportService.getExportPreview(planId, targetListId);
    }

    public void exportToList(Long planId, Long targetListId, List<MealPlanExportItemDTO> itemsToExport, String newListName, String userEmail) {
        exportService.exportToList(planId, targetListId, itemsToExport, newListName, userEmail);
    }

    @Transactional
    public MealPlanDTO getOrCreatePlan(LocalDate date) {
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        log.debug("Fetching meal plan for week starting {}", weekStart);
        
        return mealPlanRepository.findByWeekStartDate(weekStart)
                .map(MealAdapter::toMealPlanDTO)
                .orElseGet(() -> {
                    MealPlan newPlan = new MealPlan();
                    newPlan.setWeekStartDate(weekStart);
                    newPlan.setStatus(MealPlanStatus.PENDING);
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

        plan.setStatus(MealPlanStatus.PUBLISHED);
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
        plan.setStatus(MealPlanStatus.ACCEPTED);
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
                                        er.setRecipe(recipeRepository.findById(rDto.getRecipe().getId())
                                                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + rDto.getRecipe().getId() + " not found")));
                                        
                                        er.setMultiplier(rDto.getMultiplier() != null ? rDto.getMultiplier() : BigDecimal.ONE);

                                        if (rDto.getUsers() != null && !rDto.getUsers().isEmpty()) {
                                            Long userId = rDto.getUsers().get(0).getId();
                                            er.setUser(userRepository.findById(userId)
                                                    .orElseThrow(() -> new ObjectNotFoundException("User with id " + userId + " not found")));
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
