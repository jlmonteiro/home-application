package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.AgeGroupConfig;
import com.jorgemonteiro.home_app.repository.profiles.AgeGroupConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgeClassificationService {

    static final String CACHE_NAME = "ageGroupConfigs";

    private final AgeGroupConfigRepository ageGroupConfigRepository;

    /**
     * Calculates the age group name based on the provided birthdate and the current configuration.
     * Results are cached under {@value #CACHE_NAME} and evicted when age group settings change.
     *
     * @param birthdate the user's birthdate
     * @return the name of the age group (e.g., "Adult", "Teenager", "Child")
     */
    @Cacheable(CACHE_NAME)
    public String classify(LocalDate birthdate) {
        if (birthdate == null) return "Adult";
        int age = Period.between(birthdate, LocalDate.now()).getYears();
        return loadConfigs().stream()
                .filter(c -> age >= c.getMinAge() && age <= c.getMaxAge())
                .map(AgeGroupConfig::getName)
                .findFirst()
                .orElse("Adult");
    }

    /**
     * Loads all age group configurations from the database.
     * Cached separately so the list can be reused across multiple classify calls in the same request.
     */
    @Cacheable(CACHE_NAME + "List")
    @Transactional(readOnly = true)
    public List<AgeGroupConfig> loadConfigs() {
        return ageGroupConfigRepository.findAll();
    }
}
