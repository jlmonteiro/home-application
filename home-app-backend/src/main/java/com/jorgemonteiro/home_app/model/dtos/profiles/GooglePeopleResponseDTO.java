package com.jorgemonteiro.home_app.model.dtos.profiles;

import java.util.List;

/**
 * Immutable DTO representing the response from Google People API.
 */
public record GooglePeopleResponseDTO(List<BirthdayContainer> birthdays) {

    public record BirthdayContainer(DateData date) {}

    public record DateData(Integer year, Integer month, Integer day) {}
}
