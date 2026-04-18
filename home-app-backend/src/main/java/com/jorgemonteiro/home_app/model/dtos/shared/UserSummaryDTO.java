package com.jorgemonteiro.home_app.model.dtos.shared;

import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared DTO for basic user information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String name;
    private PhotoDTO photo;

    public UserSummaryDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
