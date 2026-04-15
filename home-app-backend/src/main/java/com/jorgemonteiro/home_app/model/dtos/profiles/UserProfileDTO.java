package com.jorgemonteiro.home_app.model.dtos.profiles;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.hateoas.server.core.Relation;

import java.time.LocalDate;

/**
 * Data transfer object for reading and updating a user's profile.
 * Combines fields from both the {@code User} and {@code UserProfile} entities.
 */
@Data
@Relation(collectionRelation = "userProfiles", itemRelation = "userProfile")
public class UserProfileDTO {

    /** The database-generated surrogate primary key. */
    private Long id;

    /** The user's unique email address. */
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    /** The user's first name. */
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    /** The user's last name. */
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    /** Whether the user account is active. */
    private Boolean enabled;

    /** The user's birthdate. */
    @Past(message = "Birthdate must be in the past")
    private LocalDate birthdate;

    /** The ID of the assigned family role. */
    private Long familyRoleId;

    /** The display name of the assigned family role. */
    private String familyRoleName;

    /** The name of the calculated age group. */
    private String ageGroupName;

    /** Base64-encoded profile photo data. */
    private String photo;

    /** The user's Facebook profile URL. */
    @Pattern(regexp = "^$|^https?://(www\\.)?facebook\\.com/.+", message = "Facebook must be a valid Facebook URL")
    private String facebook;

    /** The user's mobile phone number. */
    @Pattern(regexp = "^$|^\\+?[0-9\\s\\-()]{7,20}$", message = "Mobile phone must be a valid phone number")
    private String mobilePhone;

    /** The user's Instagram profile URL. */
    @Pattern(regexp = "^$|^https?://(www\\.)?instagram\\.com/.+", message = "Instagram must be a valid Instagram URL")
    private String instagram;

    /** The user's LinkedIn profile URL. */
    @Pattern(regexp = "^$|^https?://(www\\.)?linkedin\\.com/.+", message = "LinkedIn must be a valid LinkedIn URL")
    private String linkedin;
}
