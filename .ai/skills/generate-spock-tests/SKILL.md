---
name: "generate-spock-tests"
description: "Generate Spock test classes for existing Java source code. Analyzes the target class and generates appropriate tests following team guidelines: integration tests with real services, MockMvc for controllers, Testcontainers for infrastructure, and mocks only for external dependencies. Use when user asks to generate tests, write tests, create test class, add tests, or test a class."
---

# Generate Spock Tests

Analyze a Java class and generate a Spock test class following team testing guidelines.

## Step 1: Identify the Target Class

Ask the user which class to test, or accept a file path. Read the source file to understand:
- Class type (controller, service, repository, utility)
- Dependencies (injected services, repositories)
- Public methods and their signatures
- Return types and exceptions thrown

## Step 2: Determine Test Type and Base Class

### Check for existing base spec

Before generating, search the project for existing abstract base test classes:

```bash
find . -path '*/test/groovy/*' \( -name '*Base*Spec.groovy' -o -name '*Abstract*Spec.groovy' \) | head -10
```

If a base spec exists, read it to understand which containers and configuration it provides. **Always extend the project's existing base spec** instead of creating a new one.

### If no base spec exists, determine what's needed

Analyze the target class's dependency chain to identify required infrastructure:

| Infrastructure         | When needed                                            | Container                             |
|------------------------|--------------------------------------------------------|---------------------------------------|
| PostgreSQL/TimescaleDB | JPA repositories, JDBC, Liquibase                      | `PostgreSQLContainer`                 |
| Kafka                  | `@KafkaListener`, `KafkaTemplate`, producers/consumers | `KafkaContainer`                      |
| Redis                  | `RedisTemplate`, `@Cacheable` with Redis               | `GenericContainer("redis")`           |
| Loki/HTTP services     | HTTP clients to external services                      | `GenericContainer` with exposed ports |

### Create base spec if needed

If no base spec exists and the test requires containers, create an abstract base spec with:

1. `@Testcontainers` and `@SpringBootTest` annotations
2. Static containers started in `static {}` block (shared across all tests)
3. `@DynamicPropertySource` to wire container ports/URLs into Spring config
4. Shared `Network` if containers need to communicate
5. `cleanup()` method for resetting state between tests

Example pattern with multiple containers:

```groovy
@Testcontainers
@SpringBootTest(classes = Application)
abstract class BaseIntegrationSpec extends Specification {

    static final Network network = Network.newNetwork()

    @Shared
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
            .withNetwork(network)
            .withDatabaseName("testdb")

    @Shared
    static KafkaContainer kafka = new KafkaContainer()
            .withNetwork(network)
            .withNetworkAliases("kafka")

    static {
        postgres.start()
        kafka.start()
    }

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl)
        registry.add("spring.datasource.username", postgres::getUsername)
        registry.add("spring.datasource.password", postgres::getPassword)
        registry.add("kafka.bootstrap-servers", kafka::getBootstrapServers)
    }
}
```

### Test type selection

| Class Type           | Test Pattern                        | Base Class          | Key Annotations                             |
|----------------------|-------------------------------------|---------------------|---------------------------------------------|
| REST Controller      | MockMvc integration test            | Project's base spec | `@AutoConfigureMockMvc` added to test class |
| Service (with infra) | Integration test with real services | Project's base spec | `@Transactional` if DB involved             |
| Service (no infra)   | Integration test                    | `Specification`     | `@SpringBootTest`                           |
| Repository           | Database test                       | Project's base spec | `@Transactional`                            |
| Utility/Helper       | Plain unit test                     | `Specification`     | None                                        |

## Step 3: Classify Dependencies

For each injected dependency in the target class:

- **Internal service/repository** → `@Autowired` (use real bean)
- **External API/gateway** → `@MockitoBean` or `@MockitoSpyBean` (mock it)
- **No dependencies** → plain Spock `Specification`

> ⚠️ **Critical rule**: Only mock external boundaries (third-party APIs, external gateways, email services). Use real Spring beans for all internal services and repositories.

## Step 4: Generate Test Class

### File location
Mirror the source package structure:
```
src/main/java/com/example/service/UserService.java
→ src/test/groovy/com/example/tests/service/UserServiceSpec.groovy
```

### Test class structure

1. **Package and imports** — match source package, add Spock/Spring imports
2. **Class declaration** — extend the base spec identified in Step 2
3. **Dependencies** — `@Autowired` for real beans, `@MockitoBean` for external only
4. **`setup()`** — clean database state if applicable
5. **Test methods** — one per public method, covering:
   - Happy path with real services
   - Validation/error cases
   - Edge cases (null input, empty collections, boundary values)
   - Data-driven tests with `where:` blocks for multiple inputs

### Test method conventions

- Use Given-When-Then structure with descriptive labels
- Name: `"should <expected behavior> when <condition>"`
- Use `@Unroll` with `where:` blocks for parameterized tests
- Verify database state after mutations (not just return values)
- For controllers: validate HTTP status, JSON response structure, and database side effects

## Step 5: Generate Mock Stubs (external deps only)

For each `@MockitoBean` dependency, generate:
- Happy path stub: `Mockito.when(...).thenReturn(...)`
- Failure stub: `Mockito.doThrow(...).when(...)`
- Verification: `Mockito.verify(...)` after the action

Use `Mockito` syntax (not Spock interaction syntax) for `@MockitoBean` fields.

## Step 6: Generate Data-Driven Tests

For methods with validation logic or multiple input scenarios, generate `where:` blocks:

```groovy
@Unroll
def "should validate email: #email → #expected"() {
    expect:
        service.isValidEmail(email) == expected

    where:
        email                    | expected
        "valid@example.com"      | true
        "invalid"                | false
        ""                       | false
        null                     | false
}
```

## Step 7: Review with User

Present the generated test class and ask:
- Are there additional edge cases to cover?
- Should any internal dependency be mocked instead (e.g., for specific failure simulation)?
- Are there `@Sql` scripts needed for test data setup?

## Rules

- **Never mock internal services for happy path tests** — use real beans
- **Always use `@MockitoBean`/`@MockitoSpyBean`** for Spring context mocks, never `Mockito.mock()` or `Mock()`
- **Always use Mockito verification syntax** (`Mockito.verify(...)`) with `@MockitoBean`, not Spock interaction syntax (`1 * service.method()`)
- **Always extend the project's existing base spec** if one exists — never create a duplicate
- **Create a new base spec** only when the project has none and containers are needed
- **Use shared `Network`** when multiple containers need to communicate
- **Clean state in `setup()`/`cleanup()`** — reset databases, consumers, circuit breakers as needed
- **Use `@Transactional`** for database tests to ensure rollback
- **Always indent code inside given/when/then/and/expect/where blocks** — one level of indentation relative to the block label
- **Every given/when/then/and block must have a description string** — e.g., `given: "a valid user request"`
- **Break large blocks with `and:`** — each `and:` block should describe a single logical step; avoid putting more than 3-5 lines in a single block
- **Add `@Narrative` and `@Title` annotations** to every test class:
  ```groovy
  @Title("User Service")
  @Narrative("Tests for user creation, validation, and retrieval")
  class UserServiceSpec extends BaseIntegrationSpec {
  ```
- **File naming**: `*Spec.groovy` in `src/test/groovy/`
