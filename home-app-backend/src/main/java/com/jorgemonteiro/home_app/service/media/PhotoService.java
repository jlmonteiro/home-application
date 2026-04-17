package com.jorgemonteiro.home_app.service.media;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.entities.media.Photo;
import com.jorgemonteiro.home_app.repository.media.PhotoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.Optional;

/**
 * Service for managing centralized binary photo storage.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PhotoService {

    private final PhotoRepository photoRepository;

    /**
     * Retrieves a photo by its unique name.
     */
    @Transactional(readOnly = true)
    public Photo getPhoto(String name) {
        return photoRepository.findByName(name)
                .orElseThrow(() -> new ObjectNotFoundException("Photo with name " + name + " not found"));
    }

    /**
     * Saves or updates a photo from a base64 string.
     * @param base64Data The base64 encoded image data (can include prefix).
     * @param targetName The desired filename (e.g. user-1-profile).
     * @param type The category (profile, recipe, etc.).
     * @return The final name of the stored photo with extension.
     */
    public String savePhoto(String base64Data, String targetName, String type) {
        if (base64Data == null || base64Data.isEmpty()) return null;

        String contentType = "image/png";
        String extension = "png";

        if (base64Data.contains("data:")) {
            contentType = base64Data.substring(base64Data.indexOf(":") + 1, base64Data.indexOf(";"));
            extension = contentType.substring(contentType.lastIndexOf("/") + 1);
            base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
        }

        // Clean up whitespace/newlines that might break decoding
        base64Data = base64Data.replaceAll("\\s", "");

        byte[] binaryData = Base64.getDecoder().decode(base64Data);
        String fileName = targetName + "." + extension;

        Photo photo = photoRepository.findByName(fileName).orElse(new Photo());
        photo.setName(fileName);
        photo.setType(type);
        photo.setExtension(extension);
        photo.setContentType(contentType);
        photo.setData(binaryData);

        photoRepository.save(photo);
        log.info("Saved photo: {} (type: {})", fileName, type);
        
        return fileName;
    }

    /**
     * Helper to build the public URL for a photo.
     */
    public String getPhotoUrl(String photoName) {
        if (photoName == null || photoName.isEmpty()) return null;
        if (photoName.startsWith("http")) return photoName;
        return "/api/images/" + photoName;
    }

    /**
     * Generates a clean filename based on the entity name and a unique suffix.
     * @param originalName The name of the entity (e.g. "Red Onion").
     * @param type The type of entity (e.g. "item").
     * @return A slugified filename like "red-onion-item-uuid".
     */
    public String generateFileName(String originalName, String type) {
        if (originalName == null || originalName.isEmpty()) {
            return type + "-" + java.util.UUID.randomUUID();
        }
        String slug = originalName.toLowerCase()
                .replaceAll("[^a-z0-9]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug + "-" + type + "-" + java.util.UUID.randomUUID().toString().substring(0, 8);
    }
}
