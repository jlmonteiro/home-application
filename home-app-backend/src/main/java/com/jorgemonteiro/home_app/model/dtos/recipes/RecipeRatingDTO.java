package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.RecipeRating}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRatingDTO {
    private Long id;
    private String userName;
    private Integer rating;
    private LocalDateTime createdAt;

    public RecipeRatingDTO(String userName, Integer rating) {
        this.userName = userName;
        this.rating = rating;
    }
}
