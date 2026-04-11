package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingStore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link ShoppingStore} entities.
 */
@Repository
public interface ShoppingStoreRepository extends JpaRepository<ShoppingStore, Long> {
    Optional<ShoppingStore> findByName(String name);
    boolean existsByName(String name);
}
