package com.jorgemonteiro.home_app.model.entities.shopping;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a loyalty card for a specific store,
 * stored in {@code shopping.loyalty_cards}.
 */
@Entity
@Table(name = "loyalty_cards", schema = "shopping")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LoyaltyCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private ShoppingStore store;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "number", nullable = false, length = 100)
    private String number;

    @Column(name = "barcode_type", nullable = false, length = 20)
    private String barcodeType; // e.g., "QR", "CODE_128"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Long version;
}
