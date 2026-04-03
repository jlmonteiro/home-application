package com.jorgemonteiro.home_app.exception;

/**
 * Thrown when a requested resource cannot be found.
 * Maps to HTTP 404 via {@link com.jorgemonteiro.home_app.config.GlobalExceptionHandler}.
 */
public class ObjectNotFoundException extends HomeAppException {

    /**
     * Creates a new exception with the given message.
     *
     * @param message human-readable description of the missing resource
     */
    public ObjectNotFoundException(String message) {
        super(message);
    }
}