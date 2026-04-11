package com.jorgemonteiro.home_app.model.entities.shopping;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a discount coupon for a store,
 * stored in {@code shopping.coupons}.
 */
@Entity
@Table(name = "coupons", schema = "shopping")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private ShoppingStore store;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "value", length = 100)
    private String value;

    @Column(name = "photo", columnDefinition = "TEXT")
    private String photo;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "used", nullable = false)
    private boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}
