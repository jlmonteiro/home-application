package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.Nutrient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NutrientRepository extends JpaRepository<Nutrient, Long> {
    List<Nutrient> findAllByOrderByNameAsc();
}
