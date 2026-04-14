package com.jorgemonteiro.home_app.controller.shopping.resource.shared;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Shared nested resource representing category information.
 * Used by shopping resources to group category-related attributes.
 */
@Getter
@Setter
@AllArgsConstructor
public class Category {
    /** Unique identifier of the category */
    private Long id;
    
    /** Name of the category */
    private String name;
    
    /** Icon identifier for the category */
    private String icon;
}
