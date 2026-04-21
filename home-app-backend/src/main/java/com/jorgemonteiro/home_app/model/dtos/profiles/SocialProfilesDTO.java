package com.jorgemonteiro.home_app.model.dtos.profiles;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Groups social media profile links.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialProfilesDTO {
    @Pattern(regexp = "^$|^https?://(www\\.)?facebook\\.com/.+", message = "Facebook must be a valid Facebook URL")
    private String facebook;

    @Pattern(regexp = "^$|^https?://(www\\.)?instagram\\.com/.+", message = "Instagram must be a valid Instagram URL")
    private String instagram;

    @Pattern(regexp = "^$|^https?://(www\\.)?linkedin\\.com/.+", message = "LinkedIn must be a valid LinkedIn URL")
    private String linkedin;
}
