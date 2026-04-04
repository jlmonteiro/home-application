package com.jorgemonteiro.home_app.model.dtos.profiles;

import lombok.Data;

/**
 * Data transfer object used to capture user information returned by Google's OAuth2 userInfo endpoint.
 */
@Data
public class GoogleUserInfoDTO {
    /** The user's unique email address. */
    private String email;

    /** The user's given name. */
    private String givenName;

    /** The user's family name. */
    private String familyName;

    /** URL to the user's Google profile picture. */
    private String picture;
}
