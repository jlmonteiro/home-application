# Design: User Profile Enhancements

This document outlines the technical design for the `/me` endpoint and the improved hypermedia verification strategy.

## 1. "Who Am I" Endpoint (`/api/user/me`)

### Implementation Strategy
The `/me` endpoint acts as a hypermedia alias. It identifies the user via the `SecurityContext`, retrieves their profile, and returns it using the same `UserProfileResourceAssembler` as the canonical `/{id}` endpoint.

### Security Context Extraction
We will use `@AuthenticationPrincipal` to inject the `OAuth2User` into the controller method.
- **Identity Key**: The `email` attribute from the OAuth2 principal will be used to look up the local `User` record.
- **Validation**: If the `email` attribute is missing or null, the controller will throw a `HomeAppException` (Internal Server Error) or a custom authentication-related exception to prevent downstream null pointer issues.

### Controller Signature
```java
@GetMapping("/me")
public ResponseEntity<UserProfileResource> getMyProfile(@AuthenticationPrincipal OAuth2User principal) {
    String email = principal.getAttribute("email");
    if (email == null || email.isBlank()) {
        throw new HomeAppException("Authentication principal is missing email attribute");
    }
    
    return userProfileService.getUserProfile(email)
            .map(resourceAssembler::toModel)
            .map(resource -> {
                // Add supplementary 'me' link pointing back to this alias
                resource.add(linkTo(methodOn(UserProfileController.class).getMyProfile(null)).withRel("me"));
                return resource;
            })
            .map(ResponseEntity::ok)
            .orElseThrow(() -> new ObjectNotFoundException("User record not found for authenticated email: " + email));
}
```

### Canonical Link Generation
The `UserProfileResourceAssembler.toModel()` generates a `self` link using the user's surrogate ID. By using this assembler in the `/me` endpoint, the response will:
1.  Have a canonical `self` link pointing to `/api/user/{id}`.
2.  Have an alias `me` link pointing to `/api/user/me`.

---

## 2. Enhanced HATEOAS & Pagination Testing

### Test Data Strategy
To verify pagination navigation (AC-007), we will create a new SQL script:
- **File**: `src/test/resources/scripts/sql/pagination-test-data.sql`
- **Content**: Insert 20 users and corresponding profiles into the `profiles` schema.

### Test Implementation (`UserProfileControllerSpec`)

#### Mocking OAuth2 Authentication
To test `/me`, we will use the `SecurityMockMvcRequestPostProcessors.oauth2Login()` request post-processor:
```groovy
def "GET /api/user/me should return authenticated user profile"() {
    given: "an authenticated user session"
        def auth = oauth2Login()
            .attributes { it.put("email", "existing@example.com") }

    when: "requesting the 'me' endpoint"
        def response = mockMvc.perform(get("/api/user/me").with(auth))
    // ... assertions
}
```

#### Pagination Verification
- **State**: Use `@Sql("/scripts/sql/pagination-test-data.sql")`.
- **Action**: Request `/api/user?page=1&size=5&sort=email,asc`.
- **Assertions**:
    - `then`: Verify 200 OK and HAL-JSON content type.
    - `and`: Verify `_embedded.userProfiles` length is 5.
    - `and`: Verify `_links.self`, `_links.first`, `_links.prev`, `_links.next`, and `_links.last` all exist and contain absolute URLs.
    - `and`: Verify `page` metadata (`number: 1`, `size: 5`, `totalElements: 20`, `totalPages: 4`).

---

## 3. Error Handling Updates

### Unauthenticated Access (AC-002)
Verified by adding a test case that performs a request without the `.with(oauth2Login())` post-processor, expecting `401 Unauthorized`.

### Resource Not Found (AC-006)
If a user is authenticated but their email is missing from the local database, the `ObjectNotFoundException` will trigger the standard 404 `ProblemDetail` with type `NOT_FOUND`.
