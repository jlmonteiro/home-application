package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import com.jorgemonteiro.home_app.model.dtos.profiles.AgeGroupConfigDTO;
import com.jorgemonteiro.home_app.model.dtos.profiles.FamilyRoleDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.AgeGroupConfig;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.repository.profiles.AgeGroupConfigRepository;
import com.jorgemonteiro.home_app.repository.profiles.FamilyRoleRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class SettingsService {

    private final AgeGroupConfigRepository ageGroupConfigRepository;
    private final FamilyRoleRepository familyRoleRepository;
    private final UserProfileRepository userProfileRepository;
    private final AgeClassificationService ageClassificationService;

    public List<AgeGroupConfigDTO> getAgeGroups() {
        return ageGroupConfigRepository.findAll().stream()
                .map(c -> new AgeGroupConfigDTO(c.getId(), c.getName(), c.getMinAge(), c.getMaxAge()))
                .sorted(Comparator.comparing(AgeGroupConfigDTO::minAge))
                .toList();
    }

    public List<FamilyRoleDTO> getFamilyRoles() {
        return familyRoleRepository.findAll().stream()
                .map(r -> new FamilyRoleDTO(r.getId(), r.getName(), r.isImmutable()))
                .toList();
    }

    public void updateAgeGroups(List<AgeGroupConfigDTO> dtos) {
        validateAgeRanges(dtos);

        for (AgeGroupConfigDTO dto : dtos) {
            AgeGroupConfig config = ageGroupConfigRepository.findById(dto.id())
                    .orElseThrow(() -> new ObjectNotFoundException("Age group not found: " + dto.id()));
            config.setMinAge(dto.minAge());
            config.setMaxAge(dto.maxAge());
            ageGroupConfigRepository.save(config);
        }

        recalculateAllAges();
    }

    private void validateAgeRanges(List<AgeGroupConfigDTO> dtos) {
        List<AgeGroupConfigDTO> sorted = dtos.stream()
                .sorted(Comparator.comparing(AgeGroupConfigDTO::minAge))
                .toList();

        for (int i = 0; i < sorted.size() - 1; i++) {
            if (sorted.get(i).maxAge() >= sorted.get(i + 1).minAge()) {
                throw new ValidationException("Age ranges must not overlap");
            }
            if (sorted.get(i).maxAge() != sorted.get(i + 1).minAge() - 1) {
                throw new ValidationException("Age ranges must be continuous");
            }
        }
    }

    private void recalculateAllAges() {
        log.info("Triggering bulk age group recalculation");
        List<UserProfile> profiles = userProfileRepository.findAll();
        for (UserProfile profile : profiles) {
            if (profile.getBirthdate() != null) {
                String newGroup = ageClassificationService.classify(profile.getBirthdate());
                profile.setAgeGroupName(newGroup);
                userProfileRepository.save(profile);
            }
        }
    }
}
