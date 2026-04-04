package com.jorgemonteiro.home_app.model.adapter.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;

/**
 * Static adapter class that converts between {@link User} entities and {@link UserDTO}.
 */
public class UserAdapter {

    /**
     * Converts a {@link User} entity into a {@link UserDTO}.
     *
     * @param user the user entity to convert; returns {@code null} if {@code user} is {@code null}
     * @return a populated DTO
     */
    public static UserDTO toDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEnabled(user.getEnabled());

        return dto;
    }

    /**
     * Converts a {@link UserDTO} into a new {@link User} entity.
     *
     * @param dto the DTO to convert; returns {@code null} if {@code dto} is {@code null}
     * @return a new, unpersisted {@link User} entity
     */
    public static User toEntity(UserDTO dto) {
        if (dto == null) return null;

        User user = new User();
        user.setId(dto.getId());
        user.setEmail(dto.getEmail());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEnabled(dto.getEnabled());

        return user;
    }
}
