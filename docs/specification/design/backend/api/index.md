# API Design

## Overview

The Home Application API is a RESTful service built with Spring Boot, following HATEOAS principles and using HAL (Hypermedia Application Language) for resource representation.

## Sections

### [API Reference](reference.md)
- :material-api: Complete endpoint documentation
- :material-schema: Request/response schemas
- :material-play-circle: Interactive testing console (via ReDoc)

## Core Principles

### Authentication

!!! note "[:material-lock: FR-1: Google OAuth2 Authentication](../../../requirements/auth-profile.md#fr-1)"

    The system SHALL redirect the user to Google's auth provider and process the authorization code.

!!! note "[:material-shield-check: NFR-1: Security (Zero Trust)](../../../requirements/auth-profile.md#nfr-1)"

    Any request to `/api/**` without a valid session SHALL return 401 Unauthorized.

The API is secured using **Google OAuth2**. All requests to `/api/**` (except the login redirect) MUST include a valid Bearer token.

**Header:**
```http
Authorization: Bearer {google_access_token}
```

- **Session Management:** Spring Security handles the OAuth2 flow and establishes a session.
- **CSRF Protection:** Mutating requests (POST, PUT, PATCH, DELETE) require a valid `X-XSRF-TOKEN` header, which must match the value in the `XSRF-TOKEN` cookie.

### Error Handling (RFC 7807)

The API uses the **Problem Detail for HTTP APIs (RFC 7807)** standard for all error responses. This provides a consistent, machine-readable format for both validation and system errors.

**Sample Problem Detail Payload:**

```json
{
  "type": "https://home-app.dev/errors/validation-failed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "One or more fields failed validation",
  "instance": "/api/user/me",
  "errors": {
    "mobilePhone": "Must be a valid international phone number format.",
    "facebook": "Must be a valid Facebook profile URL."
  }
}
```

### Hypermedia (HATEOAS)

Resources use the `application/hal+json` content type and include a `_links` object to provide discoverability. Clients should use these links rather than hardcoding URL patterns.

**Example Resource:**

```json
{
  "id": 42,
  "name": "Weekly Groceries",
  "status": "ACTIVE",
  "_links": {
    "self": { "href": "http://localhost:8080/api/shopping/lists/42" },
    "items": { "href": "http://localhost:8080/api/shopping/lists/42/items" },
    "complete": { "href": "http://localhost:8080/api/shopping/lists/42/status" }
  }
}
```

## API Summary

| Domain | Base Path | Access Level | Description |
| :--- | :--- | :--- | :--- |
| User Profiles | `/api/user` | All Users | User profile and preference management |
| Settings | `/api/settings` | Adults Only | Age groups and family roles configuration |
| Shopping | `/api/shopping` | All Users | Lists, items, stores, loyalty cards, and coupons |
| Recipes | `/api/recipes` | All Users | Recipe CRUD, photos, ingredients, steps, comments, ratings, labels |
| Meals | `/api/meals` | All Users | Meal times, meal plans, entries, votes, export |
| Notifications | `/api/notifications` | All Users | Notification list, mark read, unread count |
| Messages | `/api/messages` | All Users | Conversations, send, mark read |
| Media | `/api/images` | All Users | Centralized photo upload and retrieval |
| Nutrients | `/api/recipes/nutrients` | Adults Only (write) | Nutrient master catalog management |

## Pagination

!!! note "[:octicons-rocket-24: NFR-2: Performance (Latency)](../../../requirements/shared.md#nfr-2)"

    **Target:** 95% of requests < 150ms. Core CRUD operations MUST be highly optimized.

List endpoints support Spring Data's pagination and sorting via query parameters:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page`    | `0`     | The page number to retrieve (0-indexed). |
| `size`    | `20`    | Number of records per page. |
| `sort`    | -       | Format: `field,asc|desc` (e.g., `name,asc`). |
