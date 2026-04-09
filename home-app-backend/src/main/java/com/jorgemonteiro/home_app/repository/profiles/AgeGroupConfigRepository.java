package com.jorgemonteiro.home_app.repository.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.AgeGroupConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgeGroupConfigRepository extends JpaRepository<AgeGroupConfig, Long> {
    Optional<AgeGroupConfig> findByName(String name);
}
