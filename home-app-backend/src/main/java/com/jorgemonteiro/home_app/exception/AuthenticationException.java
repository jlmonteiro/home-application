package com.jorgemonteiro.home_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when the current authentication principal is missing required attributes or
 * authentication with external providers fails.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthenticationException extends HomeAppException {

    /**
     * Creates a new exception with the given message.
     *
     * @param message human-readable description of the error
     */
    public AuthenticationException(String message) {
        super(message);
    }

    /**
     * Creates a new exception with the given message and cause.
     *
     * @param message human-readable description of the error
     * @param cause   the underlying exception
     */
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
