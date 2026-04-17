package com.jorgemonteiro.home_app.controller.meals;

import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO;
import com.jorgemonteiro.home_app.service.meals.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for managing weekly meal plans.
 */
@RestController
@RequestMapping("/api/meals/plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    /**
     * Retrieves the meal plan for a specific date (or creates a pending one if none exists).
     * @param date any date within the target week.
     * @return the meal plan for that week.
     */
    @GetMapping
    public MealPlanDTO getPlanByDate(
            @RequestParam(name = "date", required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return mealPlanService.getOrCreatePlan(date != null ? date : LocalDate.now());
    }

    /**
     * Updates a meal plan (adds entries, assigns recipes).
     * @param id the plan ID.
     * @param dto the updated plan data.
     * @return the updated plan.
     */
    @PutMapping("/{id}")
    public MealPlanDTO updatePlan(@PathVariable Long id, @RequestBody MealPlanDTO dto) {
        return mealPlanService.updatePlan(id, dto);
    }

    @PostMapping("/{id}/notify")
    public void notifyHousehold(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        mealPlanService.notifyHousehold(id, principal.getAttribute("email"));
    }

    @PostMapping("/{id}/accept")
    public void acceptPlan(@PathVariable Long id) {
        mealPlanService.acceptPlan(id);
    }

    @PostMapping("/entries/{entryId}/vote")
    public void voteEntry(@PathVariable Long entryId, @RequestParam boolean vote, @AuthenticationPrincipal OAuth2User principal) {
        mealPlanService.voteEntry(entryId, principal.getAttribute("email"), vote);
    }

    @GetMapping("/{id}/export-preview")
    public List<MealPlanExportItemDTO> getExportPreview(@PathVariable Long id, @RequestParam(name = "listId", required = false) Long targetListId) {
        return mealPlanService.getExportPreview(id, targetListId);
    }

    @PostMapping("/{id}/export")
    public void exportToList(@PathVariable Long id, @RequestParam Long targetListId, @RequestBody List<MealPlanExportItemDTO> items) {
        mealPlanService.exportToList(id, targetListId, items);
    }

    @GetMapping("/this-week")
    public MealPlanDTO getThisWeek() {
        return mealPlanService.getOrCreatePlan(LocalDate.now());
    }
}
