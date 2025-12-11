# Java

## Lombok

- Use Lombok annotations for getters, setters, hashCode, equals, toString, and constructor generation
- Example: `@Data`, `@EqualsAndHashCode`, `@ToString`, `@NoArgsConstructor`, `@AllArgsConstructor`

## Packages

Use the following package standards:

- all packages should be below the base package `com.jorgemonteiro.home_app`
- `model` package should contain nsted packages for `dtos` and `entities`
  - `adapter` is a nested package bellow model which contains the convertes which translate dtos to entities and vice versa.
- `repository` package should contain all repository interfaces
- `service` package should contain all service classes
- `controller` package should contain all REST controllers
- `config` package should contain all configuration classes
- `exception` package should contain all custom exception classes
- `util` package should contain all utility classes
- services, entities, dtos, repositories and controllers can be subdivided by their respective schema

## Scopes

- repositories should only contain data-related logic
- services contain the business logic and are usually where the transaction scope is set
- rest controllers should have no complexity and delegate business logic to the service
- rest controllers should only return or receive dtos. entities are never exposed.

## Exception Handling

- Use custom exceptions extending `HomeAppException` (base runtime exception)
- `ObjectNotFoundException` for 404 errors (not found scenarios)
- `HomeAppException` maps to 500 errors (general application errors)
- Handle exceptions globally using `@RestControllerAdvice`
- Never throw generic `RuntimeException` in business logic

