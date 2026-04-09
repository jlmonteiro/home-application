package com.jorgemonteiro.home_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when business validation fails.
 * Maps to HTTP 400 Bad Request.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ValidationException extends HomeAppException {
    public ValidationException(String message) {
        super(message);
    }
}
