# Gradle Build Rules

## Multi-Module Structure
- Root project manages common configuration
- Each module has its own `build.gradle.kts`
- Use version catalog (`gradle/libs.versions.toml`) for dependencies
- Shared configurations in root `build.gradle.kts`

## Dependency Management
- All versions defined in `libs.versions.toml`
- Use bundles for related dependencies
- Prefer `implementation` over `compile`
- Use `testImplementation` for test dependencies
- Keep runtime dependencies minimal

## Build Tasks
- Always run `./gradlew clean build` before commits
- Use `./gradlew test` for running tests
- Use `./gradlew :module:task` for module-specific tasks
- Enable parallel builds with `org.gradle.parallel=true`

## Code Quality
- Enable Gradle build cache
- Use Gradle wrapper (never install Gradle globally)
- Keep build scripts in Kotlin DSL (`.gradle.kts`)
- Document custom tasks and configurations
