package com.jorgemonteiro.home_app.controller.media;

import com.jorgemonteiro.home_app.model.entities.media.Photo;
import com.jorgemonteiro.home_app.service.media.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for serving binary image data.
 */
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final PhotoService photoService;

    /**
     * Serves the raw binary data of a photo.
     * @param name The unique name of the photo (including extension).
     * @return The binary data with appropriate content-type headers.
     */
    @GetMapping("/{name}")
    public ResponseEntity<byte[]> getImage(@PathVariable String name) {
        Photo photo = photoService.getPhoto(name);
        
        if (photo.getData() == null || photo.getData().length == 0) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(photo.getContentType()));
        headers.setCacheControl("max-age=31536000"); // Cache for 1 year

        return new ResponseEntity<>(photo.getData(), headers, HttpStatus.OK);
    }
}
