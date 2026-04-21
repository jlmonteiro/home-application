package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link ShoppingListItem} entities.
 */
@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {

    List<ShoppingListItem> findAllByListId(Long listId);

    Optional<ShoppingListItem> findByListIdAndItemId(Long listId, Long itemId);

    Optional<ShoppingListItem> findByListIdAndItemIdAndUnit(Long listId, Long itemId, String unit);

    /**
     * Find the last price paid for a specific item at a specific store.
     */
    @Query(value = """
        SELECT sli FROM ShoppingListItem sli 
        JOIN sli.list l 
        WHERE sli.item.id = :itemId 
        AND sli.store.id = :storeId 
        AND sli.price IS NOT NULL 
        ORDER BY l.completedAt DESC, sli.createdAt DESC
        LIMIT 1
    """)
    Optional<ShoppingListItem> findLastPriceAtStore(@Param("itemId") Long itemId, @Param("storeId") Long storeId);

    /**
     * Find the last price paid for a specific item across all stores.
     */
    @Query(value = """
        SELECT sli FROM ShoppingListItem sli 
        WHERE sli.item.id = :itemId 
        AND sli.price IS NOT NULL 
        ORDER BY sli.createdAt DESC 
        LIMIT 1
    """)
    Optional<ShoppingListItem> findGlobalLastPrice(@Param("itemId") Long itemId);
}
