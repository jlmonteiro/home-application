package com.jorgemonteiro.home_app.controller.meals;

import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanDTO;
import com.jorgemonteiro.home_app.model.dtos.meals.MealPlanExportItemDTO;
import com.jorgemonteiro.home_app.service.meals.MealPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<MealPlanDTO> getPlan(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate searchDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(mealPlanService.getOrCreatePlan(searchDate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanDTO> updatePlan(@PathVariable Long id, @RequestBody MealPlanDTO dto) {
        return ResponseEntity.ok(mealPlanService.updatePlan(id, dto));
    }

    @PostMapping("/{id}/notify")
    public ResponseEntity<Void> notifyHousehold(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        mealPlanService.notifyHousehold(id, principal.getAttribute("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Void> acceptPlan(@PathVariable Long id) {
        mealPlanService.acceptPlan(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/entries/{entryId}/vote")
    public ResponseEntity<Void> voteEntry(
            @PathVariable Long entryId,
            @RequestParam boolean vote,
            @AuthenticationPrincipal OAuth2User principal) {
        mealPlanService.voteEntry(entryId, principal.getAttribute("email"), vote);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/export-preview")
    public ResponseEntity<List<MealPlanExportItemDTO>> getExportPreview(
            @PathVariable Long id,
            @RequestParam(required = false) Long listId) {
        return ResponseEntity.ok(mealPlanService.getExportPreview(id, listId));
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<Void> exportToList(
            @PathVariable Long id,
            @RequestParam(required = false) Long targetListId,
            @RequestParam(required = false) String newListName,
            @RequestBody List<MealPlanExportItemDTO> items,
            @AuthenticationPrincipal OAuth2User principal) {
        mealPlanService.exportToList(id, targetListId, items, newListName, principal.getAttribute("email"));
        return ResponseEntity.ok().build();
    }
}
