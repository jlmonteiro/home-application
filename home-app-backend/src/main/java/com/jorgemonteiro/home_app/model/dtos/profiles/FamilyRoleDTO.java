package com.jorgemonteiro.home_app.model.dtos.profiles;

/**
 * Data transfer object for Family Roles.
 */
public record FamilyRoleDTO(
        Long id,
        String name,
        Boolean immutable
) {
}
