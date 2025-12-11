package com.jorgemonteiro.home_app.model.dtos.profiles;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserProfileDTO {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    private Boolean enabled = true;

    private String photo;

    @Pattern(regexp = "^$|^https?://(www\\.)?facebook\\.com/.+", message = "Facebook must be a valid Facebook URL")
    private String facebook;

    @Pattern(regexp = "^$|^\\+?[1-9]\\d{1,14}$", message = "Mobile phone must be a valid phone number")
    private String mobilePhone;

    @Pattern(regexp = "^$|^https?://(www\\.)?instagram\\.com/.+", message = "Instagram must be a valid Instagram URL")
    private String instagram;

    @Pattern(regexp = "^$|^https?://(www\\.)?linkedin\\.com/.+", message = "LinkedIn must be a valid LinkedIn URL")
    private String linkedin;
}
