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
 * JPA entity representing a category for shopping items,
 * stored in {@code shopping.shopping_categories}.
 */
@Entity
@Table(name = "shopping_categories", schema = "shopping")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ShoppingCategory {

    /** Database-generated surrogate primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** The unique name of the category. */
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    /** A brief description of the category. */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** The name of the icon to represent this category in the UI. */
    @Column(name = "icon", length = 100)
    private String icon;

    /** List of items belonging to this category. */
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShoppingItem> items = new ArrayList<>();

    public void addItem(ShoppingItem item) {
        items.add(item);
        item.setCategory(this);
    }

    public void removeItem(ShoppingItem item) {
        items.remove(item);
        item.setCategory(null);
    }

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
}
