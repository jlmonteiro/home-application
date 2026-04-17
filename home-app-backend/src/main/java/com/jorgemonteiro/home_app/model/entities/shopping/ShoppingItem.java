package com.jorgemonteiro.home_app.model.entities.shopping;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a shopping item,
 * stored in {@code shopping.shopping_items}.
 */
@Entity
@Table(name = "shopping_items", schema = "shopping")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ShoppingItem {

    /** Database-generated surrogate primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** The name of the item. Unique within its category. */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** Unique name of the item photo stored in media.photos. */
    @Column(name = "photo")
    private String photo;

    /** The category this item belongs to. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ShoppingCategory category;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit = "pcs";

    @Column(name = "nutrition_sample_size", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal nutritionSampleSize = new java.math.BigDecimal("100.00");

    @Column(name = "nutrition_sample_unit", nullable = false, length = 20)
    private String nutritionSampleUnit = "g";

    /** Timestamp set automatically when the record is first persisted. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Timestamp updated automatically on every save. */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** Version number for optimistic locking. */
    @Version
    private Long version;

    @OneToMany(mappedBy = "item", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private java.util.List<com.jorgemonteiro.home_app.model.entities.recipes.NutritionEntry> nutritionEntries = new java.util.ArrayList<>();
}
