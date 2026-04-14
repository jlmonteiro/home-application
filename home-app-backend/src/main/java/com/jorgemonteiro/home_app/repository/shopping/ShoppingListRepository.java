package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA repository for {@link ShoppingList} entities.
 */
@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
    List<ShoppingList> findByStatusOrderByCreatedAtDesc(String status);
    List<ShoppingList> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("DELETE FROM ShoppingList l WHERE l.createdAt < :threshold")
    int deleteByCreatedAtBefore(LocalDateTime threshold);
}
