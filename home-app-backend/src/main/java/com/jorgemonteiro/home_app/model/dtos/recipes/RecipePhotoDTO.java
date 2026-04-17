package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.RecipePhoto}.
 */
@Data
@NoArgsConstructor
public class RecipePhotoDTO {
    private Long id;
    private String photoUrl; // Serves as the URL for the frontend
    private String photoName; // Internal name for database reference
    private Boolean isDefault;
    private Long version;
}
