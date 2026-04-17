package com.jorgemonteiro.home_app.repository.meals;

import com.jorgemonteiro.home_app.model.entities.meals.MealPlanEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link MealPlanEntry} entity.
 */
@Repository
public interface MealPlanEntryRepository extends JpaRepository<MealPlanEntry, Long> {
    List<MealPlanEntry> findAllByPlanId(Long planId);
}
