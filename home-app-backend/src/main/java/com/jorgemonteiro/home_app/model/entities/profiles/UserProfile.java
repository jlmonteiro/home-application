package com.jorgemonteiro.home_app.model.entities.profiles;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity representing extended profile information for a user,
 * stored in {@code profiles.user_profile}.
 * Has a one-to-one relationship with {@link User} via the {@code user_id} foreign key.
 */
@Entity
@Table(name = "user_profile", schema = "profiles")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserProfile {

    /** Database-generated surrogate primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    /** The owning user. Fetched lazily; must not be {@code null}. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** Profile photo encoded as a Base64 string. May be {@code null} if none was provided. */
    @Column(columnDefinition = "TEXT")
    private String photo;

    /** Facebook profile URL. */
    @Column(name = "facebook")
    private String facebook;

    /** Mobile phone number in E.164 format. */
    @Column(name = "mobile_phone")
    private String mobilePhone;

    /** Instagram profile URL. */
    @Column(name = "instagram")
    private String instagram;

    /** LinkedIn profile URL. */
    @Column(name = "linkedin")
    private String linkedin;

    /** Timestamp set automatically when the record is first persisted. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Timestamp updated automatically on every save. */
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}