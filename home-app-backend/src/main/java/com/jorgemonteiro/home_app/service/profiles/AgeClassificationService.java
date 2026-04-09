package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.AgeGroupConfig;
import com.jorgemonteiro.home_app.repository.profiles.AgeGroupConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgeClassificationService {

    private final AgeGroupConfigRepository ageGroupConfigRepository;

    /**
     * Calculates the age group name based on the provided birthdate and the current configuration.
     *
     * @param birthdate the user's birthdate
     * @return the name of the age group (e.g., "Adult", "Teenager", "Child")
     */
    public String classify(LocalDate birthdate) {
        if (birthdate == null) {
            return "Adult"; // Default fallback for safety, though birthdate should be mandatory for non-adults
        }

        int age = Period.between(birthdate, LocalDate.now()).getYears();
        List<AgeGroupConfig> configs = ageGroupConfigRepository.findAll();

        return configs.stream()
                .filter(config -> age >= config.getMinAge() && age <= config.getMaxAge())
                .map(AgeGroupConfig::getName)
                .findFirst()
                .orElse("Adult");
    }
}
