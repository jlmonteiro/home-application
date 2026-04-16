# Spock Tests Guidelines

## Overview

This document defines the standards and patterns for writing **Spock Framework** tests in the Home Application backend. All tests are written in **Groovy** and follow BDD (Behavior-Driven Development) conventions to produce expressive, readable specifications.

---

## 1. Test Structure & Annotations

### Title and Narrative
Every spec class MUST include `@Title` and `@Narrative` annotations.

!!! success "Best Practices"
    - :material-check-all: `@Title` — short, descriptive name of the component or feature.
    - :material-check-all: `@Narrative` — user story format: *As a... I want... So that...*

```groovy
@Title("User Profile Service")
@Narrative("""
As a user
I want to retrieve and update my profile information
So that my account details are always accurate and up to date
""")
class UserProfileServiceSpec extends BaseIntegrationTest {
```

### @Subject Annotation
Mark the primary bean under test with `@Subject` to distinguish it from supporting dependencies.

```groovy
@Autowired
@Subject
ShoppingCatalogService shoppingCatalogService

@Autowired
ShoppingCategoryRepository categoryRepository  // supporting dependency
```

### Block Descriptions
`given`, `when`, `then`, and `and` blocks MUST always contain a descriptive label. Code inside blocks must be indented.

!!! tip "Readable Specs"
    Avoid long monolithic blocks. Split `then` into logical `and` blocks with clear descriptions.

```groovy
def "GET /api/user should return paginated list of profiles"() {
    when: "requesting all user profiles"
        def response = mockMvc.perform(get("/api/user"))

    then: "response status and content type are correct"
        response.andExpect(status().isOk())
                .andExpect(content().contentType(HAL_JSON_VALUE))

    and: "the list contains the expected users"
        response.andExpect(jsonPath('$._embedded.userProfiles').isArray())
                .andExpect(jsonPath('$._embedded.userProfiles.length()').value(2))

    and: "pagination metadata is correct"
        response.andExpect(jsonPath('$.page.totalElements').value(2))
}
```

### Method Naming
Test method names should read as natural language specifications.

| Pattern | Example |
| :------ | :------ |
| Positive case | `"should return user profile when user exists"` |
| Negative case | `"should throw ObjectNotFoundException when user does not exist"` |
| API endpoint | `"GET /api/user should return paginated list of profiles"` |
| Conditional | `"should default to Adult if birthdate is null"` |
| Security | `"should deny access to Child for retrieving age groups"` |

---

## 2. Test Infrastructure

### Base Integration Test
All integration tests extend `BaseIntegrationTest`, which provides a shared **Testcontainers** PostgreSQL 17 instance.

```groovy
@Testcontainers
abstract class BaseIntegrationTest extends Specification {

    @Container
    @ServiceConnection
    @Shared
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
            .withDatabaseName("mydatabase")
            .withUsername("myuser")
            .withPassword("secret")
}
```

!!! warning "Never Override the Container"
    The `@Shared` static container is reused across all specs in the test suite. Do not create additional PostgreSQL containers in individual specs.

### Standard Annotation Stacks

=== "API Tests"

    ```groovy
    @SpringBootTest
    @ActiveProfiles("test")
    @Transactional
    @AutoConfigureMockMvc
    class UserProfileControllerSpec extends BaseIntegrationTest {

        @Autowired
        MockMvc mockMvc
    }
    ```

=== "Service Tests"

    ```groovy
    @SpringBootTest
    @ActiveProfiles("test")
    @Transactional
    class UserProfileServiceSpec extends BaseIntegrationTest {

        @Autowired
        @Subject
        UserProfileService userProfileService
    }
    ```

=== "WireMock Tests"

    ```groovy
    @SpringBootTest(properties = [
        "spring.cloud.openfeign.client.config.google-people-api.url=http://localhost:8089"
    ])
    @ActiveProfiles("test")
    class GooglePeopleServiceSpec extends BaseIntegrationTest {

        @Shared
        WireMockServer wireMockServer = new WireMockServer(wireMockConfig().port(8089))

        def setupSpec() { wireMockServer.start() }
        def cleanupSpec() { wireMockServer.stop() }
        def setup() { wireMockServer.resetAll() }
    }
    ```

!!! info "Test Security Configuration"
    A dedicated `TestSecurityConfig` (`@Profile("test")`) disables CSRF and permits most requests, allowing API tests to run without full OAuth2 setup. Do not recreate this — it already exists at `config/TestSecurityConfig.groovy`.

---

## 3. Transaction & Data Management

!!! success "Best Practices"
    - :material-check-all: Use `@Transactional` on the spec class — each test runs in a transaction that is rolled back automatically.
    - :material-check-all: Use `@Sql` to load test data from SQL scripts.
    - :material-alert-circle: AVOID `cleanup` blocks for data teardown — `@Transactional` rollback handles this.

### SQL Test Data
Use `@Sql` on individual test methods to seed data. Scripts live in `src/test/resources/scripts/sql/`.

```groovy
@Sql("/scripts/sql/user-profile-test-data.sql")
def "GET /api/user should return paginated list of profiles"() {
```

!!! info "Script Naming Convention"
    Name scripts after the feature they support: `<feature>-test-data.sql` (e.g., `user-profile-test-data.sql`, `pagination-test-data.sql`).

---

## 4. Mocking Strategy

Avoid mocking as much as possible. Use `@Autowired` to inject real Spring-managed beans backed by Testcontainers.

!!! tip "When to Mock"
    Only mock when the real component is **impractical** to use in tests:

    - :material-check-all: **External HTTP APIs** — use WireMock to simulate third-party services.
    - :material-check-all: **Side effects** — use `@MockitoBean` for services with irreversible side effects.
    - :material-alert-circle: AVOID mocking repositories, services, or adapters that can run against Testcontainers.

### WireMock for External APIs

```groovy
wireMockServer.stubFor(get(urlPathEqualTo("/people/me"))
        .withHeader("Authorization", equalTo("Bearer " + token))
        .willReturn(aResponse()
                .withHeader("Content-Type", "application/json")
                .withBody("""{ "birthdays": [{ "date": { "year": 1990, "month": 5, "day": 15 } }] }""")))
```

### @MockitoBean for Side Effects

```groovy
@MockitoBean
PhotoService photoService

// In test:
when(photoService.downloadAndConvertToBase64(pictureUrl)).thenReturn("base64-mock-data")
```

---

## 5. Data-Driven Testing

Use `where` blocks with table notation for parameterized tests. Combine with `@Unroll` to generate individual test reports per data row.

!!! success "Best Practices"
    - :material-check-all: Use `@Unroll` with `#variable` placeholders in the method name.
    - :material-check-all: Use table notation in `where` blocks for readability.
    - :material-check-all: Add a descriptive label to the `where:` block.

```groovy
@Unroll
def "should classify user correctly based on age: #ageYears years old"() {
    given: "a birthdate calculated from age"
        def birthdate = LocalDate.now().minusYears(ageYears)

    when: "classifying the birthdate"
        def result = ageClassificationService.classify(birthdate)

    then: "the correct age group is returned"
        result == expectedGroup

    where: "various ages and their expected groups"
        ageYears | expectedGroup
        5        | "Child"
        13       | "Teenager"
        18       | "Adult"
}
```

### Validation Testing

```groovy
def "PUT /api/user/{id} should return 400 when #field is #scenario"() {
    given: "an update request with #scenario"
        def requestBody = validUpdateRequestBody() + [(field): value]

    when: "updating user profile with invalid data"
        def response = mockMvc.perform(put("/api/user/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(JsonOutput.toJson(requestBody)))

    then: "400 ProblemDetail is returned with specific field error"
        response.andExpect(status().isBadRequest())
                .andExpect(jsonPath("\$.errors.${field}").value(message))

    where:
        field       | scenario          | value          | message
        "email"     | "missing"         | null           | "Email is required"
        "email"     | "invalid format"  | "not-an-email" | "Email must be valid"
        "firstName" | "too long"        | "a" * 51       | "First name must not exceed 50 characters"
}
```

---

## 6. Security Testing

### OAuth2 Authentication
Use `oauth2Login()` to simulate authenticated users with specific attributes.

```groovy
given: "an authenticated user session"
    def auth = oauth2Login().attributes { it.put("email", "user@example.com") }

when: "requesting the 'me' endpoint"
    def response = mockMvc.perform(get("/api/user/me").with(auth))
```

### Role-Based Access Control
Use `user().roles()` to test `@PreAuthorize` restrictions. Always test both positive and negative cases.

```groovy
def "should allow Adult to retrieve age groups"() {
    when: "an Adult user requests age groups"
        def response = mockMvc.perform(get("/api/settings/age-groups")
                .with(user("adult").roles("ADULT")))

    then: "access is granted"
        response.andExpect(status().isOk())
}

def "should deny access to Child for retrieving age groups"() {
    when: "a Child user requests age groups"
        def response = mockMvc.perform(get("/api/settings/age-groups")
                .with(user("child").roles("CHILD")))

    then: "access is forbidden"
        response.andExpect(status().isForbidden())
}
```

---

## 7. Assertion Patterns

### `with` Block (Fail-Fast)
Use `with` for asserting multiple properties on a single object. Stops at the first failure.

```groovy
then: "user profile is returned with correct data"
    result.isPresent()
    with(result.get()) {
        email == "user@example.com"
        firstName == "John"
        photo == "photo.jpg"
    }
```

### `verifyAll` Block (Soft Assertions)
Use `verifyAll` when you want to see **all** failures at once rather than stopping at the first one. Ideal for adapter tests and data mapping verification.

```groovy
then: "DTO is correctly populated"
    verifyAll(result) {
        email == "user@example.com"
        firstName == "John"
        photo == "photo.jpg"
    }
```

!!! tip "When to Use Each"
    - **`with`** — default choice for most assertions. Fail-fast is useful during debugging.
    - **`verifyAll`** — prefer when checking many independent fields (e.g., adapter/mapper tests) where seeing all mismatches at once saves time.

### `expect` Block
Use `expect` for simple, single-expression tests that have no setup or stimulus.

```groovy
def "toDTO should return null when user is null"() {
    expect: "null input returns null"
        UserProfileAdapter.toDTO(null) == null
}
```

### Exception Assertions
Use `thrown()` to verify expected exceptions.

```groovy
when: "updating non-existent user"
    userProfileService.updateUserProfile(dto)

then: "ObjectNotFoundException is thrown"
    thrown(ObjectNotFoundException)
```

### MockMvc + JsonPath
Use `jsonPath` for API response assertions. Always verify status, content type, and body.

```groovy
then: "200 OK with HAL JSON is returned"
    response.andExpect(status().isOk())
            .andExpect(content().contentType(HAL_JSON_VALUE))

and: "HATEOAS links are present"
    response.andExpect(jsonPath('$._links.self.href').value(containsString("/api/user/${id}")))
```

---

## 8. Helper Methods

Extract reusable test data builders as `private` methods at the bottom of the spec class.

```groovy
private Map validUpdateRequestBody() {
    [
        email: "valid@example.com",
        firstName: "John",
        lastName: "Doe",
        enabled: true
    ]
}
```

!!! tip "Groovy Map Syntax"
    Use Groovy's map literal syntax for building request bodies — it's concise and converts cleanly to JSON via `JsonOutput.toJson()`.

---

## AI Alignment

!!! info "Directives for AI Agents"
    - :material-gavel: ALWAYS include `@Title` and `@Narrative` annotations on every spec class.
    - :material-gavel: ALWAYS add descriptive labels to `given`, `when`, `then`, and `and` blocks.
    - :material-gavel: ALWAYS extend `BaseIntegrationTest` for integration tests.
    - :material-gavel: ALWAYS use `@Subject` on the primary bean under test.
    - :material-gavel: ALWAYS use `@Transactional` for automatic rollback — never use `cleanup` blocks for data teardown.
    - :material-gavel: ALWAYS use `@Sql` scripts for test data seeding, placed in `src/test/resources/scripts/sql/`.
    - :material-gavel: PREFER real injected components over mocks. Only mock external APIs (WireMock) or side-effect services (`@MockitoBean`).
    - :material-gavel: USE `@Unroll` with `where` blocks for data-driven tests.
    - :material-gavel: USE `with` for fail-fast assertions, `verifyAll` for soft assertions on many fields.
    - :material-gavel: USE `expect` for simple single-expression tests with no setup.
    - :material-gavel: USE `oauth2Login()` for authenticated API tests and `user().roles()` for RBAC tests.
    - :material-gavel: SPLIT long `then` blocks into logical `and` blocks with clear descriptions.
