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

### Controller Tests
- Use `@AutoConfigureMockMvc`.
- Inject `MockMvc`.
- Use `mockMvc.perform(...)` with static imports for `get`, `put`, `post`, `status`, `jsonPath`.
- Verify JSON structure and HTTP status codes.

### Data Setup
- Store SQL scripts in `src/test/resources/scripts/sql/`.
- Use `@Sql("/scripts/sql/your-data.sql")`.
- When possible, query `UserRepository` or `id` from DB instead of hardcoding IDs.

## Example Template

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
