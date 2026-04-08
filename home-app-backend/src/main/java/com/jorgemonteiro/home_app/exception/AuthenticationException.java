package com.jorgemonteiro.home_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when the current authentication principal is missing required attributes.
 * This indicates a configuration error or an unexpected response from the identity provider.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AuthenticationException extends HomeAppException {

    /**
     * Creates a new exception with the given message.
     *
     * @param message human-readable description of the missing attribute
     */
    public AuthenticationException(String message) {
        super(message);
    }
}
