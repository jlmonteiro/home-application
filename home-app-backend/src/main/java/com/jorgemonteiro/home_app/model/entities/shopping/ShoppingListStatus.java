package com.jorgemonteiro.home_app.model.entities.shopping;

/**
 * Lifecycle states for a {@link ShoppingList}.
 * Stored as a string in the database — existing values are preserved.
 */
public enum ShoppingListStatus {
    PENDING,
    COMPLETED
}
