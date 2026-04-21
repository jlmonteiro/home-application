package com.jorgemonteiro.home_app.repository.meals;

import com.jorgemonteiro.home_app.model.entities.meals.MealTimeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link MealTimeSchedule} entity.
 */
@Repository
public interface MealTimeScheduleRepository extends JpaRepository<MealTimeSchedule, Long> {
    List<MealTimeSchedule> findAllByMealTimeIdOrderByDayOfWeekAsc(Long mealTimeId);
}
