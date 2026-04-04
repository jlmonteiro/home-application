package com.jorgemonteiro.home_app.exception;

/**
 * Standardized error types for the application.
 * Mapped to the 'type' field in RFC 7807 ProblemDetail responses.
 */
public enum AppErrorType {
    /** Resource not found. */
    NOT_FOUND,
    
    /** Input validation failed. */
    VALIDATION_ERROR,
    
    /** Unexpected internal server error. */
    INTERNAL_SERVER_ERROR
}
