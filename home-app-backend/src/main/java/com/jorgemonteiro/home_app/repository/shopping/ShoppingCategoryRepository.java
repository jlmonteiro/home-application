package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link ShoppingCategory} entities.
 */
@Repository
public interface ShoppingCategoryRepository extends JpaRepository<ShoppingCategory, Long> {

    /**
     * Find a category by its name.
     * @param name the category name
     * @return an optional containing the category if found
     */
    Optional<ShoppingCategory> findByName(String name);

    /**
     * Check if a category exists with the given name.
     * @param name the category name
     * @return {@code true} if it exists
     */
    boolean existsByName(String name);
}
