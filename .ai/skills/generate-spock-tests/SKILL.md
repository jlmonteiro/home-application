---
name: "generate-spock-tests"
description: "Generate Spock test classes for existing Java source code. Analyzes the target class and generates appropriate tests following team guidelines: integration tests with real services, MockMvc for controllers, Testcontainers for infrastructure, and mocks only for external dependencies. Use when user asks to generate tests, write tests, create test class, add tests, or test a class."
---

# Generate Spock Tests

Analyze a Java class and generate a Spock test class following team testing guidelines.

## Step 1: Identify the Target Class

Analyze the target class (controller, service, repository, utility) to understand:
- Dependencies (real beans vs. external services)
- Public methods, return types, and exceptions
- Business rules and validation logic

## Step 2: Determine Test Type and Base Class

### Base Integration Test
All integration tests MUST extend `BaseIntegrationTest`. It provides the shared PostgreSQL 17 Testcontainer. Do not create additional containers.

### Annotation Stacks

| Test Type | Base Class | Annotations |
| :--- | :--- | :--- |
| **API Controller** | `BaseIntegrationTest` | `@SpringBootTest`, `@ActiveProfiles("test")`, `@Transactional`, `@AutoConfigureMockMvc` |
| **Service/Repo** | `BaseIntegrationTest` | `@SpringBootTest`, `@ActiveProfiles("test")`, `@Transactional` |
| **Utility** | `Specification` | (None) |

## Step 3: Classify Dependencies

- **Internal logic/persistence** → `@Autowired` (use real beans).
- **External HTTP APIs / Side Effects** → `@MockitoBean` (mock these).
- **Subject Under Test** → Mark with `@Subject`.

```groovy
@Autowired
@Subject
UserProfileService userProfileService

@MockitoBean
PhotoService photoService // External side effect
```

## Step 4: Test Class Structure

### Title and Narrative
Every spec class MUST include `@Title` and `@Narrative` in User Story format.

```groovy
@Title("User Profile Service")
@Narrative("""
As a user
I want to manage my profile
So that my information is always accurate
""")
class UserProfileServiceSpec extends BaseIntegrationTest {
```

### Block Roles & Indentation
- **`given:`** Setup state/data. **NEVER** include assertions here.
- **`when:`** Execute the action being tested (stimulus).
- **`then:`** Assert results.
- **`and:`** Extend the previous block (more setup or more assertions).
- **Indentation:** Code inside blocks MUST be indented.

## Step 5: Data Management

- **Seeding:** Use `@Sql("/scripts/sql/<feature>-test-data.sql")` on methods for complex data.
- **Cleanup:** AVOID manual `cleanup:` blocks. `@Transactional` handles rollbacks automatically.

## Step 6: Assertion Patterns

- **`with` (Fail-Fast):** Use for standard object property checks.
- **`verifyAll` (Soft):** Use for Adapters/Mappers or checking many independent fields at once.
- **Exception Assertions:** Use `thrown(ExceptionClass)`.

### Deep API Validation (MockMvc)
Do NOT just check status codes or `exists()`. Thoroughly validate JSON payloads.

```groovy
then: "200 OK with correct payload is returned"
    response.andExpect(status().isOk())
            .andExpect(jsonPath('$.email').value("user@example.com"))
            .andExpect(jsonPath('$.firstName').value("John"))
            .andExpect(jsonPath('$._links.self.href').exists())
```

## Step 7: Data-Driven Testing

Use `@Unroll` with `#variable` placeholders in the method name and table notation in `where:`.

```groovy
@Unroll
def "should classify age #age as #group"() {
    expect: "classification is correct"
        service.classify(age) == group

    where: "age mapping"
        age | group
        5   | "Child"
        18  | "Adult"
}
```

## Rules

- **Mirror package structure:** `src/test/groovy/` must match `src/main/java/`.
- **Method naming:** Use natural language: `"should return 404 when user is missing"`.
- **Mockito Syntax:** Use `Mockito.when(...)` for `@MockitoBean`, not Spock interaction syntax.
- **No monoliths:** Split long `then:` blocks into multiple `and:` blocks with clear descriptions.
- **HAL JSON:** Always verify HATEOAS links for REST resources.
