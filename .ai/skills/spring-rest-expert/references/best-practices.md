# Spring Boot REST Best Practices

## Naming Conventions
- Use nouns for resources (`/users`, `/orders`).
- Use plural nouns for collections.
- Use kebab-case for multi-word segments (`/user-profiles`).
- ID-based access: `/users/{userId}`.

## Payload Naming (Clean REST)
To keep the API consumer-friendly, always strip internal suffixes like `DTO` from the JSON payload.
- **Single Item**: Use the resource name (e.g., `user` instead of `userDTO`).
- **Collections**: Use the plural resource name (e.g., `users` instead of `userList` or `userDTOList`).

### Implementation with HATEOAS
Use the `@Relation` annotation on your DTOs to control how Spring HATEOAS names the keys in the `_embedded` map:
```java
@Relation(collectionRelation = "users", itemRelation = "user")
public class UserDTO { ... }
```

## Hierarchy & Relationships
- Prefer flat paths unless there's a strong nested ownership.
- Nested: `/users/{userId}/posts`.
- Flattened: `/posts?userId={userId}`.

## Request/Response Standards
- **DTOs**: Never expose JPA entities. Convert to DTOs using adapters or MapStruct.
- **Records**: Use Java Records for immutable data transfer.
- **Validation**: Use Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.) in the Controller.

## Paging & Sorting
Always implement paging for collection endpoints.
- Return `PagedModel<T>` (via a concrete wrapper).
- Parameters: `page`, `size`, `sort`.
