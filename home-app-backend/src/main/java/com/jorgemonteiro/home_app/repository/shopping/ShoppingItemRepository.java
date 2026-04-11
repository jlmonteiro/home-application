package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for {@link ShoppingItem} entities.
 */
@Repository
public interface ShoppingItemRepository extends JpaRepository<ShoppingItem, Long> {

    /**
     * Find all items in a specific category.
     * @param categoryId the category ID
     * @param pageable pagination info
     * @return a page of items
     */
    Page<ShoppingItem> findByCategoryId(Long categoryId, Pageable pageable);

    /**
     * Check if an item with the same name already exists in a category.
     * @param name the item name
     * @param categoryId the category ID
     * @return {@code true} if it exists
     */
    boolean existsByNameAndCategoryId(String name, Long categoryId);
}
