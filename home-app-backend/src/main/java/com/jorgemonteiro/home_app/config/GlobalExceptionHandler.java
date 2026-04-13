package com.jorgemonteiro.home_app.config;

import com.jorgemonteiro.home_app.exception.AppErrorType;
import com.jorgemonteiro.home_app.exception.HomeAppException;
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.exception.ValidationException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
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
 * Error type URIs are built from the configurable {@code app.error-base-url} property.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private final String errorBaseUrl;

    public GlobalExceptionHandler(@Value("${app.error-base-url}") String errorBaseUrl) {
        this.errorBaseUrl = errorBaseUrl;
    }

    private URI errorType(AppErrorType type) {
        return URI.create(errorBaseUrl + "/" + type.name().toLowerCase().replace('_', '-'));
    }

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
        problemDetail.setType(errorType(AppErrorType.VALIDATION_ERROR));

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
        problemDetail.setType(errorType(AppErrorType.VALIDATION_ERROR));

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
        problemDetail.setType(errorType(AppErrorType.VALIDATION_ERROR));
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
        problemDetail.setType(errorType(AppErrorType.NOT_FOUND));
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
        problemDetail.setType(errorType(AppErrorType.SERVICE_UNAVAILABLE));
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
        problemDetail.setType(errorType(AppErrorType.INTERNAL_SERVER_ERROR));
        return problemDetail;
    }

    /**
     * Handles malformed or unreadable JSON request bodies and returns HTTP 400.
     *
     * @param ex the parsing exception
     * @return {@link ProblemDetail} for 400 response
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleUnreadableMessage(HttpMessageNotReadableException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Malformed or unreadable request body");
        problemDetail.setTitle("Bad Request");
        problemDetail.setType(errorType(AppErrorType.VALIDATION_ERROR));
        return problemDetail;
    }

    /**
     * Catch-all handler for any unexpected exception, ensuring RFC 7807 format is always returned.
     *
     * @param ex the unexpected exception
     * @return {@link ProblemDetail} for 500 response
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setType(errorType(AppErrorType.INTERNAL_SERVER_ERROR));
        return problemDetail;
    }
}
