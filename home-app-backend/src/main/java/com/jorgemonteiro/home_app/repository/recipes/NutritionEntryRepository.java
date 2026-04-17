package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link NutritionEntry} entity.
 */
@Repository
public interface NutritionEntryRepository extends JpaRepository<NutritionEntry, Long> {
    List<NutritionEntry> findAllByItemId(Long itemId);
    Optional<NutritionEntry> findByItemIdAndNutrientKey(Long itemId, String nutrientKey);
}
