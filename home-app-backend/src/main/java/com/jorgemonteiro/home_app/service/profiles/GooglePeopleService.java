package com.jorgemonteiro.home_app.service.profiles;

import com.jorgemonteiro.home_app.exception.AuthenticationException;
import com.jorgemonteiro.home_app.model.dtos.profiles.GooglePeopleResponseDTO;
import com.jorgemonteiro.home_app.service.profiles.client.GooglePeopleClient;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GooglePeopleService {

    private final GooglePeopleClient googlePeopleClient;

    /**
     * Fetches the user's birthdate from Google People API.
     *
     * @param accessToken the OAuth2 access token
     * @return an Optional containing the birthdate if found, empty otherwise
     * @throws AuthenticationException if the token is invalid or expired
     */
    public Optional<LocalDate> fetchBirthdate(String accessToken) {
        log.debug("Fetching birthdate from Google People API...");
        try {
            GooglePeopleResponseDTO response = googlePeopleClient.getPersonData(
                    "birthdays",
                    "Bearer " + accessToken
            );

            if (response == null) {
                log.warn("Google People API returned null response");
                return Optional.empty();
            }

            if (response.birthdays() == null || response.birthdays().isEmpty()) {
                log.info("No birthdate information found in Google profile for this user");
                return Optional.empty();
            }

            log.debug("Found {} birthday entries in Google profile", response.birthdays().size());

            return response.birthdays().stream()
                    .map(GooglePeopleResponseDTO.BirthdayContainer::date)
                    .filter(date -> {
                        boolean valid = date != null && date.year() != null && date.month() != null && date.day() != null;
                        if (!valid) log.debug("Skipping incomplete birthday date: {}", date);
                        return valid;
                    })
                    .map(date -> {
                        LocalDate ld = LocalDate.of(date.year(), date.month(), date.day());
                        log.info("Successfully parsed birthdate: {}", ld);
                        return ld;
                    })
                    .findFirst();

        } catch (FeignException.Unauthorized e) {
            log.error("Authentication failed while calling Google People API", e);
            throw new AuthenticationException("Failed to authenticate with Google People API", e);
        } catch (FeignException.Forbidden e) {
            log.warn("Access forbidden to Google People API (likely API disabled in Cloud Console): {}", e.getMessage());
            return Optional.empty(); // Graceful degradation: proceed without birthdate
        } catch (FeignException e) {
            log.error("Error calling Google People API: status {}", e.status(), e);
            return Optional.empty(); // Treat other API errors as missing data for onboarding flow
        }
    }
}
