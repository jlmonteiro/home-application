package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.PhotoDownloadException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Base64;

/**
 * Downloads remote images and encodes them as Base64 strings.
 * Uses a {@link RestClient} with configurable connect/read timeouts and a max response size
 * to prevent slow or oversized responses from blocking the OAuth login thread.
 */
@Service
@Slf4j
public class PhotoService {

    private final RestClient restClient;
    private final int maxSizeBytes;

    public PhotoService(
            @Value("${app.photo.connect-timeout-ms}") int connectTimeoutMs,
            @Value("${app.photo.read-timeout-ms}") int readTimeoutMs,
            @Value("${app.photo.max-size-bytes}") int maxSizeBytes) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);

        this.restClient = RestClient.builder().requestFactory(factory).build();
        this.maxSizeBytes = maxSizeBytes;
    }

    /**
     * Downloads the image at the given URL and returns its Base64 encoding.
     *
     * @param imageUrl the fully-qualified URL of the image to download
     * @return the Base64-encoded contents of the image
     * @throws PhotoDownloadException if the download fails, times out, or exceeds the size limit
     */
    public String downloadAndConvertToBase64(String imageUrl) {
        try {
            byte[] imageBytes = restClient.get()
                    .uri(imageUrl)
                    .retrieve()
                    .body(byte[].class);

            if (imageBytes == null || imageBytes.length == 0) {
                throw new PhotoDownloadException("Empty response from: " + imageUrl);
            }
            if (imageBytes.length > maxSizeBytes) {
                throw new PhotoDownloadException(
                        "Photo exceeds max allowed size of %d bytes: %s".formatted(maxSizeBytes, imageUrl));
            }

            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (PhotoDownloadException e) {
            throw e;
        } catch (RestClientException | IllegalArgumentException e) {
            throw new PhotoDownloadException("Failed to download photo from: " + imageUrl, e);
        }
    }
}
