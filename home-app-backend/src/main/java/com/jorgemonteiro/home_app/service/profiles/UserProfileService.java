package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserProfileAdapter;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.FamilyRole;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.repository.profiles.FamilyRoleRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserProfileRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.Optional;

/**
 * Service for reading and updating user profile data.
 * All write operations are transactional; reads use a read-only transaction.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FamilyRoleRepository familyRoleRepository;
    private final PhotoService photoService;
    private final AgeClassificationService ageClassificationService;

    @Transactional(readOnly = true)
    public Page<UserProfileDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserProfileAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(Long id) {
        return userRepository.findById(id).map(UserProfileAdapter::toDTO);
    }

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(String email) {
        return userProfileRepository.findByUserEmail(email).map(up -> UserProfileAdapter.toDTO(up.getUser()));
    }

    @Transactional(readOnly = true)
    public java.util.List<com.jorgemonteiro.home_app.model.dtos.profiles.UserDTO> listAllUsers() {
        return userRepository.findAll().stream()
                .map(com.jorgemonteiro.home_app.model.adapter.profiles.UserAdapter::toDTO)
                .collect(java.util.stream.Collectors.toList());
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
            UserProfile newProfile = UserProfileAdapter.toUserProfileEntity(dto, existingUser);
            applyProfileUpdates(newProfile, dto);
            existingUser.setUserProfile(newProfile);
        } else {
            applyProfileUpdates(existingUser.getUserProfile(), dto);
        }

        User savedUser = userRepository.save(existingUser);
        return UserProfileAdapter.toDTO(savedUser);
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
        return UserProfileAdapter.toDTO(savedUser);
    }

    private void applyProfileUpdates(UserProfile profile, UserProfileDTO dto) {
        profile.setPhoto(processPhoto(dto.getPhoto()));
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

    private String processPhoto(String photo) {
        if (photo != null && photo.startsWith("http")) {
            return photoService.downloadAndConvertToBase64(photo);
        }
        return photo;
    }
}
