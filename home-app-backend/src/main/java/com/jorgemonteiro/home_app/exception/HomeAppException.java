package com.jorgemonteiro.home_app.exception;

/**
 * Marker class for all application-specific errors.
 * All custom exceptions in this application must extend this class.
 * Direct instantiation of this class is discouraged; instead, create specific
 * subclasses for each error condition.
 * Maps to HTTP 500 via {@link com.jorgemonteiro.home_app.config.GlobalExceptionHandler}.
 */
public abstract class HomeAppException extends RuntimeException {

    /**
     * Creates a new exception with the given message.
     *
     * @param message human-readable description of the error
     */
    protected HomeAppException(String message) {
        super(message);
    }

    /**
     * Creates a new exception with the given message and root cause.
     *
     * @param message human-readable description of the error
     * @param cause   the underlying exception that triggered this error
     */
    protected HomeAppException(String message, Throwable cause) {
        super(message, cause);
    }
}
