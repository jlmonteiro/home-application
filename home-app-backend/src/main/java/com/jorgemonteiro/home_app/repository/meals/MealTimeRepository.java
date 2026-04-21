package com.jorgemonteiro.home_app.repository.meals;

import com.jorgemonteiro.home_app.model.entities.meals.MealTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link MealTime} entity.
 */
@Repository
public interface MealTimeRepository extends JpaRepository<MealTime, Long> {
    List<MealTime> findAllByOrderBySortOrderAsc();
}
