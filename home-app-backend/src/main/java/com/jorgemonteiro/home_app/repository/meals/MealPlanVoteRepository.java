package com.jorgemonteiro.home_app.repository.meals;

import com.jorgemonteiro.home_app.model.entities.meals.MealPlanVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link MealPlanVote} entity.
 */
@Repository
public interface MealPlanVoteRepository extends JpaRepository<MealPlanVote, Long> {
    Optional<MealPlanVote> findByEntryIdAndUserId(Long entryId, Long userId);
}
