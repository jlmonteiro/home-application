package com.jorgemonteiro.home_app.model.dtos.profiles;

/**
 * Data transfer object for Age Group Configuration.
 */
public record AgeGroupConfigDTO(
        Long id,
        String name,
        Integer minAge,
        Integer maxAge
) {
}
