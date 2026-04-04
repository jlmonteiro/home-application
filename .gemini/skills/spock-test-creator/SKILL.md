---
name: spock-test-creator
description: >
  Generates Spock (Groovy) tests following project-specific BDD patterns.
  Enforces @Title, @Narrative, AAA pattern (given/when/then), and Spring injection
  over mocking. Ensures tests are transactional and use Testcontainers via BaseIntegrationTest.
---

# Spock Test Creation Guide

## Core Principles

1.  **Framework:** Spock 2.4 (Groovy 5).
2.  **Style:** BDD (Behavior Driven Development) with `given:`, `when:`, `then:` blocks.
3.  **Base Class:** Always extend `com.jorgemonteiro.home_app.test.BaseIntegrationTest`.
4.  **Injection:** Prefer `@Autowired` real beans over mocks. Use Mockito ONLY if external systems are involved.
5.  **State:** Tests are `@Transactional` (auto-rollback). Use `@Sql` for data setup.

## Required Metadata

Every Spec MUST have:
- `@Title("Component Name")`: The class or feature being tested.
- `@Narrative(""" ... """)`: User story format (As a... I want... So that...).
- `@SpringBootTest`, `@ActiveProfiles("test")`, `@Transactional`.

## Block Descriptions

- **given:** Describe the state (e.g., `given: "an existing user in the database"`).
- **when:** Describe the action (e.g., `when: "getting user profile by ID"`).
- **then:** Describe the expectation (e.g., `then: "user profile DTO is returned"`).
- **and:** Use `and:` to break up long blocks or add secondary conditions.

## Implementation Details

### Service Tests
- Inject the service under test.
- Use `with(result) { ... }` for multi-field assertions.
- Use idiomatic Groovy property access (no `.getXXX()`).
- Name local variables as `expectedId`, `targetEmail` to avoid `with` closure collisions.

### Controller Tests (MockMvc)
- Use `@AutoConfigureMockMvc` and inject `MockMvc`.
- Use static imports: `get`, `put`, `post`, `status`, `content`, `jsonPath`, `containsString`, `HAL_JSON_VALUE`.
- **Assertion Organization:** For complex REST responses (like HATEOAS or Pagination), strictly organize assertions using `and:` blocks to improve readability:
  - `then:` for Status and Content-Type.
  - `and:` for core Payload/Body data.
  - `and:` for Hypermedia Links (`_links`).
  - `and:` for Metadata (like `page` sizing).
- **Data Validation:** Assert actual values (e.g., `.value("John")`) rather than just checking existence (`.exists()`), especially when verifying data loaded via `@Sql`.

### Data Setup
- Store SQL scripts in `src/test/resources/scripts/sql/`.
- Use `@Sql("/scripts/sql/your-data.sql")`.
- When possible, query repositories or `id` from DB instead of hardcoding IDs.

## Templates

### Service Example Template

```groovy
@Title("MyService")
@Narrative("""
As a...
I want...
So that...
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MyServiceSpec extends BaseIntegrationTest {

    @Autowired
    MyService myService

    @Autowired
    UserRepository userRepository

    @Sql("/scripts/sql/test-data.sql")
    def "should perform action successfully"() {
        given: "an existing record"
            def expectedId = userRepository.findByEmail("test@example.com").get().id

        when: "performing the action"
            def result = myService.doSomething(expectedId)

        then: "result is correct"
            result != null
            with(result) {
                id == expectedId
                // other assertions
            }
    }
}
```

### Controller Example Template

```groovy
@Title("MyController")
@Narrative("""
As a...
I want...
So that...
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@AutoConfigureMockMvc
class MyControllerSpec extends BaseIntegrationTest {

    @Autowired 
    MockMvc mockMvc

    @Sql("/scripts/sql/test-data.sql")
    def "should return complex paginated response"() {
        when: "requesting the resource collection"
            def response = mockMvc.perform(get("/api/resource"))

        then: "status and headers are correct"
            response.andExpect(status().isOk())
                    .andExpect(content().contentType(HAL_JSON_VALUE))

        and: "the payload contains the correct data"
            response.andExpect(jsonPath('$._embedded.resources[0].name').value("Expected Name"))

        and: "hypermedia links are generated"
            response.andExpect(jsonPath('$._links.self.href').value(containsString("/api/resource")))
            
        and: "pagination metadata is accurate"
            response.andExpect(jsonPath('$.page.totalElements').value(1))
    }
}
```
