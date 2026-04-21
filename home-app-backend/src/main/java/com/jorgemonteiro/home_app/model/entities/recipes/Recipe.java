package com.jorgemonteiro.home_app.model.entities.recipes;

import com.jorgemonteiro.home_app.model.entities.profiles.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing a recipe, stored in {@code recipes.recipes}.
 */
@Entity
@Table(name = "recipes", schema = "recipes")
@Data
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "servings", nullable = false)
    private Integer servings = 1;

    @Column(name = "source_link", columnDefinition = "TEXT")
    private String sourceLink;

    @Column(name = "video_link", columnDefinition = "TEXT")
    private String videoLink;

    @Column(name = "prep_time_minutes", nullable = false)
    private Integer prepTimeMinutes = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RecipePhoto> photos = new java.util.ArrayList<>();

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "recipe_labels",
        schema = "recipes",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private java.util.Set<Label> labels = new java.util.HashSet<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RecipeIngredient> ingredients = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private java.util.List<RecipeStep> steps = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RecipeComment> comments = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<RecipeRating> ratings = new java.util.ArrayList<>();

    public Double getAverageRating() {
        if (ratings == null || ratings.isEmpty()) return 0.0;
        return ratings.stream()
                .mapToInt(RecipeRating::getRating)
                .average()
                .orElse(0.0);
    }
}
