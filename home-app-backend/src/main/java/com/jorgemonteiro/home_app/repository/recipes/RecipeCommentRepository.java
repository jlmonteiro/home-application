package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.RecipeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link RecipeComment} entity.
 */
@Repository
public interface RecipeCommentRepository extends JpaRepository<RecipeComment, Long> {
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM RecipeComment c JOIN FETCH c.user u LEFT JOIN FETCH u.userProfile WHERE c.recipe.id = :recipeId ORDER BY c.createdAt DESC")
    java.util.List<RecipeComment> findAllByRecipeIdOrderByCreatedAtDesc(@org.springframework.data.repository.query.Param("recipeId") Long recipeId);
}
