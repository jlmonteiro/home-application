package com.jorgemonteiro.home_app.model.entities.shopping;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity representing a physical or online store,
 * stored in {@code shopping.shopping_stores}.
 */
@Entity
@Table(name = "shopping_stores", schema = "shopping")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ShoppingStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "photo", columnDefinition = "TEXT")
    private String photo;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LoyaltyCard> loyaltyCards = new ArrayList<>();

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Coupon> coupons = new ArrayList<>();

    public void addLoyaltyCard(LoyaltyCard card) {
        loyaltyCards.add(card);
        card.setStore(this);
    }

    public void addCoupon(Coupon coupon) {
        coupons.add(coupon);
        coupon.setStore(this);
    }

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}
