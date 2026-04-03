package com.jorgemonteiro.home_app.config;

import com.jorgemonteiro.home_app.exception.HomeAppException;
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Centralises HTTP error mapping for all application exceptions.
 * Each {@link HomeAppException} subclass is mapped to an appropriate HTTP status code here
 * so that controllers and services never need to construct error responses directly.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles {@link ObjectNotFoundException} and returns HTTP 404.
     *
     * @param ex the exception carrying the error message
     * @return 404 response with the exception message as the body
     */
    @ExceptionHandler(ObjectNotFoundException.class)
    public ResponseEntity<String> handleObjectNotFound(ObjectNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    /**
     * Handles any other {@link HomeAppException} and returns HTTP 500.
     *
     * @param ex the exception carrying the error message
     * @return 500 response with the exception message as the body
     */
    @ExceptionHandler(HomeAppException.class)
    public ResponseEntity<String> handleHomeAppException(HomeAppException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ex.getMessage());
    }
}