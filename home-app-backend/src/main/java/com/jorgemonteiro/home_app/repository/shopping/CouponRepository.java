package com.jorgemonteiro.home_app.repository.shopping;

import com.jorgemonteiro.home_app.model.entities.shopping.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA repository for {@link Coupon} entities.
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Page<Coupon> findByStoreId(Long storeId, Pageable pageable);
    
    /**
     * Find unused coupons due within a certain timeframe.
     */
    List<Coupon> findByUsedFalseAndDueDateBetweenOrderByDueDateAsc(LocalDateTime start, LocalDateTime end);
}
