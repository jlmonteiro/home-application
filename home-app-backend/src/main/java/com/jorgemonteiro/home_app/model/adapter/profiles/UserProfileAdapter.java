package com.jorgemonteiro.home_app.model.adapter.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.FamilyRoleDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.FamilyRole;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

/**
 * Adapter component that converts between {@link User}/{@link UserProfile} entities
 * and {@link UserProfileDTO}.
 * Uses instance methods to allow for dependency injection (e.g. PhotoService).
 */
@Component
@RequiredArgsConstructor
public class UserProfileAdapter {

    private final PhotoService photoService;

    /**
     * Converts a {@link User} entity (and its associated profile if present) into a {@link UserProfileDTO}.
     *
     * @param user the user entity to convert; returns {@code null} if {@code user} is {@code null}
     * @return a populated DTO, with profile fields left {@code null} if no profile is attached
     */
    public UserProfileDTO toDTO(User user) {
        if (user == null) return null;

        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEnabled(user.getEnabled());

        if (user.getUserProfile() != null) {
            dto.setPhoto(photoService.getPhotoUrl(user.getUserProfile().getPhoto()));
            dto.setFacebook(user.getUserProfile().getFacebook());
            dto.setMobilePhone(user.getUserProfile().getMobilePhone());
            dto.setInstagram(user.getUserProfile().getInstagram());
            dto.setLinkedin(user.getUserProfile().getLinkedin());
            dto.setBirthdate(user.getUserProfile().getBirthdate());
            dto.setAgeGroupName(user.getUserProfile().getAgeGroupName());

            if (user.getUserProfile().getFamilyRole() != null) {
                dto.setFamilyRoleId(user.getUserProfile().getFamilyRole().getId());
                dto.setFamilyRoleName(user.getUserProfile().getFamilyRole().getName());
            }
        }

        return dto;
    }

    /**
     * Converts a {@link UserProfileDTO} into a new {@link User} entity with an attached {@link UserProfile}.
     *
     * @param dto the DTO to convert; returns {@code null} if {@code dto} is {@code null}
     * @return a new, unpersisted {@link User} entity
     */
    public User toEntity(UserProfileDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEnabled(dto.getEnabled());
        user.setUserProfile(toUserProfileEntity(dto, user));

        return user;
    }

    /**
     * Creates a new {@link UserProfile} entity from a {@link UserProfileDTO} and its owning {@link User}.
     *
     * @param dto  the DTO containing profile data; returns {@code null} if {@code dto} or {@code user} is {@code null}
     * @param user the owning user entity
     * @return a new, unpersisted {@link UserProfile} entity
     */
    public UserProfile toUserProfileEntity(UserProfileDTO dto, User user) {
        if (dto == null || user == null) return null;

        UserProfile userProfile = new UserProfile();
        userProfile.setUser(user);
        userProfile.setPhoto(dto.getPhoto());
        userProfile.setFacebook(dto.getFacebook());
        userProfile.setMobilePhone(dto.getMobilePhone());
        userProfile.setInstagram(dto.getInstagram());
        userProfile.setLinkedin(dto.getLinkedin());
        userProfile.setBirthdate(dto.getBirthdate());

        return userProfile;
    }

    public static FamilyRoleDTO toRoleDTO(FamilyRole role) {
        if (role == null) return null;
        return new FamilyRoleDTO(role.getId(), role.getName(), role.isImmutable());
    }
}
