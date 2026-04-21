package com.jorgemonteiro.home_app.model.dtos.recipes;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for {@link com.jorgemonteiro.home_app.model.entities.recipes.Label}.
 */
@Data
@NoArgsConstructor
public class LabelDTO {
    private Long id;
    private String name;

    public LabelDTO(String name) {
        this.name = name;
    }
}
