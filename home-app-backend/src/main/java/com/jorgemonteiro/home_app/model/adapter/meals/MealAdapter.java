package com.jorgemonteiro.home_app.model.adapter.meals;

import com.jorgemonteiro.home_app.model.dtos.meals.*;
import com.jorgemonteiro.home_app.model.entities.meals.*;

import java.util.stream.Collectors;

/**
 * Static adapter for converting between Meal entities and DTOs.
 */
public class MealAdapter {

    public static MealTimeDTO toMealTimeDTO(MealTime entity) {
        if (entity == null) return null;
        MealTimeDTO dto = new MealTimeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSortOrder(entity.getSortOrder());
        dto.setVersion(entity.getVersion());
        if (entity.getSchedules() != null) {
            dto.setSchedules(entity.getSchedules().stream()
                    .map(MealAdapter::toScheduleDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public static MealTimeScheduleDTO toScheduleDTO(MealTimeSchedule entity) {
        if (entity == null) return null;
        MealTimeScheduleDTO dto = new MealTimeScheduleDTO();
        dto.setId(entity.getId());
        dto.setDayOfWeek(entity.getDayOfWeek());
        dto.setStartTime(entity.getStartTime());
        return dto;
    }

    public static MealTime toMealTimeEntity(MealTimeDTO dto) {
        if (dto == null) return null;
        MealTime entity = new MealTime();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setSortOrder(dto.getSortOrder());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public static MealTimeSchedule toScheduleEntity(MealTimeScheduleDTO dto) {
        if (dto == null) return null;
        MealTimeSchedule entity = new MealTimeSchedule();
        entity.setId(dto.getId());
        entity.setDayOfWeek(dto.getDayOfWeek());
        entity.setStartTime(dto.getStartTime());
        return entity;
    }

    public static MealPlanDTO toMealPlanDTO(MealPlan entity) {
        if (entity == null) return null;
        MealPlanDTO dto = new MealPlanDTO();
        dto.setId(entity.getId());
        dto.setWeekStartDate(entity.getWeekStartDate());
        dto.setStatus(entity.getStatus());
        dto.setVersion(entity.getVersion());
        if (entity.getEntries() != null) {
            dto.setEntries(entity.getEntries().stream()
                    .map(MealAdapter::toEntryDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public static MealPlanEntryDTO toEntryDTO(MealPlanEntry entity) {
        if (entity == null) return null;
        MealPlanEntryDTO dto = new MealPlanEntryDTO();
        dto.setId(entity.getId());
        dto.setDayOfWeek(entity.getDayOfWeek());
        dto.setIsDone(entity.getIsDone());
        dto.setThumbsUpCount(entity.getThumbsUpCount());
        dto.setThumbsDownCount(entity.getThumbsDownCount());
        if (entity.getMealTime() != null) {
            dto.setMealTimeId(entity.getMealTime().getId());
            dto.setMealTimeName(entity.getMealTime().getName());
        }
        if (entity.getRecipes() != null) {
            dto.setRecipes(entity.getRecipes().stream()
                    .map(MealAdapter::toEntryRecipeDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public static MealPlanEntryRecipeDTO toEntryRecipeDTO(MealPlanEntryRecipe entity) {
        if (entity == null) return null;
        MealPlanEntryRecipeDTO dto = new MealPlanEntryRecipeDTO();
        dto.setId(entity.getId());
        if (entity.getRecipe() != null) {
            dto.setRecipeId(entity.getRecipe().getId());
            dto.setRecipeName(entity.getRecipe().getName());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
        }
        return dto;
    }
}
