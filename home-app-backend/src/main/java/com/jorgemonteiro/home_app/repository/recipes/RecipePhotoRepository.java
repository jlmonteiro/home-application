package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.RecipePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link RecipePhoto} entity.
 */
@Repository
public interface RecipePhotoRepository extends JpaRepository<RecipePhoto, Long> {
    
    List<RecipePhoto> findAllByRecipeId(Long recipeId);
}
