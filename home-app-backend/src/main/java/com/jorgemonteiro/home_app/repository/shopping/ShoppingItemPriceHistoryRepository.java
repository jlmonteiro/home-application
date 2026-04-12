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
}
