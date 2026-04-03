package com.jorgemonteiro.home_app.model.entities.profiles;


import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing an application user stored in {@code profiles.user}.
 * Identity is based on {@link #email} — two {@code User} instances with the same
 * email are considered equal regardless of their surrogate {@link #id}.
 */
@Entity
@Table(name = "user", schema = "profiles")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

    /** Database-generated surrogate primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Unique email address used to identify the user. */
    @EqualsAndHashCode.Include
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    /** The user's first name. */
    @Column(name = "first_name", length = 50)
    private String firstName;

    /** The user's last name. */
    @Column(name = "last_name", length = 50)
    private String lastName;

    /** Whether the user account is active. Defaults to {@code true}. */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    /** Timestamp set automatically when the record is first persisted. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Timestamp updated automatically on every save. */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /** The associated profile record. Cascades all operations and is owned by {@link UserProfile}. */
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile userProfile;
}