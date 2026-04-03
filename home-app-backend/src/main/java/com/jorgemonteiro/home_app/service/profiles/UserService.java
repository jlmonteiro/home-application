package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.PhotoDownloadException;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.repository.profiles.UserProfileRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service that manages user lifecycle operations triggered by OAuth authentication.
 * On first login a new {@link User} and {@link UserProfile} are created; on subsequent
 * logins the existing user is returned unchanged.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PhotoService photoService;

    /**
     * Returns an existing user matching the given email, or creates a new one if none exists.
     * When creating a new user a {@link UserProfile} is also created. If a {@code pictureUrl}
     * is supplied the photo is downloaded and stored as Base64; download failures are logged
     * and the profile is saved without a photo.
     *
     * @param email      the user's email address (unique identifier from Google)
     * @param firstName  the user's given name from Google
     * @param lastName   the user's family name from Google
     * @param pictureUrl URL to the user's Google profile picture; may be {@code null}
     * @return the existing or newly created {@link User}
     */
    public User findOrCreateUser(String email, String firstName, String lastName, String pictureUrl) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, firstName, lastName, pictureUrl));
    }

    private User createNewUser(String email, String firstName, String lastName, String pictureUrl) {
        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);

        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);

        if (pictureUrl != null && !pictureUrl.isEmpty()) {
            try {
                profile.setPhoto(photoService.downloadAndConvertToBase64(pictureUrl));
            } catch (PhotoDownloadException e) {
                log.warn("Could not download profile photo for new user {}, proceeding without photo: {}", email, e.getMessage());
            }
        }

        userProfileRepository.save(profile);
        user.setUserProfile(profile);

        return user;
    }
}