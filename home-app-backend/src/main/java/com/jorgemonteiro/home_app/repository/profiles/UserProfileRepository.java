package com.jorgemonteiro.home_app.repository.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link UserProfile} entities.
 * Provides standard CRUD operations and a user-id-based lookup.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    /**
     * Finds the profile associated with the given user ID.
     *
     * @param userId the surrogate key of the owning {@link com.jorgemonteiro.home_app.model.entities.profiles.User}
     * @return an {@link Optional} containing the profile if found, or empty if none exists
     */
    Optional<UserProfile> findByUserId(Long userId);
}