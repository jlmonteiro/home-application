package com.jorgemonteiro.home_app.model.dtos.shared;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared DTO for basic category information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySummaryDTO {
    private Long id;
    private String name;
    private String icon;

    public CategorySummaryDTO(String name, String icon) {
        this.name = name;
        this.icon = icon;
    }
}
