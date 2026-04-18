package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserAdapter;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserProfileAdapter;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.FamilyRole;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.repository.profiles.FamilyRoleRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserProfileRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for reading and updating user profile data.
 * All write operations are transactional; reads use a read-only transaction.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FamilyRoleRepository familyRoleRepository;
    private final PhotoService photoService;
    private final AgeClassificationService ageClassificationService;
    private final UserProfileAdapter userProfileAdapter;

    @Transactional(readOnly = true)
    public Page<UserProfileDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userProfileAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(Long id) {
        return userRepository.findById(id).map(userProfileAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(String email) {
        return userProfileRepository.findByUserEmail(email).map(up -> userProfileAdapter.toDTO(up.getUser()));
    }

    @Transactional(readOnly = true)
    public List<UserDTO> listAllUsers() {
        return userRepository.findAll().stream()
                .map(UserAdapter::toDTO)
                .collect(Collectors.toList());
    }

    public UserProfileDTO updateUserProfile(@Valid UserProfileDTO dto) {
        User existingUser;
        if (dto.getId() != null) {
            existingUser = userRepository.findById(dto.getId())
                    .orElseThrow(() -> new ObjectNotFoundException("User not found with ID: " + dto.getId()));
        } else {
            existingUser = userRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new ObjectNotFoundException("User not found with email: " + dto.getEmail()));
        }

        existingUser.setFirstName(dto.getFirstName());
        existingUser.setLastName(dto.getLastName());
        existingUser.setEnabled(dto.getEnabled());

        if (existingUser.getUserProfile() == null) {
            UserProfile newProfile = new UserProfile();
            newProfile.setUser(existingUser);
            applyProfileUpdates(newProfile, dto);
            existingUser.setUserProfile(newProfile);
        } else {
            applyProfileUpdates(existingUser.getUserProfile(), dto);
        }

        User savedUser = userRepository.save(existingUser);
        return userProfileAdapter.toDTO(savedUser);
    }

    public UserProfileDTO updateMyProfile(@Valid UserProfileDTO dto) {
        User existingUser = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ObjectNotFoundException("User not found with email: " + dto.getEmail()));

        if (existingUser.getUserProfile() == null) {
            UserProfile newProfile = new UserProfile();
            newProfile.setUser(existingUser);
            existingUser.setUserProfile(newProfile);
        }

        applyProfileUpdates(existingUser.getUserProfile(), dto);

        User savedUser = userRepository.save(existingUser);
        return userProfileAdapter.toDTO(savedUser);
    }

    private void applyProfileUpdates(UserProfile profile, UserProfileDTO dto) {
        if (dto.getPhoto() != null && dto.getPhoto().getData() != null) {
            String fileName = "user-" + profile.getUser().getId() + "-profile";
            profile.setPhoto(photoService.savePhoto(dto.getPhoto().getData(), fileName, "profile"));
        }

        profile.setFacebook(dto.getFacebook());
        profile.setMobilePhone(dto.getMobilePhone());
        profile.setInstagram(dto.getInstagram());
        profile.setLinkedin(dto.getLinkedin());

        if (dto.getBirthdate() != null) {
            profile.setBirthdate(dto.getBirthdate());
            profile.setAgeGroupName(ageClassificationService.classify(dto.getBirthdate()));
        }

        if (dto.getFamilyRoleId() != null) {
            FamilyRole role = familyRoleRepository.findById(dto.getFamilyRoleId())
                    .orElseThrow(() -> new ObjectNotFoundException("Family role not found: " + dto.getFamilyRoleId()));
            profile.setFamilyRole(role);
        }
    }
}
