package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.RecipeRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link RecipeRating} entity.
 */
@Repository
public interface RecipeRatingRepository extends JpaRepository<RecipeRating, Long> {
    Optional<RecipeRating> findByRecipeIdAndUserId(Long recipeId, Long userId);
    List<RecipeRating> findAllByRecipeId(Long recipeId);
}
