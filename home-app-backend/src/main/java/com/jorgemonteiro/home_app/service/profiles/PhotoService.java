package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.PhotoDownloadException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Base64;

/**
 * Service responsible for downloading remote images and encoding them as Base64 strings.
 * Used during user creation to store a Google profile photo locally in the database.
 */
@Service
@Slf4j
public class PhotoService {

    /**
     * Downloads the image at the given URL and returns its Base64 encoding.
     *
     * @param imageUrl the fully-qualified URL of the image to download
     * @return the Base64-encoded contents of the image
     * @throws PhotoDownloadException if the URL is malformed or the download fails
     */
    public String downloadAndConvertToBase64(String imageUrl) {
        try {
            URI uri = URI.create(imageUrl);
            try (InputStream in = uri.toURL().openStream()) {
                byte[] imageBytes = in.readAllBytes();
                return Base64.getEncoder().encodeToString(imageBytes);
            }
        } catch (IllegalArgumentException e) {
            throw new PhotoDownloadException("Invalid photo URL: " + imageUrl, e);
        } catch (IOException e) {
            throw new PhotoDownloadException("Failed to download photo from: " + imageUrl, e);
        }
    }
}