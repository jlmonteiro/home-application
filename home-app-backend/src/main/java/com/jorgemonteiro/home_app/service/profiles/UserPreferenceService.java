package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.profiles.UserPreferenceAdapter;
import com.jorgemonteiro.home_app.model.dtos.profiles.UserPreferenceDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserPreference;
import com.jorgemonteiro.home_app.repository.profiles.UserPreferenceRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

/**
 * Service for managing user preferences.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class UserPreferenceService {

    private final UserPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserPreferenceDTO getPreferences(String email) {
        UserPreference preference = getOrCreatePreference(email);
        return UserPreferenceAdapter.toDTO(preference);
    }

    public UserPreferenceDTO updatePreferences(String email, UserPreferenceDTO dto) {
        UserPreference preference = getOrCreatePreference(email);
        
        preference.setShowShoppingWidget(dto.isShowShoppingWidget());
        preference.setShowCouponsWidget(dto.isShowCouponsWidget());
        
        return UserPreferenceAdapter.toDTO(preferenceRepository.save(preference));
    }

    private UserPreference getOrCreatePreference(String email) {
        return preferenceRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ObjectNotFoundException("User not found: " + email));
                    UserPreference newPref = new UserPreference(user);
                    return preferenceRepository.save(newPref);
                });
    }
}
