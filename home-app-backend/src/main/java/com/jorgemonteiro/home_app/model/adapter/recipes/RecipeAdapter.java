package com.jorgemonteiro.home_app.model.adapter.recipes;

import com.jorgemonteiro.home_app.model.dtos.recipes.*;
import com.jorgemonteiro.home_app.model.entities.recipes.*;

import java.util.stream.Collectors;

/**
 * Static adapter for converting between {@link Recipe} entities and {@link RecipeDTO}s.
 */
public class RecipeAdapter {

    public static RecipeDTO toDTO(Recipe entity) {
        if (entity == null) return null;

        RecipeDTO dto = new RecipeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setServings(entity.getServings());
        dto.setSourceLink(entity.getSourceLink());
        dto.setVideoLink(entity.getVideoLink());
        dto.setPrepTimeMinutes(entity.getPrepTimeMinutes());
        dto.setVersion(entity.getVersion());
        dto.setAverageRating(entity.getAverageRating());

        if (entity.getCreatedBy() != null) {
            dto.setCreatedBy(entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName());
        }

        if (entity.getLabels() != null) {
            dto.setLabels(entity.getLabels().stream()
                    .map(Label::getName)
                    .collect(Collectors.toSet()));
        }

        if (entity.getPhotos() != null) {
            dto.setPhotos(entity.getPhotos().stream()
                    .map(RecipeAdapter::toPhotoDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getIngredients() != null) {
            dto.setIngredients(entity.getIngredients().stream()
                    .map(RecipeAdapter::toIngredientDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getSteps() != null) {
            dto.setSteps(entity.getSteps().stream()
                    .map(RecipeAdapter::toStepDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getComments() != null) {
            dto.setComments(entity.getComments().stream()
                    .map(RecipeAdapter::toCommentDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getRatings() != null) {
            dto.setRatings(entity.getRatings().stream()
                    .map(RecipeAdapter::toRatingDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public static Recipe toEntity(RecipeDTO dto) {
        if (dto == null) return null;

        Recipe entity = new Recipe();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setServings(dto.getServings());
        entity.setSourceLink(dto.getSourceLink());
        entity.setVideoLink(dto.getVideoLink());
        entity.setPrepTimeMinutes(dto.getPrepTimeMinutes());
        entity.setVersion(dto.getVersion());

        return entity;
    }

    public static RecipePhotoDTO toPhotoDTO(RecipePhoto entity) {
        if (entity == null) return null;
        RecipePhotoDTO dto = new RecipePhotoDTO();
        dto.setId(entity.getId());
        dto.setPhotoData(entity.getPhotoData());
        dto.setIsDefault(entity.getIsDefault());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    public static RecipePhoto toPhotoEntity(RecipePhotoDTO dto) {
        if (dto == null) return null;
        RecipePhoto entity = new RecipePhoto();
        entity.setId(dto.getId());
        entity.setPhotoData(dto.getPhotoData());
        entity.setIsDefault(dto.getIsDefault());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public static RecipeIngredientDTO toIngredientDTO(RecipeIngredient entity) {
        if (entity == null) return null;
        RecipeIngredientDTO dto = new RecipeIngredientDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnit(entity.getUnit());
        
        if (entity.getItem() != null) {
            dto.setItemId(entity.getItem().getId());
            dto.setItemName(entity.getItem().getName());
            
            if (entity.getItem().getNutritionEntries() != null) {
                dto.setNutritionEntries(entity.getItem().getNutritionEntries().stream()
                        .map(RecipeAdapter::toNutritionDTO)
                        .collect(Collectors.toList()));
            }
        }
        return dto;
    }

    public static NutritionEntryDTO toNutritionDTO(NutritionEntry entity) {
        if (entity == null) return null;
        NutritionEntryDTO dto = new NutritionEntryDTO();
        dto.setId(entity.getId());
        dto.setNutrientKey(entity.getNutrientKey());
        dto.setValue(entity.getValue());
        dto.setUnit(entity.getUnit());
        return dto;
    }

    public static RecipeStepDTO toStepDTO(RecipeStep entity) {
        if (entity == null) return null;
        RecipeStepDTO dto = new RecipeStepDTO();
        dto.setId(entity.getId());
        dto.setInstruction(entity.getInstruction());
        dto.setTimeMinutes(entity.getTimeMinutes());
        dto.setSortOrder(entity.getSortOrder());
        return dto;
    }

    public static RecipeStep toStepEntity(RecipeStepDTO dto) {
        if (dto == null) return null;
        RecipeStep entity = new RecipeStep();
        entity.setId(dto.getId());
        entity.setInstruction(dto.getInstruction());
        entity.setTimeMinutes(dto.getTimeMinutes());
        entity.setSortOrder(dto.getSortOrder());
        return entity;
    }

    public static RecipeCommentDTO toCommentDTO(RecipeComment entity) {
        if (entity == null) return null;
        RecipeCommentDTO dto = new RecipeCommentDTO();
        dto.setId(entity.getId());
        dto.setComment(entity.getComment());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getUser() != null) {
            dto.setUserName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
            if (entity.getUser().getUserProfile() != null) {
                dto.setUserPhoto(entity.getUser().getUserProfile().getPhoto());
            }
        }
        return dto;
    }

    public static RecipeRatingDTO toRatingDTO(RecipeRating entity) {
        if (entity == null) return null;
        RecipeRatingDTO dto = new RecipeRatingDTO();
        dto.setId(entity.getId());
        dto.setRating(entity.getRating());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getUser() != null) {
            dto.setUserName(entity.getUser().getFirstName() + " " + entity.getUser().getLastName());
        }
        return dto;
    }
}
