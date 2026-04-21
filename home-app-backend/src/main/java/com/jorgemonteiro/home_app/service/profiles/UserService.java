package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.PhotoDownloadException;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.profiles.UserProfile;
import com.jorgemonteiro.home_app.repository.profiles.UserProfileRepository;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.Optional;

/**
 * Service that manages user lifecycle operations triggered by OAuth authentication.
 * On first login a new {@link User} and {@link UserProfile} are created; on subsequent
 * logins the existing user is returned, with profile updates if necessary.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PhotoService photoService;
    private final AgeClassificationService ageClassificationService;

    /**
     * Returns an existing user matching the given email, or creates a new one if none exists.
     * When creating a new user a {@link UserProfile} is also created.
     *
     * @param email      the user's email address
     * @param firstName  the user's given name
     * @param lastName   the user's family name
     * @param pictureUrl URL to the user's Google profile picture
     * @param birthdate  the user's birthdate retrieved from Google
     * @return the existing or newly created {@link User}
     */
    public User findOrCreateUser(String email, String firstName, String lastName, String pictureUrl, Optional<LocalDate> birthdate) {
        return userRepository.findByEmail(email)
                .map(user -> syncExistingUser(user, birthdate))
                .orElseGet(() -> createNewUser(email, firstName, lastName, pictureUrl, birthdate));
    }

    @Transactional(readOnly = true)
    public java.util.List<User> listAllUsers() {
        return userRepository.findAll();
    }

    private User syncExistingUser(User user, Optional<LocalDate> birthdate) {
        UserProfile profile = user.getUserProfile();
        if (profile != null && birthdate.isPresent()) {
            boolean dateChanged = profile.getBirthdate() == null || !birthdate.get().equals(profile.getBirthdate());
            if (dateChanged) {
                log.info("Syncing birthdate for existing user {}: {}", user.getEmail(), birthdate.get());
                profile.setBirthdate(birthdate.get());
                profile.setAgeGroupName(ageClassificationService.classify(birthdate.get()));
                userProfileRepository.save(profile);
            }
        }
        return user;
    }

    private User createNewUser(String email, String firstName, String lastName, String pictureUrl, Optional<LocalDate> birthdate) {
        boolean isFirstUser = userRepository.count() == 0;

        User user = new User();
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);

        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);

        birthdate.ifPresent(profile::setBirthdate);

        // Bootstrap: First user is always an Adult
        if (isFirstUser) {
            profile.setAgeGroupName("Adult");
        } else {
            profile.setAgeGroupName(ageClassificationService.classify(profile.getBirthdate()));
        }

        if (pictureUrl != null && !pictureUrl.isEmpty()) {
            String savedPhotoName = downloadAndSaveGooglePhoto(pictureUrl, "user-" + user.getId() + "-profile");
            profile.setPhoto(savedPhotoName);
        }

        userProfileRepository.save(profile);
        user.setUserProfile(profile);

        return user;
    }

    /**
     * Downloads a photo from the given URL and saves it to local media storage.
     *
     * @param imageUrl the URL to download the image from
     * @param targetName the desired filename (without extension)
     * @return the name of the saved photo file, or null if download failed
     */
    private String downloadAndSaveGooglePhoto(String imageUrl, String targetName) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(imageUrl))
                    .GET()
                    .build();

            HttpResponse<byte[]> response = client.send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 200) {
                byte[] imageBytes = response.body();
                String contentType = response.headers().firstValue("content-type").orElse("image/jpeg");
                String extension = contentType.substring(contentType.lastIndexOf("/") + 1);
                
                // Convert byte array to base64 data URI
                String base64Data = "data:" + contentType + ";base64," + java.util.Base64.getEncoder().encodeToString(imageBytes);
                
                String fileName = photoService.savePhoto(base64Data, targetName, "profile");
                log.info("Downloaded and saved Google profile photo: {} for user", fileName);
                return fileName;
            } else {
                log.warn("Failed to download Google profile photo: HTTP {}", response.statusCode());
                return null;
            }
        } catch (IOException | InterruptedException e) {
            log.error("Error downloading Google profile photo", e);
            Thread.currentThread().interrupt();
            return null;
        }
    }
}
