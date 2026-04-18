package com.jorgemonteiro.home_app.model.entities.profiles;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
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

    /** The user's birthdate. Synchronized from Google or manually entered. */
    @Column(name = "birthdate")
    private LocalDate birthdate;

    /** The user's specific role in the family hierarchy. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "family_role_id")
    private FamilyRole familyRole;

    /** The name of the age group this user belongs to (Child, Teenager, Adult). */
    @Column(name = "age_group_name")
    private String ageGroupName;

    /** Unique name of the profile photo stored in media.photos. */
    @Column(name = "photo")
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

    /** Version number for optimistic locking. */
    @Version
    private Integer version;
}
