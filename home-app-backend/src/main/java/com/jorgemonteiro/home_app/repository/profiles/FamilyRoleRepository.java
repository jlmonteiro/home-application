package com.jorgemonteiro.home_app.repository.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.FamilyRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FamilyRoleRepository extends JpaRepository<FamilyRole, Long> {
    Optional<FamilyRole> findByName(String name);
}
