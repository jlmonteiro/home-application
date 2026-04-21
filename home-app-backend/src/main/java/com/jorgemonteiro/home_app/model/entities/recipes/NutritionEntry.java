package com.jorgemonteiro.home_app.model.entities.recipes;

import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingItem;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA entity representing a nutrition data point for a master item.
 */
@Entity
@Table(name = "nutrition_entries", schema = "recipes")
@Data
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class NutritionEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ShoppingItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nutrient_id", nullable = false)
    private Nutrient nutrient;

    @Column(name = "value", nullable = false, precision = 10, scale = 2)
    private BigDecimal value;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
