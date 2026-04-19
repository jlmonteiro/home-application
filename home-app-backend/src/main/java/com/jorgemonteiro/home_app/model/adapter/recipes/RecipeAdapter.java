package com.jorgemonteiro.home_app.model.adapter.recipes;

import com.jorgemonteiro.home_app.model.dtos.recipes.*;
import com.jorgemonteiro.home_app.model.dtos.shared.*;
import com.jorgemonteiro.home_app.model.entities.recipes.*;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;

/**
 * Adapter component for converting between {@link Recipe} entities and {@link RecipeDTO}s.
 * Uses instance methods to allow for dependency injection (e.g. PhotoService).
 */
@Component
@RequiredArgsConstructor
public class RecipeAdapter {

    private final PhotoService photoService;

    public RecipeDTO toDTO(Recipe entity) {
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
            dto.setCreator(new UserSummaryDTO(
                    entity.getCreatedBy().getId(),
                    entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName()
            ));
        }

        if (entity.getLabels() != null) {
            dto.setLabels(entity.getLabels().stream()
                    .map(Label::getName)
                    .collect(Collectors.toSet()));
        }

        if (entity.getPhotos() != null) {
            dto.setPhotos(entity.getPhotos().stream()
                    .map(this::toPhotoDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getIngredients() != null) {
            dto.setIngredients(entity.getIngredients().stream()
                    .map(this::toIngredientDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getSteps() != null) {
            dto.setSteps(entity.getSteps().stream()
                    .map(this::toStepDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getComments() != null) {
            dto.setComments(entity.getComments().stream()
                    .map(this::toCommentDTO)
                    .collect(Collectors.toList()));
        }

        if (entity.getRatings() != null) {
            dto.setRatings(entity.getRatings().stream()
                    .map(this::toRatingDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Recipe toEntity(RecipeDTO dto) {
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

    public RecipePhotoDTO toPhotoDTO(RecipePhoto entity) {
        if (entity == null) return null;
        RecipePhotoDTO dto = new RecipePhotoDTO();
        dto.setId(entity.getId());
        dto.setPhotoUrl(photoService.getPhotoUrl(entity.getPhotoName()));
        dto.setPhotoName(entity.getPhotoName());
        dto.setIsDefault(entity.getIsDefault());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    public RecipePhoto toPhotoEntity(RecipePhotoDTO dto) {
        if (dto == null) return null;
        RecipePhoto entity = new RecipePhoto();
        entity.setId(dto.getId());
        entity.setPhotoName(dto.getPhotoName());
        entity.setIsDefault(dto.getIsDefault());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public RecipeIngredientDTO toIngredientDTO(RecipeIngredient entity) {
        if (entity == null) return null;
        RecipeIngredientDTO dto = new RecipeIngredientDTO();
        dto.setId(entity.getId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnit(entity.getUnit());
        dto.setGroupName(entity.getGroupName());
        
        if (entity.getItem() != null) {
            dto.setItem(new ItemSummaryDTO(
                    entity.getItem().getId(),
                    entity.getItem().getName(),
                    photoService.getPhotoUrl(entity.getItem().getPhoto()),
                    entity.getItem().getUnit()
            ));
            
            if (entity.getItem().getNutritionEntries() != null) {
                dto.setNutritionEntries(entity.getItem().getNutritionEntries().stream()
                        .map(this::toNutritionDTO)
                        .collect(Collectors.toList()));
            }
        }
        return dto;
    }

    public NutritionEntryDTO toNutritionDTO(NutritionEntry entity) {
        if (entity == null) return null;
        NutritionEntryDTO dto = new NutritionEntryDTO();
        dto.setId(entity.getId());
        dto.setValue(entity.getValue());
        if (entity.getNutrient() != null) {
            dto.setNutrient(new NutrientSummaryDTO(
                    entity.getNutrient().getId(),
                    entity.getNutrient().getName(),
                    entity.getNutrient().getUnit()
            ));
        }
        return dto;
    }

    public NutrientDTO toNutrientDTO(Nutrient entity) {
        if (entity == null) return null;
        return new NutrientDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getUnit(),
                entity.getVersion()
        );
    }

    public Nutrient toNutrientEntity(NutrientDTO dto) {
        if (dto == null) return null;
        Nutrient entity = new Nutrient();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setUnit(dto.getUnit());
        entity.setVersion(dto.getVersion());
        return entity;
    }

    public RecipeStepDTO toStepDTO(RecipeStep entity) {
        if (entity == null) return null;
        RecipeStepDTO dto = new RecipeStepDTO();
        dto.setId(entity.getId());
        dto.setInstruction(entity.getInstruction());
        dto.setTimeMinutes(entity.getTimeMinutes());
        dto.setSortOrder(entity.getSortOrder());
        return dto;
    }

    public RecipeStep toStepEntity(RecipeStepDTO dto) {
        if (dto == null) return null;
        RecipeStep entity = new RecipeStep();
        entity.setId(dto.getId());
        entity.setInstruction(dto.getInstruction());
        entity.setTimeMinutes(dto.getTimeMinutes());
        entity.setSortOrder(dto.getSortOrder());
        return entity;
    }

    public RecipeCommentDTO toCommentDTO(RecipeComment entity) {
        if (entity == null) return null;
        RecipeCommentDTO dto = new RecipeCommentDTO();
        dto.setId(entity.getId());
        dto.setComment(entity.getComment());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getUser() != null) {
            String photo = null;
            if (entity.getUser().getUserProfile() != null) {
                photo = photoService.getPhotoUrl(entity.getUser().getUserProfile().getPhoto());
            }
            dto.setUser(new UserSummaryDTO(
                    entity.getUser().getId(),
                    entity.getUser().getFirstName() + " " + entity.getUser().getLastName(),
                    new PhotoDTO(null, photo)
            ));
        }
        return dto;
    }

    public RecipeRatingDTO toRatingDTO(RecipeRating entity) {
        if (entity == null) return null;
        RecipeRatingDTO dto = new RecipeRatingDTO();
        dto.setId(entity.getId());
        dto.setRating(entity.getRating());
        dto.setCreatedAt(entity.getCreatedAt());
        if (entity.getUser() != null) {
            dto.setUser(new UserSummaryDTO(
                    entity.getUser().getId(),
                    entity.getUser().getFirstName() + " " + entity.getUser().getLastName()
            ));
        }
        return dto;
    }
}
