package com.jorgemonteiro.home_app.model.adapter.recipes;

import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeDTO;
import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;

/**
 * Static adapter for converting between {@link Recipe} entities and {@link RecipeDTO}s.
 */
public class RecipeAdapter {

    /**
     * Converts a {@link Recipe} entity to a {@link RecipeDTO}.
     * @param entity the entity to convert.
     * @return the resulting DTO, or {@code null} if the entity is null.
     */
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

        if (entity.getCreatedBy() != null) {
            dto.setCreatedBy(entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName());
        }

        return dto;
    }

    /**
     * Converts a {@link RecipeDTO} to a {@link Recipe} entity.
     * Identity and audit fields are typically managed by the database and should not be set here
     * when creating new entities.
     * @param dto the DTO to convert.
     * @return the resulting entity, or {@code null} if the DTO is null.
     */
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
}
