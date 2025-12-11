package com.jorgemonteiro.home_app.repository.profiles;

import com.jorgemonteiro.home_app.model.entities.profiles.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
}