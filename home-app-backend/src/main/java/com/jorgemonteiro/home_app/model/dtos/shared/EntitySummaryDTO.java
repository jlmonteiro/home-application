package com.jorgemonteiro.home_app.model.dtos.shared;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic shared DTO for basic entity information (ID and name).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntitySummaryDTO {
    private Long id;
    private String name;
}
