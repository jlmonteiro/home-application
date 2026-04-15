---
name: spring-rest-expert
description: Specialized guidance for building modern REST APIs with Spring Boot 3+. Use when creating controllers, services, or DTOs. Enforces RFC 7807 (ProblemDetail) and HATEOAS (PagedModel).
---

# Spring REST Expert

Guide for building robust, standard-compliant REST APIs with Spring Boot 3+.

## Core Workflow

1.  **Define DTOs**: Use Records or Lombok for immutable data transfer.
2.  **Create Service**: Implement business logic with `@Service` and `@Transactional`.
3.  **Implement Controller**: Expose endpoints using standard HTTP verbs and status codes.
4.  **Error Handling**: Use `ProblemDetail` (RFC 7807) for error responses.
5.  **HATEOAS**: Use `EntityModel` and `PagedModel` for hypermedia-driven APIs.

## Key Patterns

### Standard REST Actions
- `GET /resource`: 200 OK (collection) - Returns `PagedModel<EntityModel<DTO>>`
- `GET /resource/{id}`: 200 OK - Returns `EntityModel<DTO>` with self-link
- `POST /resource`: 201 Created with `Location` header and body links
- `PUT /resource/{id}`: 200 OK or 204 No Content
- `DELETE /resource/{id}`: 204 No Content

### Error Responses (RFC 7807)
Use `ProblemDetail` within `@ExceptionHandler` methods in a `@RestControllerAdvice`.

## Detailed Resources

- **Best Practices**: [references/best-practices.md](references/best-practices.md) (REST, Naming, Paging)
- **Problem Detail**: [references/problem-detail.md](references/problem-detail.md) (RFC 7807)
- **HATEOAS**: [references/hateoas.md](references/hateoas.md) (PagedModel, EntityModel)
- **Code Templates**: See `assets/templates/` for boilerplate.

## Configuration

Ensure the following dependencies are in `build.gradle.kts`:
- `org.springframework.boot:spring-boot-starter-web`
- `org.springframework.boot:spring-boot-starter-hateoas`
