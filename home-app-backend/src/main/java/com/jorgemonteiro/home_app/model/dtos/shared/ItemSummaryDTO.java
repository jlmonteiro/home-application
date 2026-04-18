package com.jorgemonteiro.home_app.model.dtos.shared;

import com.jorgemonteiro.home_app.model.dtos.shared.PhotoDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared DTO for basic item information.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemSummaryDTO {
    private Long id;
    private String name;
    private PhotoDTO photo;
    private String unit;
    private CategorySummaryDTO category;

    public ItemSummaryDTO(Long id, String name, String photo) {
        this.id = id;
        this.name = name;
        this.photo = new PhotoDTO(null, photo);
    }

    public ItemSummaryDTO(Long id, String name, String photo, String unit) {
        this.id = id;
        this.name = name;
        this.photo = new PhotoDTO(null, photo);
        this.unit = unit;
    }
}
