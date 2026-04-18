package com.jorgemonteiro.home_app.model.dtos.shared;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared DTO for basic store information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreSummaryDTO {
    private Long id;
    private String name;
}
