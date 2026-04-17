package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.RecipeComment}.
 */
@Data
@NoArgsConstructor
public class RecipeCommentDTO {
    private Long id;
    private String userName;
    private String userPhoto;
    private String comment;
    private LocalDateTime createdAt;
}
