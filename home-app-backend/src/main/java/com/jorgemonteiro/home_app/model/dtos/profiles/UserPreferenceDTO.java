package com.jorgemonteiro.home_app.model.dtos.profiles;

import lombok.Data;

/**
 * DTO for user preferences.
 */
@Data
public class UserPreferenceDTO {
    private boolean showShoppingWidget;
    private Long version;
}
