package com.jorgemonteiro.home_app.model.dtos.profiles;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Data transfer object representing a basic application user.
 * Used for user management operations where full profile details are not required.
 */
@Data
public class UserDTO {

    /** The database-generated surrogate primary key. */
    private Long id;

    /** The user's unique email address. Required and must be a valid email format. */
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    /** The user's first name. */
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    /** The user's last name. */
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    /** Whether the user account is active. Defaults to {@code true}. */
    private Boolean enabled = true;
}
