package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.LoyaltyCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link LoyaltyCard} entities.
 */
@Repository
public interface LoyaltyCardRepository extends JpaRepository<LoyaltyCard, Long> {
    List<LoyaltyCard> findByStoreId(Long storeId);
}
