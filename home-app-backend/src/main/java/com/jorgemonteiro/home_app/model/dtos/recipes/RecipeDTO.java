package com.jorgemonteiro.home_app.model.dtos.recipes;

import com.jorgemonteiro.home_app.model.dtos.shared.UserSummaryDTO;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

import java.util.List;
import java.util.Set;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.Recipe}.
 * Uses {@link Data} because it requires Jakarta validation and HATEOAS relation mapping.
 */
@Data
@Relation(collectionRelation = "recipes", itemRelation = "recipe")
public class RecipeDTO {

    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String description;

    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings;

    private String sourceLink;

    private String videoLink;

    @Min(value = 0, message = "Prep time cannot be negative")
    private Integer prepTimeMinutes;

    private UserSummaryDTO creator;

    private Long version;

    private Set<String> labels = new java.util.HashSet<>();

    private List<RecipePhotoDTO> photos = new java.util.ArrayList<>();

    private List<RecipeIngredientDTO> ingredients = new java.util.ArrayList<>();

    private List<NutritionEntryDTO> nutritionTotals = new java.util.ArrayList<>();

    private List<RecipeStepDTO> steps = new java.util.ArrayList<>();

    private Double averageRating = 0.0;

    private List<RecipeCommentDTO> comments = new java.util.ArrayList<>();

    private List<RecipeRatingDTO> ratings = new java.util.ArrayList<>();
}
