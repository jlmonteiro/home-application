package com.jorgemonteiro.home_app.repository.media;

import com.jorgemonteiro.home_app.model.entities.media.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Photo} entity.
 */
@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    Optional<Photo> findByName(String name);
}
