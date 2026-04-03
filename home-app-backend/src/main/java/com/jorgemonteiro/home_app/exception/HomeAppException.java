package com.jorgemonteiro.home_app.exception;

/**
 * Base exception for all application-specific errors.
 * All custom exceptions in this application must extend this class.
 * Maps to HTTP 500 via {@link com.jorgemonteiro.home_app.config.GlobalExceptionHandler}.
 */
public class HomeAppException extends RuntimeException {

    /**
     * Creates a new exception with the given message.
     *
     * @param message human-readable description of the error
     */
    public HomeAppException(String message) {
        super(message);
    }

    /**
     * Creates a new exception with the given message and root cause.
     *
     * @param message human-readable description of the error
     * @param cause   the underlying exception that triggered this error
     */
    public HomeAppException(String message, Throwable cause) {
        super(message, cause);
    }
}