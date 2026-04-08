---
name: spock-test-creator
description: >
  Generates Spock (Groovy) tests following project-specific BDD patterns.
  Enforces @Title, @Narrative, AAA pattern (given/when/then), and Spring injection
  over mocking. Ensures tests are transactional and use Testcontainers via BaseIntegrationTest.
  Mandates Data-Driven Testing (where: blocks) for repetitive scenarios.
---

# Spock Test Creation Guide

## Core Principles

1.  **Framework:** Spock 2.4 (Groovy 5).
2.  **Style:** BDD (Behavior Driven Development) with `given:`, `when:`, `then:` blocks.
3.  **Base Class:** Always extend `com.jorgemonteiro.home_app.test.BaseIntegrationTest` for integration tests.
4.  **Injection:** Prefer `@Autowired` real beans over mocks. Use Mockito ONLY if external systems are involved in `@SpringBootTest` environments.
5.  **State:** Tests are `@Transactional` (auto-rollback). Use `@Sql` for data setup.
6.  **The Iron Rule (Data-Driven Testing):** Writing 3+ similar tests? You **MUST** use a `where:` block. No exceptions.

## Required Metadata

Every Spec MUST have:
- `@Title("Component Name")`: The class or feature being tested.
- `@Narrative(""" ... """)`: User story format (As a... I want... So that...).
- `@SpringBootTest`, `@ActiveProfiles("test")`, `@Transactional` (for integration tests).

## Block Descriptions

- **given:** Describe the state (e.g., `given: "an existing user in the database"`).
- **when:** Describe the action (e.g., `when: "getting user profile by ID"`).
- **then:** Describe the expectation (e.g., `then: "user profile DTO is returned"`).
- **expect:** Use for single-line assertions, especially in `where:` blocks.
- **and:** Use `and:` to break up long blocks or add secondary conditions.
- **where:** Mandatory for parameterizing tests with different inputs/outputs.

## Implementation Details

### Data-Driven Testing (DDT)
**Red Flags - STOP and Use `where:` Block if:**
- "I'm writing my 3rd test with the same structure."
- "I just need to change the input value."
- "Copy-paste-modify is fastest."

**Pattern:**
```groovy
def "should validate #email as #validity"() {
    expect: "the validator correctly identifies the email state"
        validator.isValid(email) == isValid

    where: "test cases for various email formats"
        email              | validity  | isValid
        "user@example.com" | "valid"   | true
        "invalid"          | "invalid" | false
}
```

### Mocking vs. Stubbing
- **Consistency Rule:** ALWAYS use Mockito for mocking and stubbing. DO NOT use Spock's native `Mock()` or `Stub()` syntax.
- **Tools:** Use `org.mockito.Mockito.*` static imports (`mock`, `when`, `verify`, `times`, `any`).
- **Integration Tests:** Use `@MockitoSpyBean` or `@MockBean` for Spring beans when external I/O (network, file system) must be avoided.
- **Unit Tests:** Use `mock(Class)` and standard Mockito flow:
  - **Stub (given:):** `when(repository.findById(1L)).thenReturn(Optional.of(user))`
  - **Mock (then:):** `verify(service, times(1)).save(any())`

### Controller Tests (MockMvc)
- Use `@AutoConfigureMockMvc` and inject `MockMvc`.
- **Assertion Organization:** For complex REST responses, strictly organize assertions using `and:` blocks:
  - `then:` for Status and Content-Type.
  - `and:` for core Payload/Body data.
  - `and:` for Hypermedia Links (`_links`).
  - `and:` for Metadata (like `page` sizing).
- **Data Validation:** Assert actual values (e.g., `.value("John")`) rather than just checking existence (`.exists()`).

## Templates

### Integration Test (Standard)
```groovy
@Title("MyService Integration")
@Narrative("""
As a user
I want to...
So that...
""")
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MyServiceSpec extends BaseIntegrationTest {

    @Autowired MyService myService
    @Autowired UserRepository userRepository

    @Sql("/scripts/sql/test-data.sql")
    def "should perform action successfully"() {
        given: "an existing record"
            def targetEmail = "test@example.com"
            def expectedId = userRepository.findByEmail(targetEmail).get().id

        when: "performing the action"
            def result = myService.doSomething(expectedId)

        then: "result is correct"
            result != null
            with(result) {
                id == expectedId
                email == targetEmail
            }
    }
}
```

### Data-Driven Unit Test
```groovy
@Title("Validator Unit Test")
@Narrative(""" ... """)
class MyValidatorSpec extends Specification {

    def "should reject invalid email: #reason"() {
        given: "a mock collaborator and validator instance"
            def collaborator = mock(Collaborator.class)
            def validator = new MyValidator(collaborator)
            when(collaborator.isBlacklisted(any())).thenReturn(false)

        expect: "invalid emails are rejected"
            validator.isValid(email) == false

        where: "various invalid inputs"
            email            | reason
            null             | "null"
            ""               | "empty"
            "no-at-sign"     | "missing @"
            "a" * 255 + "@x" | "too long"
    }
}
```
