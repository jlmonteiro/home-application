# Requirements: User Profile Enhancements

This specification covers the addition of a "who am I" endpoint and the enhancement of hypermedia (HATEOAS) and pagination verification.

## 1. Feature: "Who Am I" Endpoint (REQ-008)

### Description
Provide a way for the currently authenticated user to retrieve their own profile information without needing to know their internal database ID via the `/api/user/me` endpoint.

### Acceptance Criteria
- **AC-001**: Endpoint `GET /api/user/me` is available.
- **AC-002**: Requires a valid OAuth2 authentication session. Unauthenticated requests must return `401 Unauthorized`.
- **AC-003**: Extracts the user's identity (email) from the Spring Security context.
- **AC-004**: Returns a `UserProfileResource` representing the authenticated user.
- **AC-005**: The `_links.self.href` returned by the `/me` endpoint MUST resolve to the canonical resource URL (e.g., `/api/user/{id}`), not the `/me` alias.
- **AC-006**: Returns `404 Not Found` with a structured `ProblemDetail` (type `NOT_FOUND`) if the authenticated user's record is missing from the database.

## 2. Feature: Enhanced HATEOAS & Pagination Testing (REQ-009)

### Description
Ensure the hypermedia API is robust by thoroughly testing link generation and pagination navigation across multiple pages of data. This requires a sufficiently large dataset to trigger pagination boundaries.

### Acceptance Criteria
- **AC-007**: A robust test dataset of >15 users is created (either via updated SQL scripts or programmatic setup) to properly validate pagination boundaries.
- **AC-008**: Integration tests verify that `self` links are absolute and correct for single resources.
- **AC-009**: Integration tests verify that `collection` links point back to the list endpoint.
- **AC-010**: Integration tests verify pagination navigation links (`first`, `last`, `next`, `prev`) when the dataset exceeds one page.
- **AC-011**: Integration tests verify that sorting parameters are preserved in hypermedia links.
