package com.jorgemonteiro.home_app.repository.recipes;

import com.jorgemonteiro.home_app.model.entities.recipes.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Label} entity.
 */
@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {
    
    Optional<Label> findByName(String name);

    @Query("SELECT l FROM Label l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Label> searchByQuery(String query);

    @Query("SELECT l FROM Label l WHERE NOT EXISTS (SELECT 1 FROM Recipe r WHERE l MEMBER OF r.labels)")
    List<Label> findOrphanedLabels();
}
