package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Recipe} entity.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("""
        SELECT DISTINCT r FROM Recipe r 
        LEFT JOIN r.labels l 
        WHERE (CAST(:search AS string) IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        AND (:labelsCount = 0 OR l.name IN :labels)
    """)
    Page<Recipe> searchRecipes(
            @Param("search") String search, 
            @Param("labels") List<String> labels, 
            @Param("labelsCount") int labelsCount,
            Pageable pageable
    );
}
