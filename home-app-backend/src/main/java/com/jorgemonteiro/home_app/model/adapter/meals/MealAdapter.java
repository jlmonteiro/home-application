package com.jorgemonteiro.home_app.model.adapter.meals;

import com.jorgemonteiro.home_app.model.adapter.shopping.ShoppingAdapter;
import com.jorgemonteiro.home_app.model.dtos.meals.*;
import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO;
import com.jorgemonteiro.home_app.model.entities.meals.*;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Adapter for converting between Meal entities and DTOs.
 */
@Component
@RequiredArgsConstructor
public class MealAdapter {

    private final PhotoService photoService;
    private final ShoppingAdapter shoppingAdapter;

    public MealTimeDTO toMealTimeDTO(MealTime entity) {
        if (entity == null) return null;
        MealTimeDTO dto = new MealTimeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSortOrder(entity.getSortOrder());
        dto.setVersion(entity.getVersion());
        if (entity.getSchedules() != null) {
            dto.setSchedules(entity.getSchedules().stream()
                    .map(this::toScheduleDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public MealTimeScheduleDTO toScheduleDTO(MealTimeSchedule entity) {
        if (entity == null) return null;
        MealTimeScheduleDTO dto = new MealTimeScheduleDTO();
        dto.setId(entity.getId());
        dto.setDayOfWeek(entity.getDayOfWeek());
        dto.setStartTime(entity.getStartTime());
        return dto;
    }

    public MealTime toMealTimeEntity(MealTimeDTO dto) {
        if (dto == null) return null;
        MealTime entity = new MealTime();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setSortOrder(dto.getSortOrder());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public MealTimeSchedule toScheduleEntity(MealTimeScheduleDTO dto) {
        if (dto == null) return null;
        MealTimeSchedule entity = new MealTimeSchedule();
        entity.setId(dto.getId());
        entity.setDayOfWeek(dto.getDayOfWeek());
        entity.setStartTime(dto.getStartTime());
        return entity;
    }

    public MealPlanDTO toMealPlanDTO(MealPlan entity) {
        if (entity == null) return null;
        MealPlanDTO dto = new MealPlanDTO();
        dto.setId(entity.getId());
        dto.setWeekStartDate(entity.getWeekStartDate());
        dto.setStatus(entity.getStatus());
        dto.setVersion(entity.getVersion());
        if (entity.getEntries() != null) {
            dto.setEntries(entity.getEntries().stream()
                    .map(this::toEntryDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public MealPlanEntryDTO toEntryDTO(MealPlanEntry entity) {
        if (entity == null) return null;
        MealPlanEntryDTO dto = new MealPlanEntryDTO();
        dto.setId(entity.getId());
        dto.setDayOfWeek(entity.getDayOfWeek());
        dto.setIsDone(entity.getIsDone());
        
        dto.setReactions(new MealPlanReactionDTO(
                entity.getThumbsUpCount(),
                entity.getThumbsDownCount()
        ));

        if (entity.getMealTime() != null) {
            dto.setMealTimeId(entity.getMealTime().getId());
            dto.setMealTimeName(entity.getMealTime().getName());
        }
        if (entity.getRecipes() != null) {
            dto.setRecipes(entity.getRecipes().stream()
                    .map(this::toEntryRecipeDTO)
                    .collect(Collectors.toList()));
        }
        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                    .map(this::toEntryItemDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public MealPlanEntryItemDTO toEntryItemDTO(MealPlanEntryItem entity) {
        if (entity == null) return null;
        MealPlanEntryItemDTO dto = new MealPlanEntryItemDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnit(entity.getUnit());
        
        if (entity.getItem() != null) {
            dto.setItem(shoppingAdapter.toItemDTO(entity.getItem()));
        }
        
        if (entity.getUser() != null) {
            String photo = null;
            if (entity.getUser().getUserProfile() != null) {
                photo = photoService.getPhotoUrl(entity.getUser().getUserProfile().getPhoto());
            }
            dto.setUsers(java.util.List.of(new com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO(
                    entity.getUser().getId(),
                    entity.getUser().getFirstName() + " " + entity.getUser().getLastName(),
                    new PhotoDTO(null, photo)
            )));
        } else {
            dto.setUsers(java.util.Collections.emptyList());
        }
        
        return dto;
    }

    public MealPlanEntryRecipeDTO toEntryRecipeDTO(MealPlanEntryRecipe entity) {
        if (entity == null) return null;
        MealPlanEntryRecipeDTO dto = new MealPlanEntryRecipeDTO();
        dto.setId(entity.getId());
        dto.setMultiplier(entity.getMultiplier());
        
        if (entity.getRecipe() != null) {
            dto.setRecipe(new com.jorgemonteiro.home_app.model.dtos.shared.EntitySummaryDTO(
                    entity.getRecipe().getId(),
                    entity.getRecipe().getName()
            ));
        }
        
        if (entity.getUser() != null) {
            String photo = null;
            if (entity.getUser().getUserProfile() != null) {
                photo = photoService.getPhotoUrl(entity.getUser().getUserProfile().getPhoto());
            }
            dto.setUsers(java.util.List.of(new com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO(
                    entity.getUser().getId(),
                    entity.getUser().getFirstName() + " " + entity.getUser().getLastName(),
                    new PhotoDTO(null, photo)
            )));
        } else {
            dto.setUsers(java.util.Collections.emptyList());
        }
        
        return dto;
    }
}
