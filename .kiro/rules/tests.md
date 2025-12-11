# Testing

- This project uses Spock with spring boot tests as frameworks.
- Tests follow the AAA (Arrange, Act, Assert) pattern.
- Tests follow BDD pattern with clearly defined scenarios and steps.
- Integration tests are also included to ensure rule interactions.

- Focus on achieving high branch coverage

## Mocks

- Use Mockito for mocks instead of spock built-in mock
- Prefer to use spring injected dependencies over mocks

## Data

- When database data is required for testing, create the appropriate scripts at `src/resources/scripts/sql`
- Use the @Sql annotation to load the scripts before tests
- Tests should be transactional to guarantee rollback after completion and keep data consistent

## REST tests

- Use spring mockmvc to test REST APIs.
- Integration functionality should be tested through their respective services.
- REST tests should focus on request/response validation, status codes, and error handling.
