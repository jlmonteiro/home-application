package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link Recipe} entity.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
}
