package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItemPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link ShoppingItemPriceHistory} entities.
 */
@Repository
public interface ShoppingItemPriceHistoryRepository extends JpaRepository<ShoppingItemPriceHistory, Long> {

    /**
     * Finds the most recent price recorded for an item at a specific store.
     */
    @Query("""
        SELECT h FROM ShoppingItemPriceHistory h 
        WHERE h.item.id = :itemId 
        AND (:storeId IS NULL OR h.store.id = :storeId)
        ORDER BY h.recordedAt DESC
        LIMIT 1
    """)
    Optional<ShoppingItemPriceHistory> findLatestPrice(@Param("itemId") Long itemId, @Param("storeId") Long storeId);

    /**
     * Finds the most recent price recorded for an item at a specific store, excluding a specific history record.
     * Useful when we want to compare the 'new' price being saved with the 'previous' one.
     */
    @Query("""
        SELECT h FROM ShoppingItemPriceHistory h 
        WHERE h.item.id = :itemId 
        AND (:storeId IS NULL OR h.store.id = :storeId)
        AND h.id <> :excludeId
        ORDER BY h.recordedAt DESC
        LIMIT 1
    """)
    Optional<ShoppingItemPriceHistory> findLatestPriceExcluding(@Param("itemId") Long itemId, @Param("storeId") Long storeId, @Param("excludeId") Long excludeId);

    /**
     * Finds all history entries for a specific item, ordered by most recent first.
     */
    List<ShoppingItemPriceHistory> findAllByItemIdOrderByRecordedAtDesc(Long itemId);

    /**
     * Fetches the two most recent price records for each (item, store) pair in the given item ID set.
     * Used to batch-resolve previous prices when mapping a shopping list's items.
     */
    @Query("""
        SELECT h FROM ShoppingItemPriceHistory h
        WHERE h.item.id IN :itemIds
        AND h.id IN (
            SELECT h2.id FROM ShoppingItemPriceHistory h2
            WHERE h2.item.id = h.item.id
            AND (h2.store.id = h.store.id OR (h2.store IS NULL AND h.store IS NULL))
            ORDER BY h2.recordedAt DESC
            LIMIT 2
        )
        ORDER BY h.item.id, h.store.id, h.recordedAt DESC
    """)
    List<ShoppingItemPriceHistory> findLatestTwoPricesForItems(@Param("itemIds") List<Long> itemIds);
}
