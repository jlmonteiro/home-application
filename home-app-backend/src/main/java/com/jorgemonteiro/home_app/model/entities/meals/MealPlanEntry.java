package com.jorgemonteiro.home_app.model.entities.meals;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

/**
 * JPA entity representing a specific meal slot in a weekly plan.
 */
@Entity
@Table(name = "meal_plan_entries", schema = "meals")
@Data
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MealPlanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private MealPlan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_time_id", nullable = false)
    private MealTime mealTime;

    @Enumerated(EnumType.ORDINAL)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "is_done", nullable = false)
    private Boolean isDone = false;

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealPlanEntryRecipe> recipes = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealPlanEntryItem> items = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealPlanVote> votes = new java.util.ArrayList<>();

    public long getThumbsUpCount() {
        return votes == null ? 0 : votes.stream().filter(MealPlanVote::getVote).count();
    }

    public long getThumbsDownCount() {
        return votes == null ? 0 : votes.stream().filter(v -> !v.getVote()).count();
    }

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
