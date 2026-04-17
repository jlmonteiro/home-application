package com.jorgemonteiro.home_app.repository.meals;

import com.jorgemonteiro.home_app.model.entities.meals.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link MealPlan} entity.
 */
@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {
    Optional<MealPlan> findByWeekStartDate(LocalDate weekStartDate);
}
