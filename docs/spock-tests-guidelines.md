# Spock Tests Guidelines

- given/when/then blocks should always contain a good description.
- code inside given/then/when blocks should be idented
- use title and narrative annotations
- avoid mocking as much as possible, prefer to use injected components
- avoid long blocks. split then into logical `and` blocks with clear descriptions
- use transactional tests instead of cleanup blocks to clear data between tests
