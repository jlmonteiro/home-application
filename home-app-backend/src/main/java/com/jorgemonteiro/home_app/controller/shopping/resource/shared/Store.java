package com.jorgemonteiro.home_app.controller.shopping.resource.shared;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Shared nested resource representing store information.
 * Used by shopping resources to group store-related attributes.
 */
@Getter
@Setter
@AllArgsConstructor
public class Store {
    /** Unique identifier of the store */
    private Long id;
    
    /** Name of the store */
    private String name;
}
