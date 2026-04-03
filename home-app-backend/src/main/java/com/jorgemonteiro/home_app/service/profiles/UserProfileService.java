package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserProfileAdapter;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.Optional;

/**
 * Service for reading and updating user profile data.
 * All write operations are transactional; reads use a read-only transaction
 * to optimise database resource usage.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class UserProfileService {

    private final UserRepository userRepository;

    /**
     * Returns the profile DTO for the user with the given email address.
     *
     * @param email the user's email address
     * @return an {@link Optional} containing the profile DTO, or empty if no user is found
     */
    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(String email) {
        return userRepository.findByEmail(email).map(UserProfileAdapter::toDTO);
    }

    /**
     * Updates the user and profile fields from the given DTO.
     * If the user does not yet have an associated profile, a new one is created.
     *
     * @param dto the validated DTO containing the fields to update
     * @return the updated profile as a DTO
     * @throws ObjectNotFoundException if no user exists with the email in the DTO
     */
    public UserProfileDTO updateUserProfile(@Valid UserProfileDTO dto) {
        User existingUser = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ObjectNotFoundException("User not found"));

        existingUser.setFirstName(dto.getFirstName());
        existingUser.setLastName(dto.getLastName());
        existingUser.setEnabled(dto.getEnabled());

        if (existingUser.getUserProfile() == null) {
            UserProfile newProfile = UserProfileAdapter.toUserProfileEntity(dto, existingUser);
            newProfile.setUser(existingUser);
            existingUser.setUserProfile(newProfile);
        } else {
            UserProfile profile = existingUser.getUserProfile();
            profile.setPhoto(dto.getPhoto());
            profile.setFacebook(dto.getFacebook());
            profile.setMobilePhone(dto.getMobilePhone());
            profile.setInstagram(dto.getInstagram());
            profile.setLinkedin(dto.getLinkedin());
        }

        User savedUser = userRepository.save(existingUser);
        return UserProfileAdapter.toDTO(savedUser);
    }
}