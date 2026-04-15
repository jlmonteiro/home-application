package com.jorgemonteiro.home_app.controller.shopping.resource.shared;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Shared nested resource representing barcode information.
 * Used by shopping resources to group barcode-related attributes.
 */
@Getter
@Setter
@AllArgsConstructor
public class Barcode {
    /** The barcode value or number */
    private String code;
    
    /** The barcode format type (e.g., EAN13, QR_CODE) */
    private String type;
}
