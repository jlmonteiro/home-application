# ProblemDetail (RFC 7807) in Spring Boot 3+

Spring Boot 3+ natively supports [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) using the `ProblemDetail` class.

## Why use it?
- Standardized error format for machine consumption.
- Avoids custom "ErrorResponse" objects.
- Widely understood across different languages and clients.

## Implementation Patterns

### 1. Simple Exception Handling
In your `@RestControllerAdvice`:

```java
@ExceptionHandler(UserNotFoundException.class)
public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
}
```

### 2. Custom Properties
You can add extra metadata using `setProperty`:

```java
@ExceptionHandler(InvalidOrderException.class)
public ProblemDetail handleInvalidOrder(InvalidOrderException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid Order");
    pd.setProperty("orderId", ex.getOrderId());
    pd.setProperty("reasons", ex.getReasons());
    return pd;
}
```

### 3. Error Types (Enums)
Instead of hardcoding URLs, map your error types to an Enum and convert it to a URI. This provides a clean, machine-readable `type` string (e.g., `VALIDATION_ERROR` instead of a URL).

```java
// Define standard error types
public enum AppErrorType {
    NOT_FOUND,
    VALIDATION_ERROR
}

// In the exception handler
pd.setType(URI.create(AppErrorType.VALIDATION_ERROR.name()));
```

## Global Configuration
To enable standard RFC 7807 responses for built-in Spring exceptions (like `MethodArgumentNotValidException`), extend `ResponseEntityExceptionHandler`:

```java
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    // Override methods as needed
}
```
