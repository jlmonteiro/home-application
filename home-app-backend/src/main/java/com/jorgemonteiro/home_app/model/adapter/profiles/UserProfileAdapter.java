package com.jorgemonteiro.home_app.model.adapter.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.SocialProfilesDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.FamilyRoleDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO;
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
            UserProfile profile = user.getUserProfile();
            dto.setPhoto(new PhotoDTO(null, photoService.getPhotoUrl(profile.getPhoto())));
            dto.setMobilePhone(profile.getMobilePhone());
            dto.setBirthdate(profile.getBirthdate());
            dto.setAgeGroupName(profile.getAgeGroupName());

            dto.setSocial(new SocialProfilesDTO(
                    profile.getFacebook(),
                    profile.getInstagram(),
                    profile.getLinkedin()
            ));

            if (profile.getFamilyRole() != null) {
                dto.setFamilyRole(toRoleDTO(profile.getFamilyRole()));
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
        userProfile.setPhoto(dto.getPhoto() != null ? dto.getPhoto().getData() : null);
        userProfile.setMobilePhone(dto.getMobilePhone());
        userProfile.setBirthdate(dto.getBirthdate());

        if (dto.getSocial() != null) {
            userProfile.setFacebook(dto.getSocial().getFacebook());
            userProfile.setInstagram(dto.getSocial().getInstagram());
            userProfile.setLinkedin(dto.getSocial().getLinkedin());
        }

        return userProfile;
    }

    public static FamilyRoleDTO toRoleDTO(FamilyRole role) {
        if (role == null) return null;
        return new FamilyRoleDTO(role.getId(), role.getName(), role.isImmutable());
    }
}
