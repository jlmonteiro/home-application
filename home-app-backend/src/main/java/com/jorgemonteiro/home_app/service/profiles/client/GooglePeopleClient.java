package com.jorgemonteiro.home_app.service.profiles.client;

import com.jorgemonteiro.home_app.model.dtos.profiles.GooglePeopleResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "google-people-api")
public interface GooglePeopleClient {

    /**
     * Fetches user profile data from Google People API.
     *
     * @param personFields the fields to retrieve (e.g., "birthdays")
     * @param authHeader   the Authorization header containing the access token
     * @return the profile data
     */
    @GetMapping("/people/me")
    GooglePeopleResponseDTO getPersonData(
            @RequestParam("personFields") String personFields,
            @RequestHeader("Authorization") String authHeader
    );
}
