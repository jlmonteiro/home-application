# Java Development Guidelines

## Overview

This document defines the technical standards and best practices for the **Spring Boot 4.0** backend. We leverage the latest features of **Java 25** to produce code that is expressive, type-safe, and highly performant.

---

## 1. Modern Language Features

### Records and DTOs
Use **Records** for simple, read-only value objects that carry no validation or framework annotations. For DTOs that require Jakarta validation, HATEOAS `@Relation`, or mutability, use Lombok **`@Data`** classes.

!!! success "Best Practices"
    - :material-check-all: Use Records for embedded value objects (e.g., `Category`, `Store`, `Barcode`).
    - :material-check-all: Use `@Data` classes for DTOs that need `@NotBlank`, `@Size`, `@Pattern`, or `@Relation`.
    - :material-check-all: Leverage record patterns in `instanceof` and `switch`.
    - :material-alert-circle: DO NOT use records for JPA Entities (Entities require identity and proxying).
    - :material-alert-circle: DO NOT use records for DTOs that require Jakarta validation annotations.

=== "Record (Value Object)"

    ```java
    public record Store(
        Long id,
        String name
    ) {}
    ```

=== "DTO (@Data Class)"

    ```java
    @Data
    @Relation(collectionRelation = "userProfiles", itemRelation = "userProfile")
    public class UserProfileDTO {

        private Long id;

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        @Size(max = 50, message = "First name must not exceed 50 characters")
        private String firstName;
    }
    ```

### Pattern Matching
Leverage pattern matching to reduce boilerplate and improve readability when dealing with complex types.

!!! tip "Switch Expressions"
    Use exhaustive `switch` expressions with pattern matching for business logic branching.

```java
String statusMessage = switch (user.getAgeGroup()) {
    case CHILD -> "Supervised access only";
    case TEENAGER -> "Standard access";
    case ADULT -> "Full administrative access";
};
```

### Sealed Classes
Use `sealed` interfaces and classes to define restricted class hierarchies, especially for domain-specific states or result types.

```java
public sealed interface CalculationResult 
    permits Success, Failure {}
```

---

## 2. Concurrency & Performance

### Virtual Threads (Project Loom)
Spring Boot 4.0 is optimized for **Virtual Threads**. We prefer simple blocking I/O on virtual threads over complex reactive programming for most use cases.

!!! note "Scaling Strategy"
    - :material-lightning-bolt: Prefer `spring.threads.virtual.enabled=true`.
    - :material-alert-circle: Avoid `ThreadLocal` in favor of **Scoped Values** when using structured concurrency.

### Functional Style
Maintain a strong preference for functional programming patterns to handle collections and optionality.

-   **Streams:** Use for all collection transformations. Avoid manual loops.
-   **Optionals:** Use for return types that may be absent. Avoid returning `null`.
-   **Method References:** Prefer `User::getName` over `u -> u.getName()`.

---

## 3. Spring Boot & JPA Standards

### Controller Patterns (HATEOAS)
All controllers MUST return HATEOAS-compliant resources using HAL.

-   Use `RepresentationModelAssembler` to decouple entity-to-resource mapping.
-   Always include a `self` link for every returned resource.
-   Use `@RequiredArgsConstructor` for dependency injection.
-   Use `@AuthenticationPrincipal OAuth2User principal` to access the current user.

| HTTP Method | Response Pattern |
| :---------- | :--------------- |
| `GET`       | Return `Resource` or `CollectionModel<Resource>` directly |
| `POST`      | `@ResponseStatus(HttpStatus.CREATED)` — return `Resource` |
| `PUT/PATCH` | Return updated `Resource` directly |
| `DELETE`    | `ResponseEntity.noContent().build()` |

!!! info "Resource Package Structure"
    Resource classes and assemblers live in `controller/<domain>/resource/<subdomain>/`:

    - :material-file-code: `<Domain>Resource` — extends `RepresentationModel`
    - :material-cog-sync: `<Domain>ResourceAssembler` — extends `RepresentationModelAssemblerSupport`

### JPA Entity Design
-   **Audit Columns:** Every entity must use `@CreationTimestamp` for `createdAt` and `@UpdateTimestamp` for `updatedAt`.
-   **Fetch Strategy:** Default to `FetchType.LAZY` for all relationships.
-   **Lombok:** Use `@Data` + `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` on all entities.

!!! warning "Circular Reference Prevention"
    `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` is **mandatory** on every entity. Without it, bidirectional JPA relationships cause infinite loops in `hashCode()` and `toString()`. Annotate the identity field with `@EqualsAndHashCode.Include`.

```java
@Entity
@Table(name = "user", schema = "profiles")
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
}
```

### Adapter Pattern (Entity ↔ DTO)
Static adapter classes handle all conversions between JPA entities and DTOs. They live in `model/adapter/<schema>/` and follow the naming convention `<Domain>Adapter`.

!!! tip "Adapter Rules"
    - :material-check-all: Use static methods (`toDTO`, `toEntity`) — adapters are stateless.
    - :material-check-all: Place in `model/adapter/<schema>/` matching the entity's schema.
    - :material-alert-circle: Entities must **never** be exposed directly in API responses — always convert via an adapter.

```java
public class UserProfileAdapter {

    public static UserProfileDTO toDTO(User user) {
        if (user == null) return null;
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        // ...
        return dto;
    }
}
```

### Service Layer Patterns
Services are the transactional boundary and the home for all business logic.

!!! success "Best Practices"
    - :material-check-all: Annotate the class with `@Service`, `@RequiredArgsConstructor`, `@Transactional`, and `@Validated`.
    - :material-check-all: Mark read-only methods with `@Transactional(readOnly = true)`.
    - :material-check-all: Use `@Valid` on method parameters to trigger Jakarta validation.
    - :material-check-all: Throw domain exceptions (`ObjectNotFoundException`, `ValidationException`) — never return `null` for missing entities.
    - :material-alert-circle: DO NOT use `@Autowired` — rely on constructor injection via `@RequiredArgsConstructor`.

```java
@Service
@RequiredArgsConstructor
@Transactional
@Validated
public class UserProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<UserProfileDTO> getUserProfile(Long id) {
        return userRepository.findById(id).map(UserProfileAdapter::toDTO);
    }
}
```

---

## 4. Error Handling (RFC 7807)

All exceptions are mapped to **RFC 7807 Problem Detail** responses by a centralized `GlobalExceptionHandler` annotated with `@RestControllerAdvice`. Error type URIs are built from the `AppErrorType` enum and the configurable `app.error-base-url` property.

!!! tip "Service Layer Rule"
    Services throw domain-specific exceptions. The `GlobalExceptionHandler` maps them to the correct HTTP status and Problem Detail response — services should **never** construct HTTP responses directly.

### Exception Mapping

| Exception | HTTP Status | Description |
| :-------- | :---------: | :---------- |
| `MethodArgumentNotValidException` | 400 | `@Valid` controller parameter failures |
| `ConstraintViolationException` | 400 | `@Validated` service parameter failures |
| `ValidationException` | 400 | Business validation errors |
| `HttpMessageNotReadableException` | 400 | Malformed or unreadable request body |
| `ObjectNotFoundException` | 404 | Entity not found |
| `DataAccessResourceFailureException` | 503 | Database unreachable |
| `HomeAppException` | 500 | Generic application error |
| `Exception` (catch-all) | 500 | Unexpected errors |

!!! warning "Spring Security Exceptions"
    `AccessDeniedException` must be **re-thrown** in the catch-all handler so it propagates to the Spring Security filter chain. Swallowing it would bypass authorization enforcement.

---

## 5. Coding Style & Clean Code

-   **Local Variable Type Inference:** Use `var` for local variables where the type is obvious from the right-hand side.
-   **String Formatting:** Use `String.format()` or `"text %s".formatted(value)` for complex string construction. Use simple concatenation for trivial cases.
-   **Exhaustive Logic:** Ensure all `switch` expressions and logic chains cover all possible states.

### Javadoc

!!! success "Javadoc Standards"
    - :material-check-all: **Class-level Javadoc** is mandatory on all public classes (services, controllers, entities, adapters).
    - :material-check-all: Use `@param` and `@return` tags on all public methods.
    - :material-check-all: Use `{@link ClassName}` to reference related classes and `{@code value}` for inline code.

---

## 6. Logging

Use Lombok's `@Slf4j` annotation for logging across all service classes. Always use **parameterized messages** — never string concatenation.

!!! success "Best Practices"
    - :material-check-all: Add `@Slf4j` to every `@Service` class.
    - :material-check-all: Use parameterized logging: `log.warn("Failed for user {}", userId)`.
    - :material-alert-circle: NEVER use string concatenation: `log.warn("Failed for " + email)`.

| Level | Use Case | Example |
| :---- | :------- | :------ |
| `debug` | Diagnostic detail, method entry/exit | `log.debug("Resolving profile for id {}", id)` |
| `info` | Significant business events | `log.info("New user created: {}", userId)` |
| `warn` | Recoverable failures | `log.warn("Photo download failed for user {}: {}", userId, e.getMessage())` |
| `error` | Unexpected exceptions | `log.error("Unexpected failure in scheduled task", e)` |

!!! warning "Sensitive Data"
    Never log PII (emails, phone numbers), tokens, or credentials. Use surrogate identifiers (e.g., user ID) instead.

---

## 7. Repository Patterns

Repositories are Spring Data JPA interfaces that provide data access for a single entity.

!!! success "Best Practices"
    - :material-check-all: Extend `JpaRepository<Entity, Long>`.
    - :material-check-all: Prefer derived query methods (`findByEmail`) over `@Query` when the method name is readable.
    - :material-check-all: Return `Page<T>` for any operation that lists multiple records.
    - :material-check-all: Place in `repository.<schema>/` matching the entity's database schema.
    - :material-check-all: Add Javadoc on custom query methods explaining the business intent.

```java
public interface UserRepository extends JpaRepository<User, Long> {

    /** Finds a user by their unique email address. */
    Optional<User> findByEmail(String email);
}
```

---

## 8. Security

### Authentication
All `/api/**` endpoints require a valid OAuth2 session. Non-authenticated requests return `401 Unauthorized`.

!!! warning "Default Access Rule"
    Authentication is enforced globally by `SecurityConfig`. Every new endpoint under `/api/**` is protected automatically — no per-controller annotation is needed for basic auth.

### Authorization (Method Security)
Use `@PreAuthorize` for endpoints that require role-based restrictions **beyond** basic authentication.

!!! tip "When to Use @PreAuthorize"
    Only add `@PreAuthorize` when an endpoint must be restricted to a specific role. If all authenticated users should have access, the default security config is sufficient.

-   **Role Naming Convention:** `ROLE_<AGE_GROUP>` (e.g., `ROLE_ADULT`, `ROLE_TEENAGER`).
-   **Current User:** Access via `@AuthenticationPrincipal OAuth2User principal`.

```java
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADULT')")
public class SettingsController {
    // Only adults can access settings management
}
```

---

## AI Alignment

!!! info "Directives for AI Agents"
    - :material-gavel: Use Records for simple value objects; use `@Data` classes for DTOs requiring validation or `@Relation`.
    - :material-gavel: ALWAYS use `@Data` + `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` on JPA entities.
    - :material-gavel: NEVER expose entities in API responses — always convert via a static Adapter class.
    - :material-gavel: ALWAYS annotate services with `@Service`, `@RequiredArgsConstructor`, `@Transactional`, and `@Validated`.
    - :material-gavel: Use `@Transactional(readOnly = true)` on read-only service methods.
    - :material-gavel: Throw domain exceptions (`ObjectNotFoundException`, `ValidationException`) — never return `null` for missing entities.
    - :material-gavel: NEVER use `@Autowired` — rely on constructor injection via `@RequiredArgsConstructor`.
    - :material-gavel: PRIORITIZE Streams for collection manipulation and `Optional` over `null` checks.
    - :material-gavel: Add `@Slf4j` to all service classes. Use parameterized logging. Never log sensitive data.
    - :material-gavel: Repositories extend `JpaRepository`, use derived query methods, and return `Page<T>` for lists.
    - :material-gavel: Use `@PreAuthorize` with `ROLE_<AGE_GROUP>` for role-restricted endpoints.
    - :material-gavel: ENSURE all new entities follow the Liquibase naming conventions established in the [Database Design](../specification/design/database/schema.md).
