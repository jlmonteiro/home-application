package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link NutritionEntry} entity.
 */
@Repository
public interface NutritionEntryRepository extends JpaRepository<NutritionEntry, Long> {
    @Query("SELECT ne FROM NutritionEntry ne JOIN ne.nutrient n WHERE ne.item.id = :itemId ORDER BY n.name ASC")
    List<NutritionEntry> findAllByItemId(@Param("itemId") Long itemId);

    Optional<NutritionEntry> findByItemIdAndNutrientId(Long itemId, Long nutrientId);

}
