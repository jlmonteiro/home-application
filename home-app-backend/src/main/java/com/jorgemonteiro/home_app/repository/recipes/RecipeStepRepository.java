package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link RecipeStep} entity.
 */
@Repository
public interface RecipeStepRepository extends JpaRepository<RecipeStep, Long> {
    List<RecipeStep> findAllByRecipeIdOrderBySortOrderAsc(Long recipeId);
}
