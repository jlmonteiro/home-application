package com.jorgemonteiro.home_app.config;

import com.jorgemonteiro.home_app.exception.AppErrorType;
import com.jorgemonteiro.home_app.exception.HomeAppException;
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralises HTTP error mapping for all application exceptions.
 * Uses RFC 7807 {@link ProblemDetail} for standardized error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles validation errors from {@code @Valid} and returns HTTP 400 with field details.
     *
     * @param ex the validation exception
     * @return {@link ProblemDetail} with a map of field errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleMethodValidationExceptions(MethodArgumentNotValidException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for one or more fields");
        problemDetail.setTitle("Constraint Violation");
        problemDetail.setType(URI.create(AppErrorType.VALIDATION_ERROR.name()));

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        problemDetail.setProperty("errors", errors);
        
        return problemDetail;
    }

    /**
     * Handles validation errors from {@code @Validated} services.
     *
     * @param ex the constraint violation exception
     * @return {@link ProblemDetail} with a map of field errors
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(ConstraintViolationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed for one or more fields");
        problemDetail.setTitle("Constraint Violation");
        problemDetail.setType(URI.create(AppErrorType.VALIDATION_ERROR.name()));

        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation -> {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            errors.put(propertyPath, message);
        });
        problemDetail.setProperty("errors", errors);

        return problemDetail;
    }

    /**
     * Handles business validation errors and returns HTTP 400.
     *
     * @param ex the exception carrying the validation message
     * @return {@link ProblemDetail} for 400 response
     */
    @ExceptionHandler(ValidationException.class)
    public ProblemDetail handleValidationException(ValidationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Validation Error");
        problemDetail.setType(URI.create(AppErrorType.VALIDATION_ERROR.name()));
        return problemDetail;
    }

    /**
     * Handles {@link ObjectNotFoundException} and returns HTTP 404.
     *
     * @param ex the exception carrying the error message
     * @return {@link ProblemDetail} for 404 response
     */
    @ExceptionHandler(ObjectNotFoundException.class)
    public ProblemDetail handleObjectNotFound(ObjectNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problemDetail.setTitle("Object Not Found");
        problemDetail.setType(URI.create(AppErrorType.NOT_FOUND.name()));
        return problemDetail;
    }

    /**
     * Handles database connection failures and returns HTTP 503 Service Unavailable.
     *
     * @param ex the exception carrying the error message
     * @return {@link ProblemDetail} for 503 response
     */
    @ExceptionHandler(DataAccessResourceFailureException.class)
    public ProblemDetail handleDatabaseUnreachable(DataAccessResourceFailureException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, "The database is currently unreachable. Please try again later.");
        problemDetail.setTitle("Service Unavailable");
        problemDetail.setType(URI.create(AppErrorType.SERVICE_UNAVAILABLE.name()));
        return problemDetail;
    }

    /**
     * Handles any other {@link HomeAppException} and returns HTTP 500.
     *
     * @param ex the exception carrying the error message
     * @return {@link ProblemDetail} for 500 response
     */
    @ExceptionHandler(HomeAppException.class)
    public ProblemDetail handleHomeAppException(HomeAppException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setType(URI.create(AppErrorType.INTERNAL_SERVER_ERROR.name()));
        return problemDetail;
    }
}
