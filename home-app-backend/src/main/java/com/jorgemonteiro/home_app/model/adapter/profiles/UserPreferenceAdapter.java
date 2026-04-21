package com.jorgemonteiro.home_app.model.adapter.profiles;

import com.jorgemonteiro.home_app.model.dtos.profiles.UserPreferenceDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.UserPreference;

/**
 * Adapter for converting between {@link UserPreference} entity and {@link UserPreferenceDTO}.
 */
public class UserPreferenceAdapter {

    public static UserPreferenceDTO toDTO(UserPreference entity) {
        if (entity == null) return null;
        UserPreferenceDTO dto = new UserPreferenceDTO();
        dto.setShowShoppingWidget(entity.isShowShoppingWidget());
        dto.setShowCouponsWidget(entity.isShowCouponsWidget());
        dto.setVersion(entity.getVersion());
        return dto;
    }
}
