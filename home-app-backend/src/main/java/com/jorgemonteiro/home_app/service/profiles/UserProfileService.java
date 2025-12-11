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

@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(String email) {
        return userRepository.findById(email).map(UserProfileAdapter::toDTO);
    }

    public UserProfileDTO updateUserProfile(@Valid UserProfileDTO dto) {
        User existingUser = userRepository.findById(dto.getEmail())
                .orElseThrow(() -> new ObjectNotFoundException("User not found"));

        // Update user fields
        existingUser.setFirstName(dto.getFirstName());
        existingUser.setLastName(dto.getLastName());
        existingUser.setEnabled(dto.getEnabled());

        // Update or create user profile
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
