package com.jorgemonteiro.home_app.model.adapter.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserProfileDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;

public class UserProfileAdapter {

    public static UserProfileDTO toDTO(User user) {
        if (user == null) return null;

        UserProfileDTO dto = new UserProfileDTO();
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEnabled(user.getEnabled());

        if (user.getUserProfile() != null) {
            dto.setPhoto(user.getUserProfile().getPhoto());
            dto.setFacebook(user.getUserProfile().getFacebook());
            dto.setMobilePhone(user.getUserProfile().getMobilePhone());
            dto.setInstagram(user.getUserProfile().getInstagram());
            dto.setLinkedin(user.getUserProfile().getLinkedin());
        }

        return dto;
    }

    public static User toEntity(UserProfileDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEnabled(dto.getEnabled());
        user.setUserProfile(toUserProfileEntity(dto, user));

        return user;
    }

    public static UserProfile toUserProfileEntity(UserProfileDTO dto, User user) {
        if (dto == null || user == null) return null;

        UserProfile userProfile = new UserProfile();
        userProfile.setPhoto(dto.getPhoto());
        userProfile.setFacebook(dto.getFacebook());
        userProfile.setMobilePhone(dto.getMobilePhone());
        userProfile.setInstagram(dto.getInstagram());
        userProfile.setLinkedin(dto.getLinkedin());

        return userProfile;
    }
}
