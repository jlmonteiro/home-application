# Backend Code Review Report

**Module:** home-app-backend  
**Date:** 2026-04-18  
**Guidelines:** [Java Development Guidelines](docs/development/java-guidelines.md), [Spock Tests Guidelines](docs/development/spock-tests-guidelines.md)

---

## Controllers

### CTR-01 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeController.java`
- **Area:** Lines 38–39, method `listAllRecipes`
- **Problem:** Uses `java.util.List` as a fully qualified class name inline instead of importing it.
- **Guideline:** *"No FQDN class references — always import classes instead of using fully qualified names."*
- **Impact:** Violates clean code style rule marked as a MUST in the guidelines.
- **Fix:** Add `import java.util.List;` to the imports and replace `java.util.List<String>` with `List<String>` in the method signature. Apply the same fix to `java.util.List<Long>` on line 88 (`reorderSteps`).

### CTR-02 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeController.java`
- **Area:** Field `recipeAdapter`
- **Problem:** Injects `RecipeAdapter` via constructor but never references it in any method.
- **Guideline:** Clean code — no unused dependencies.
- **Impact:** Unnecessary bean wiring, misleading to readers.
- **Fix:** Remove the `private final RecipeAdapter recipeAdapter;` field.

### CTR-03 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeFeedbackController.java`
- **Area:** Entire class
- **Problem:** Controller contains business logic: user lookup via `UserRepository`, entity creation (`RecipeComment`, `RecipeRating`), ownership authorization check, and direct repository calls. Controllers should only delegate to services.
- **Guideline:** *"Services are the transactional boundary and the home for all business logic."* Controllers delegate to services.
- **Impact:** Violates layered architecture. Logic is untestable without MockMvc. Transaction boundaries are inconsistent.
- **Fix:** Extract all business logic into a new `RecipeFeedbackService` (or extend `RecipeService`). The controller should only call service methods and return results.

### CTR-04 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeFeedbackController.java`
- **Area:** Line 50 (`@org.springframework.transaction.annotation.Transactional`)
- **Problem:** Uses fully qualified annotation `@org.springframework.transaction.annotation.Transactional` inline instead of importing.
- **Guideline:** *"No FQDN class references."*
- **Impact:** Violates clean code MUST rule.
- **Fix:** Add `import org.springframework.transaction.annotation.Transactional;` and use `@Transactional`.

### CTR-05 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeFeedbackController.java`
- **Area:** Line 72 (`throw new com.jorgemonteiro.home_app.exception.AuthenticationException(...)`)
- **Problem:** Uses fully qualified class name for `AuthenticationException` inline.
- **Guideline:** *"No FQDN class references."*
- **Impact:** Violates clean code MUST rule.
- **Fix:** Add `import com.jorgemonteiro.home_app.exception.AuthenticationException;` and use the short name.

### CTR-06 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeFeedbackController.java`
- **Area:** Injected fields
- **Problem:** Injects four repositories directly (`RecipeRepository`, `RecipeCommentRepository`, `RecipeRatingRepository`, `UserRepository`) instead of delegating to a service layer.
- **Guideline:** Controllers use `@RequiredArgsConstructor` for dependency injection and delegate to services — not repositories.
- **Impact:** Bypasses the service/transactional layer. Business logic leaks into the controller.
- **Fix:** Remove repository injections. Delegate all data access to the new `RecipeFeedbackService`.

### CTR-07 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/RecipeFeedbackController.java`
- **Area:** Methods `getComments`, `addComment`, `getUserRating`, `rateRecipe`
- **Problem:** `@Transactional` is applied inconsistently at method level — only on `getComments` and `addComment`. `getUserRating` and `rateRecipe` have no transaction annotation.
- **Guideline:** Services use class-level `@Transactional`; controllers should not manage transactions.
- **Impact:** Inconsistent transaction boundaries; potential lazy-loading issues.
- **Fix:** Move all logic to a service class with class-level `@Transactional`. Remove method-level annotations from the controller.

### CTR-08 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/NutritionEntryController.java`
- **Area:** Entire class
- **Problem:** Controller contains business logic: entity lookups, upsert logic (find-or-create), entity field updates, and direct repository saves.
- **Guideline:** Controllers delegate to services. Services are the home for all business logic.
- **Impact:** Violates layered architecture. No transactional boundary on the controller.
- **Fix:** Create a `NutritionEntryService` and move all logic there. Controller should only call service methods.

### CTR-09 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/NutrientController.java`
- **Area:** Entire class
- **Problem:** Controller contains business logic: entity lookups, field updates, existence checks, and direct repository calls.
- **Guideline:** Controllers delegate to services.
- **Impact:** Violates layered architecture. No class-level `@Transactional`.
- **Fix:** Create a `NutrientService` or extend `RecipeService` with nutrient management methods. Controller should only delegate.

### CTR-10 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/NutrientController.java`
- **Area:** Class declaration
- **Problem:** Missing class-level Javadoc.
- **Guideline:** *"Class-level Javadoc is mandatory on all public classes (services, controllers, entities, adapters)."*
- **Impact:** Violates documentation standard.
- **Fix:** Add a Javadoc comment describing the controller's purpose.

### CTR-11 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/meals/MealPlanController.java`, `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/meals/MealTimeController.java`
- **Area:** All endpoint return types
- **Problem:** Return raw DTOs (`MealPlanDTO`, `MealTimeDTO`, `List<MealPlanExportItemDTO>`) and `ResponseEntity` wrappers instead of HATEOAS resources.
- **Guideline:** *"All controllers MUST return HATEOAS-compliant resources using HAL."* Use `RepresentationModelAssembler` and include `self` links.
- **Impact:** Inconsistent API contract. No hypermedia links for meal endpoints.
- **Fix:** Create `MealPlanResource`, `MealPlanResourceAssembler`, `MealTimeResource`, and `MealTimeResourceAssembler` following the existing pattern in `controller/recipes/resource/` and `controller/shopping/resource/`.

### CTR-12 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/notifications/NotificationController.java`
- **Area:** All endpoint return types
- **Problem:** Returns raw DTOs (`List<NotificationDTO>`, `List<MessageDTO>`, `long`) instead of HATEOAS resources.
- **Guideline:** *"All controllers MUST return HATEOAS-compliant resources."*
- **Impact:** No hypermedia links for notification endpoints.
- **Fix:** Create HATEOAS resource wrappers and assemblers for notifications and messages.

### CTR-13 · Info

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/media/ImageController.java`
- **Area:** `getImage()` method, null/empty data check
- **Problem:** Returns `new ResponseEntity<>(HttpStatus.NOT_FOUND)` directly instead of throwing `ObjectNotFoundException`.
- **Guideline:** *"Throw domain exceptions — never return null for missing entities."* The `GlobalExceptionHandler` maps `ObjectNotFoundException` to 404.
- **Impact:** Bypasses centralized error handling; response format differs from other 404s (no RFC 7807 body).
- **Fix:** Replace the `if` block with `throw new ObjectNotFoundException("Photo data is empty for: " + name)`.

### CTR-14 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/recipes/LabelController.java`
- **Area:** `searchLabels()` method
- **Problem:** Uses `Collectors.toList()` instead of `.toList()`.
- **Guideline:** Prefer modern Java features. `.toList()` (Java 16+) returns an unmodifiable list and is more concise.
- **Impact:** Minor inconsistency with other code in the project that uses `.toList()`.
- **Fix:** Replace `.collect(Collectors.toList())` with `.toList()`.

### CTR-15 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/profiles/UserProfileController.java`
- **Area:** `getAllUsers()` method, line 67
- **Problem:** Uses FQDN references: `java.util.List<UserDTO>` and calls `com.jorgemonteiro.home_app.model.adapter.profiles.UserAdapter` inline in the service layer (called from here).
- **Guideline:** *"No FQDN class references."*
- **Impact:** Violates clean code rule.
- **Fix:** Add `import java.util.List;` (if not already present for this usage) and ensure the return type uses the short name.

### CTR-16 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/profiles/UserProfileController.java`
- **Area:** Field `userProfileAdapter`
- **Problem:** Injects `UserProfileAdapter` but never uses it in any controller method.
- **Guideline:** Clean code — no unused dependencies.
- **Impact:** Unnecessary bean wiring.
- **Fix:** Remove the `private final UserProfileAdapter userProfileAdapter;` field.

### CTR-17 · Info

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/controller/shopping/StoreController.java`
- **Area:** `listStores()` method
- **Problem:** Manually constructs `PagedModel` with `PagedModel.PageMetadata` instead of using the injected `PagedResourcesAssembler`. Other controllers (e.g., `ShoppingController`, `RecipeController`) use `pagedResourcesAssembler.toModel()`.
- **Guideline:** Consistency across controllers.
- **Impact:** Inconsistent pagination implementation; manual metadata construction is error-prone.
- **Fix:** Replace manual construction with `pagedStoreAssembler.toModel(page, storeAssembler)`.

---

## Services

### SVC-01 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/shopping/ShoppingListService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Slf4j` annotation.
- **Guideline:** *"Add `@Slf4j` to every `@Service` class."* (ALWAYS rule)
- **Impact:** No logging capability in a core service.
- **Fix:** Add `@Slf4j` to the class.

### SVC-02 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/UserProfileService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Slf4j` annotation.
- **Guideline:** *"Add `@Slf4j` to every `@Service` class."*
- **Impact:** No logging capability.
- **Fix:** Add `@Slf4j` to the class.

### SVC-03 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/UserPreferenceService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Validated` annotation.
- **Guideline:** *"ALWAYS annotate services with `@Service`, `@RequiredArgsConstructor`, `@Transactional`, and `@Validated`."*
- **Impact:** Jakarta validation annotations on method parameters (`@Valid`) will not be triggered.
- **Fix:** Add `@Validated` to the class.

### SVC-04 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/UserPreferenceService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Slf4j` annotation.
- **Guideline:** *"Add `@Slf4j` to every `@Service` class."*
- **Impact:** No logging capability.
- **Fix:** Add `@Slf4j` to the class.

### SVC-05 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/UserPreferenceService.java`
- **Area:** Private method `toDTO(UserPreference)`
- **Problem:** Contains inline DTO conversion logic instead of using a dedicated adapter class.
- **Guideline:** *"Static adapter classes handle all conversions between JPA entities and DTOs. They live in `model/adapter/<schema>/`."*
- **Impact:** Conversion logic is not reusable and violates the adapter pattern.
- **Fix:** Create a `UserPreferenceAdapter` class in `model/adapter/profiles/` and move the conversion there.

### SVC-06 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/UserProfileService.java`
- **Area:** `listAllUsers()` method, line 56
- **Problem:** Uses four FQDN references inline: `java.util.List`, `com.jorgemonteiro.home_app.model.dtos.profiles.UserDTO`, `com.jorgemonteiro.home_app.model.adapter.profiles.UserAdapter`, `java.util.stream.Collectors`.
- **Guideline:** *"NEVER use fully qualified class names in code — always use imports."*
- **Impact:** Violates a NEVER rule. Severely harms readability.
- **Fix:** Add proper imports for `List`, `UserDTO`, `UserAdapter`, and `Collectors`. Rewrite the method using short class names.

### SVC-07 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/SettingsService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Validated` annotation.
- **Guideline:** *"ALWAYS annotate services with `@Validated`."*
- **Impact:** `@Valid` on method parameters will not trigger validation.
- **Fix:** Add `@Validated` to the class.

### SVC-08 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/SettingsService.java`
- **Area:** Private method `toRoleDTO(FamilyRole)`
- **Problem:** Contains inline DTO conversion instead of using an adapter.
- **Guideline:** *"Static adapter classes handle all conversions."*
- **Impact:** Conversion logic is not reusable.
- **Fix:** Move conversion to an adapter class (e.g., extend `UserProfileAdapter` or create a `SettingsAdapter`).

### SVC-09 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/SettingsService.java`
- **Area:** `recalculateAllAges()` method
- **Problem:** Calls `userProfileRepository.save(profile)` inside a `for` loop, issuing one SQL UPDATE per profile.
- **Guideline:** Performance best practice — batch writes.
- **Impact:** N+1 write problem. Slow for large households (though unlikely to be large, it's still bad practice).
- **Fix:** Collect updated profiles into a list and call `userProfileRepository.saveAll(profiles)` once after the loop.

### SVC-10 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/AgeClassificationService.java`
- **Area:** Class declaration
- **Problem:** Missing class-level `@Transactional` annotation. Only `loadConfigs()` has method-level `@Transactional(readOnly = true)`.
- **Guideline:** *"ALWAYS annotate services with `@Transactional`."*
- **Impact:** The `classify()` method runs without a transaction context.
- **Fix:** Add `@Transactional` at class level. Keep `@Transactional(readOnly = true)` on `loadConfigs()`.

### SVC-11 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/profiles/AgeClassificationService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Slf4j` and `@Validated` annotations.
- **Guideline:** *"ALWAYS annotate services with `@Validated`."* and *"Add `@Slf4j` to every `@Service` class."*
- **Impact:** Missing standard service annotations.
- **Fix:** Add `@Slf4j` and `@Validated` to the class.

### SVC-12 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/meals/MealReminderScheduler.java`
- **Area:** `sendMealReminders()` method
- **Problem:** Reads data from the database (meal plans, entries, schedules) but has no `@Transactional` annotation. Lazy-loaded collections may fail outside a transaction.
- **Guideline:** Read-only methods should use `@Transactional(readOnly = true)`.
- **Impact:** Potential `LazyInitializationException` at runtime.
- **Fix:** Add `@Transactional(readOnly = true)` to `sendMealReminders()`.

### SVC-13 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/shopping/ShoppingDataRetentionService.java`
- **Area:** Class declaration
- **Problem:** Missing `@Validated` annotation.
- **Guideline:** *"ALWAYS annotate services with `@Validated`."*
- **Impact:** Missing standard service annotation.
- **Fix:** Add `@Validated` to the class.

### SVC-14 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/notifications/NotificationService.java`
- **Area:** `getConversation()` method
- **Problem:** Annotated with `@Transactional(readOnly = true)` but the method body mutates data — it sets `m.setIsRead(true)` on message entities.
- **Guideline:** *"Mark read-only methods with `@Transactional(readOnly = true)`."* This method is NOT read-only.
- **Impact:** Depending on the JPA provider, the dirty changes may be silently discarded or cause unexpected behavior in a read-only transaction.
- **Fix:** Either remove `readOnly = true` (since the method writes), or split into two methods: one read-only for fetching and one writable for marking as read.

### SVC-15 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/recipes/RecipeService.java`
- **Area:** `syncPhotos()` method and `calculateNutritionTotals()` method
- **Problem:** Uses FQDN `java.util.UUID` (in `syncPhotos`) and `java.math.RoundingMode` (in `calculateNutritionTotals`).
- **Guideline:** *"NEVER use fully qualified class names in code."*
- **Impact:** Violates a NEVER rule.
- **Fix:** Add `import java.util.UUID;` and `import java.math.RoundingMode;` to the imports.

### SVC-16 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/meals/MealPlanService.java`
- **Area:** `exportToList()` method
- **Problem:** Uses FQDN `com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus.PENDING` inline.
- **Guideline:** *"NEVER use fully qualified class names."*
- **Impact:** Violates clean code rule.
- **Fix:** Add `import com.jorgemonteiro.home_app.model.entities.shopping.ShoppingListStatus;` and use `ShoppingListStatus.PENDING`.

### SVC-17 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/service/meals/MealPlanService.java`
- **Area:** Class declaration — 12 injected dependencies
- **Problem:** Class has 12 constructor-injected dependencies, indicating it handles too many responsibilities (plan CRUD, voting, notifications, export to shopping list).
- **Guideline:** *"No god classes. Break responsibilities into focused, well-named classes."*
- **Impact:** Hard to test, hard to maintain, high coupling.
- **Fix:** Extract export-related logic (`getExportPreview`, `exportToList`) into a new `MealPlanExportService`.

---

## Adapters

### ADP-01 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/recipes/RecipeAdapter.java`
- **Area:** Class design — mixed static and instance methods
- **Problem:** Guideline says adapters should use static methods and be stateless. This adapter is a `@Component` with injected `PhotoService` and uses instance methods for most conversions (`toDTO`, `toCommentDTO`, `toRatingDTO`, etc.), but `toEntity` and `toStepEntity` are static. The Javadoc says *"Static adapter"* which is misleading.
- **Guideline:** *"Use static methods (`toDTO`, `toEntity`) — adapters are stateless."*
- **Impact:** Inconsistent API — callers must know which methods are static and which require an instance. Misleading documentation.
- **Fix:** The `@Component` approach is a pragmatic deviation since `PhotoService` is needed for URL resolution. Accept this deviation but: (1) Update the Javadoc to remove "Static" and explain the `@Component` pattern. (2) Make `toEntity` and `toStepEntity` instance methods for consistency, OR extract them to a separate static utility.

### ADP-02 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/shopping/ShoppingAdapter.java`
- **Area:** Class design
- **Problem:** Same pattern as `RecipeAdapter` — `@Component` with instance methods due to `PhotoService` dependency. Deviates from the guideline's static adapter pattern.
- **Guideline:** *"Use static methods — adapters are stateless."*
- **Impact:** Inconsistent with guideline. However, the Javadoc here does NOT say "Static", which is better than `RecipeAdapter`.
- **Fix:** Accept the `@Component` deviation but ensure consistency: either update the guideline to acknowledge the `@Component` pattern for adapters needing Spring dependencies, or document the deviation in each adapter's Javadoc.

### ADP-03 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/profiles/UserProfileAdapter.java`
- **Area:** Class Javadoc
- **Problem:** Javadoc says *"Static adapter class"* but the class is a `@Component` with instance methods that depend on `PhotoService`. It is not static.
- **Guideline:** Javadoc must be accurate.
- **Impact:** Misleading documentation. Tests call methods as if they were static (see ADP-04).
- **Fix:** Update the Javadoc to remove "Static" — e.g., *"Adapter class that converts between User/UserProfile entities and UserProfileDTO."*

### ADP-04 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/model/adapter/profiles/UserProfileAdapterSpec.groovy`
- **Area:** All test methods calling `UserProfileAdapter.toDTO(user)` and `UserProfileAdapter.toEntity(dto)`
- **Problem:** Calls `toDTO` and `toEntity` as static methods, but they are instance methods on a `@Component` that depends on `PhotoService`. The `photoService` dependency is `null` in this context, so any photo URL resolution will fail or return `null` silently.
- **Guideline:** Tests should use `@Autowired` to inject real Spring-managed beans.
- **Impact:** Tests do not exercise the `PhotoService` integration. Photo-related assertions may pass incorrectly.
- **Fix:** Add `@Autowired UserProfileAdapter userProfileAdapter` to the spec and call `userProfileAdapter.toDTO(user)` as an instance method. Alternatively, `@MockitoBean PhotoService` if you want to control photo URL output.

### ADP-05 · Info

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/meals/MealAdapter.java`, `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/notifications/NotificationAdapter.java`
- **Area:** Class design
- **Problem:** These are truly static adapters with no Spring dependencies — they correctly follow the guideline. However, they are plain classes (no `@Component`), which is inconsistent with `RecipeAdapter`, `ShoppingAdapter`, and `UserProfileAdapter` which are `@Component`s.
- **Guideline:** Consistency across the codebase.
- **Impact:** Minor inconsistency. Not a functional issue since all methods are static.
- **Fix:** No action required. The static pattern is correct for these adapters. Optionally, add a comment explaining why they differ from the `@Component` adapters.

### ADP-06 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/notifications/NotificationAdapter.java`
- **Area:** All public methods
- **Problem:** Missing `@param` and `@return` Javadoc tags.
- **Guideline:** *"Use `@param` and `@return` tags on all public methods."*
- **Impact:** Violates documentation standard.
- **Fix:** Add `@param` and `@return` tags to `toNotificationDTO` and `toMessageDTO`.

### ADP-07 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/model/adapter/meals/MealAdapter.java`
- **Area:** All public methods
- **Problem:** Missing `@param` and `@return` Javadoc tags.
- **Guideline:** *"Use `@param` and `@return` tags on all public methods."*
- **Impact:** Violates documentation standard.
- **Fix:** Add `@param` and `@return` tags to all public methods.

---

## Exceptions

### EXC-01 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/exception/ObjectNotFoundException.java`
- **Area:** Class declaration
- **Problem:** Missing `@ResponseStatus(HttpStatus.NOT_FOUND)` annotation.
- **Guideline:** *"ALWAYS annotate custom exceptions with `@ResponseStatus` to set the HTTP status code."* The guideline example explicitly shows `@ResponseStatus(HttpStatus.NOT_FOUND)` on `ObjectNotFoundException`.
- **Impact:** Violates an ALWAYS rule. The `GlobalExceptionHandler` handles it correctly today, but the annotation is required as a safety net and for documentation.
- **Fix:** Add `@ResponseStatus(HttpStatus.NOT_FOUND)` to the class. Add `import org.springframework.http.HttpStatus;` and `import org.springframework.web.bind.annotation.ResponseStatus;`.

### EXC-02 · Critical

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/exception/PhotoDownloadException.java`
- **Area:** Class declaration
- **Problem:** Missing `@ResponseStatus` annotation.
- **Guideline:** *"Every custom exception exposed to REST controllers MUST have a `@ResponseStatus` annotation."*
- **Impact:** Violates a MUST rule.
- **Fix:** Add `@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)` (or `HttpStatus.BAD_GATEWAY` if the failure is from an external download).

### EXC-03 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/exception/ObjectNotFoundException.java`
- **Area:** Constructor signature
- **Problem:** Constructor takes a free-form `String message`. The guideline example shows a structured constructor: `ObjectNotFoundException(String entity, Long id)` with `"%s with id %d not found".formatted(entity, id)`. Current usage across the codebase is inconsistent — some callers pass `"Entity with id X not found"`, others pass `"Entity not found with ID: X"`, others pass `"Entity record not found for authenticated email: X"`.
- **Guideline:** Consistent exception messages.
- **Impact:** Inconsistent error messages in API responses.
- **Fix:** Add the structured constructor `ObjectNotFoundException(String entity, Long id)` from the guideline alongside the existing `String message` constructor. Gradually migrate callers to use the structured form.

### EXC-04 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/config/GlobalExceptionHandler.java`
- **Area:** Missing handler
- **Problem:** No explicit `@ExceptionHandler` for `AuthenticationException`. Since `AuthenticationException` extends `HomeAppException`, it is caught by the `handleHomeAppException` handler which returns HTTP 500. The exception has `@ResponseStatus(HttpStatus.UNAUTHORIZED)` but the handler ignores that annotation and hardcodes 500.
- **Guideline:** Each distinct error condition should have a dedicated handler mapping to the correct HTTP status.
- **Impact:** Authentication failures return 500 instead of 401.
- **Fix:** Add a dedicated handler:
  ```java
  @ExceptionHandler(AuthenticationException.class)
  public ProblemDetail handleAuthenticationException(AuthenticationException ex) {
      ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
      pd.setTitle("Authentication Error");
      pd.setType(errorType(AppErrorType.AUTHENTICATION_ERROR));
      return pd;
  }
  ```
  Also add `AUTHENTICATION_ERROR` to `AppErrorType`.

### EXC-05 · Warning

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/config/GlobalExceptionHandler.java`
- **Area:** `enrichWithExceptionDetails()` method
- **Problem:** Exposes stack traces and raw exception messages in API responses for all environments, including production.
- **Guideline:** Security best practice — never expose internal details in production.
- **Impact:** Information leakage. Attackers can see internal class names, method names, and error details.
- **Fix:** Gate the `enrichWithExceptionDetails()` call behind a profile check or a configuration property (e.g., `app.debug-errors=true`). Only include stack traces in `dev` or `local` profiles.

### EXC-06 · Info

- **File:** `home-app-backend/src/main/java/com/jorgemonteiro/home_app/exception/AppErrorType.java`
- **Area:** Enum values
- **Problem:** Only has 4 error types (`NOT_FOUND`, `VALIDATION_ERROR`, `SERVICE_UNAVAILABLE`, `INTERNAL_SERVER_ERROR`). There is no `AUTHENTICATION_ERROR` for the `AuthenticationException` mapping.
- **Guideline:** Error types should cover all exception categories.
- **Impact:** `AuthenticationException` has no matching error type URI.
- **Fix:** Add `AUTHENTICATION_ERROR` to the enum.

---

## Entities & DTOs

### DTO-01 · Warning

- **File:** Multiple DTO files used with `@Valid` in controllers
- **Area:** Validation annotations
- **Problem:** DTOs used with `@Valid` in controller parameters (`RecipeDTO`, `NutritionEntryDTO`, `NutrientDTO`, `MealTimeDTO`) should have Jakarta validation annotations (`@NotBlank`, `@NotNull`, `@Size`, etc.) to enforce input constraints. The `RecipeApiSpec` test confirms validation works for `RecipeDTO` (returns 400 for blank name), but other DTOs should be verified.
- **Guideline:** *"Use `@Data` classes for DTOs that need `@NotBlank`, `@Size`, `@Pattern`."*
- **Impact:** Missing validation annotations would allow invalid data through.
- **Fix:** Audit all DTOs used with `@Valid` and ensure they have appropriate Jakarta validation annotations. Specifically check: `NutritionEntryDTO`, `NutrientDTO`, `MealTimeDTO`, `MealPlanDTO`.

---

## Spock Tests

### TST-01 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/shopping/ShoppingStoreServiceSpec.groovy`
- **Area:** Class declaration
- **Problem:** Missing `@Narrative` annotation.
- **Guideline:** *"Every spec class MUST include `@Title` and `@Narrative` annotations."*
- **Impact:** Violates a MUST rule.
- **Fix:** Add `@Narrative` with a user-story-format description (e.g., *"As a household member, I want to manage stores and their assets, So that I can organize my shopping destinations"*).

### TST-02 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/shopping/ShoppingStoreServiceSpec.groovy`
- **Area:** Class declaration
- **Problem:** Missing `@ActiveProfiles("test")`. All other specs include it.
- **Guideline:** Standard annotation stack for service tests includes `@ActiveProfiles("test")`.
- **Impact:** May use the wrong Spring profile, potentially loading production security config.
- **Fix:** Add `@ActiveProfiles("test")`.

### TST-03 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/shopping/ShoppingCatalogServiceSpec.groovy`
- **Area:** Class declaration
- **Problem:** Missing `@Narrative` and `@ActiveProfiles("test")`.
- **Guideline:** *"MUST include `@Title` and `@Narrative`."* Standard stack includes `@ActiveProfiles("test")`.
- **Impact:** Violates MUST rule and may use wrong profile.
- **Fix:** Add both annotations.

### TST-04 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/controller/shopping/CouponApiSpec.groovy`
- **Area:** Class declaration
- **Problem:** Missing `@Narrative` annotation.
- **Guideline:** *"MUST include `@Title` and `@Narrative`."*
- **Impact:** Violates MUST rule.
- **Fix:** Add `@Narrative` with a user-story description.

### TST-05 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/shopping/ShoppingListServiceSpec.groovy`
- **Area:** Field `listService`
- **Problem:** Missing `@Subject` annotation on the primary bean under test.
- **Guideline:** *"ALWAYS use `@Subject` on the primary bean under test."*
- **Impact:** Violates ALWAYS rule. Harder to distinguish the SUT from supporting dependencies.
- **Fix:** Add `@Subject` to the `@Autowired ShoppingListService listService` field.

### TST-06 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/UserProfileServiceSpec.groovy`
- **Area:** Field `userProfileService`
- **Problem:** Missing `@Subject` annotation.
- **Guideline:** *"ALWAYS use `@Subject` on the primary bean under test."*
- **Fix:** Add `@Subject` to the `@Autowired UserProfileService userProfileService` field.

### TST-07 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/SettingsServiceSpec.groovy`
- **Area:** Field `settingsService`
- **Problem:** Missing `@Subject` annotation.
- **Guideline:** *"ALWAYS use `@Subject`."*
- **Fix:** Add `@Subject` to the `@Autowired SettingsService settingsService` field.

### TST-08 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/UserServiceSpec.groovy`
- **Area:** Field `userService`
- **Problem:** Missing `@Subject` annotation.
- **Guideline:** *"ALWAYS use `@Subject`."*
- **Fix:** Add `@Subject` to the `@Autowired UserService userService` field.

### TST-09 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/GooglePeopleServiceSpec.groovy`
- **Area:** Field `googlePeopleService`
- **Problem:** Missing `@Subject` annotation.
- **Guideline:** *"ALWAYS use `@Subject`."*
- **Fix:** Add `@Subject` to the `@Autowired GooglePeopleService googlePeopleService` field.

### TST-10 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/AgeClassificationServiceSpec.groovy`
- **Area:** Field `ageClassificationService`
- **Problem:** Missing `@Subject` annotation.
- **Guideline:** *"ALWAYS use `@Subject`."*
- **Fix:** Add `@Subject` to the `@Autowired AgeClassificationService ageClassificationService` field.

### TST-11 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/OnboardingIntegrationSpec.groovy`
- **Area:** Field `customOAuth2UserService`
- **Problem:** Missing `@Subject` annotation.
- **Guideline:** *"ALWAYS use `@Subject`."*
- **Fix:** Add `@Subject` to the `@Autowired CustomOAuth2UserService customOAuth2UserService` field.

### TST-12 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/controller/profiles/UserProfileControllerSpec.groovy`
- **Area:** Class fields
- **Problem:** Missing `@Subject` annotation. No field is marked as the primary subject under test.
- **Guideline:** *"ALWAYS use `@Subject`."*
- **Fix:** Add `@Subject` to `MockMvc mockMvc` (the primary tool for API testing in this spec).

### TST-13 · Info

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/shopping/ShoppingStoreServiceSpec.groovy`, `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/shopping/ShoppingCatalogServiceSpec.groovy`
- **Area:** Multiple test methods
- **Problem:** Several `given`, `when`, and `then` blocks lack descriptive labels (e.g., bare `given:` without a string description).
- **Guideline:** *"`given`, `when`, `then`, and `and` blocks MUST always contain a descriptive label."*
- **Impact:** Reduced readability of test specifications.
- **Fix:** Add descriptive string labels to all blocks (e.g., `given: "an existing category"`, `when: "updating the category"`, `then: "category is updated"`).

### TST-14 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/service/profiles/OAuth2FlowSpec.groovy`
- **Area:** Both test methods — anonymous subclass of `CustomOAuth2UserService`
- **Problem:** Creates an anonymous subclass that overrides `loadUser()` to bypass `super.loadUser()`. This means the actual production code path (which calls `super.loadUser()`, extracts attributes, calls `GooglePeopleService`, and builds authorities) is never tested.
- **Guideline:** *"PREFER real injected components over mocks."*
- **Impact:** Fragile test that doesn't verify the real OAuth2 flow. Changes to `CustomOAuth2UserService.loadUser()` won't be caught.
- **Fix:** Consider restructuring `CustomOAuth2UserService` to make the Google-dependent part mockable (e.g., extract a method for `super.loadUser()` that can be overridden in tests), or use `@MockitoBean` for `DefaultOAuth2UserService`.

### TST-15 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/model/adapter/profiles/UserProfileAdapterSpec.groovy`
- **Area:** All test methods
- **Problem:** Calls `UserProfileAdapter.toDTO(user)`, `UserProfileAdapter.toEntity(dto)`, and `UserProfileAdapter.toUserProfileEntity(dto, user)` as static methods. But `UserProfileAdapter` is a `@Component` with instance methods that depend on `PhotoService` for URL resolution. These calls compile because Groovy allows calling instance methods statically, but `photoService` will be `null`.
- **Guideline:** *"PREFER real injected components over mocks."* Tests should use `@Autowired` beans.
- **Impact:** Photo URL assertions pass with `null` instead of the actual resolved URL. Tests give false confidence.
- **Fix:** Add `@Autowired UserProfileAdapter userProfileAdapter` to the spec. Replace all `UserProfileAdapter.toDTO(...)` calls with `userProfileAdapter.toDTO(...)`. Optionally `@MockitoBean PhotoService` to control URL output.

### TST-16 · Warning

- **File:** `home-app-backend/src/test/groovy/com/jorgemonteiro/home_app/config/GlobalExceptionHandlerSpec.groovy`
- **Area:** Class declaration
- **Problem:** Missing `@Transactional` annotation. Other API specs use `@Transactional` for automatic rollback of test data.
- **Guideline:** *"Use `@Transactional` on the spec class — each test runs in a transaction that is rolled back automatically."*
- **Impact:** Test data created in one test (e.g., the "Duplicate" category) may leak into other tests if run in a different order.
- **Fix:** Add `@Transactional` to the class.

### TST-17 · Info

- **File:** Multiple missing test files
- **Area:** Test coverage gaps
- **Problem:** No Spock tests exist for the following components:
  - `NotificationService` / `NotificationController`
  - `MealTimeService` / `MealTimeController`
  - `PhotoService` / `ImageController`
  - `RecipeFeedbackController`
  - `NutritionEntryController` / `NutrientController`
  - `ShoppingDataRetentionService`
  - `MealReminderScheduler`
  - `MealPlanService` (only API-level tests exist, no service-level tests)
  - `RecipeAdapter`, `ShoppingAdapter`, `MealAdapter`, `NotificationAdapter`
- **Guideline:** *"Write and run tests when adding new features or fixing bugs."*
- **Impact:** Significant coverage gap. Changes to these components have no automated safety net.
- **Fix:** Create Spock specs for each untested component following the standard annotation stacks defined in the guidelines.

---

## Configuration & Build

### CFG-01 · Info

- **File:** `home-app-backend/src/main/resources/application.yaml`
- **Area:** Missing property
- **Problem:** `spring.threads.virtual.enabled` is not set. The guideline recommends virtual threads for Spring Boot 4.0.
- **Guideline:** *"Prefer `spring.threads.virtual.enabled=true`."*
- **Impact:** Not using virtual threads means the application uses platform threads, which limits scalability under high I/O load.
- **Fix:** Add `spring.threads.virtual.enabled: true` under the `spring:` section.

---

## Summary

| Severity | Count |
|----------|------:|
| Critical | 15 |
| Warning | 30 |
| Info | 8 |

---

## Priority Fix Order

The following order is recommended for an agent fixing these issues. Each phase is independent and can be verified before moving to the next.

### Phase 1 — FQDN Violations (mechanical, low risk)

Fix all fully qualified class name violations. These are simple import additions with no behavioral change.

| ID | File |
|----|------|
| CTR-01 | `RecipeController.java` |
| CTR-04 | `RecipeFeedbackController.java` |
| CTR-05 | `RecipeFeedbackController.java` |
| CTR-15 | `UserProfileController.java` |
| SVC-06 | `UserProfileService.java` |
| SVC-15 | `RecipeService.java` |
| SVC-16 | `MealPlanService.java` |

### Phase 2 — Missing Annotations (mechanical, low risk)

Add missing class-level annotations. No behavioral change expected.

| ID | File | Annotation |
|----|------|------------|
| SVC-01 | `ShoppingListService.java` | `@Slf4j` |
| SVC-02 | `UserProfileService.java` | `@Slf4j` |
| SVC-03 | `UserPreferenceService.java` | `@Validated` |
| SVC-04 | `UserPreferenceService.java` | `@Slf4j` |
| SVC-07 | `SettingsService.java` | `@Validated` |
| SVC-10 | `AgeClassificationService.java` | `@Transactional` |
| SVC-11 | `AgeClassificationService.java` | `@Slf4j`, `@Validated` |
| SVC-13 | `ShoppingDataRetentionService.java` | `@Validated` |
| EXC-01 | `ObjectNotFoundException.java` | `@ResponseStatus(HttpStatus.NOT_FOUND)` |
| EXC-02 | `PhotoDownloadException.java` | `@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)` |
| TST-01 | `ShoppingStoreServiceSpec.groovy` | `@Narrative` |
| TST-02 | `ShoppingStoreServiceSpec.groovy` | `@ActiveProfiles("test")` |
| TST-03 | `ShoppingCatalogServiceSpec.groovy` | `@Narrative`, `@ActiveProfiles("test")` |
| TST-04 | `CouponApiSpec.groovy` | `@Narrative` |
| TST-05 | `ShoppingListServiceSpec.groovy` | `@Subject` |
| TST-06 | `UserProfileServiceSpec.groovy` | `@Subject` |
| TST-07 | `SettingsServiceSpec.groovy` | `@Subject` |
| TST-08 | `UserServiceSpec.groovy` | `@Subject` |
| TST-09 | `GooglePeopleServiceSpec.groovy` | `@Subject` |
| TST-10 | `AgeClassificationServiceSpec.groovy` | `@Subject` |
| TST-11 | `OnboardingIntegrationSpec.groovy` | `@Subject` |
| TST-12 | `UserProfileControllerSpec.groovy` | `@Subject` |
| TST-16 | `GlobalExceptionHandlerSpec.groovy` | `@Transactional` |

### Phase 3 — Remove Unused Fields (mechanical, low risk)

| ID | File | Field to remove |
|----|------|-----------------|
| CTR-02 | `RecipeController.java` | `recipeAdapter` |
| CTR-16 | `UserProfileController.java` | `userProfileAdapter` |

### Phase 4 — Exception Handler & Error Types (medium risk)

| ID | Action |
|----|--------|
| EXC-04 | Add `@ExceptionHandler(AuthenticationException.class)` to `GlobalExceptionHandler` |
| EXC-06 | Add `AUTHENTICATION_ERROR` to `AppErrorType` enum |
| EXC-05 | Gate `enrichWithExceptionDetails()` behind a profile/config check |

### Phase 5 — Extract Business Logic from Controllers (high impact, medium risk)

| ID | Controller | Target Service |
|----|-----------|----------------|
| CTR-03 | `RecipeFeedbackController` | New `RecipeFeedbackService` |
| CTR-08 | `NutritionEntryController` | New `NutritionEntryService` |
| CTR-09 | `NutrientController` | New `NutrientService` or extend `RecipeService` |

### Phase 6 — Fix Adapter Inconsistencies (medium risk)

| ID | Action |
|----|--------|
| ADP-01 | Update `RecipeAdapter` Javadoc; make `toEntity`/`toStepEntity` instance methods |
| ADP-03 | Update `UserProfileAdapter` Javadoc to remove "Static" |
| ADP-04 | Fix `UserProfileAdapterSpec` to use `@Autowired` instance |
| TST-15 | Same as ADP-04 |

### Phase 7 — Service-Level Fixes (medium risk)

| ID | Action |
|----|--------|
| SVC-05 | Create `UserPreferenceAdapter` |
| SVC-08 | Move `toRoleDTO` to an adapter |
| SVC-09 | Replace loop `save()` with `saveAll()` in `SettingsService` |
| SVC-12 | Add `@Transactional(readOnly = true)` to `MealReminderScheduler.sendMealReminders()` |
| SVC-14 | Fix `NotificationService.getConversation()` read-only contradiction |
| SVC-17 | Extract `MealPlanExportService` from `MealPlanService` |

### Phase 8 — HATEOAS Compliance (high effort)

| ID | Action |
|----|--------|
| CTR-11 | Create HATEOAS resources/assemblers for meal plan and meal time endpoints |
| CTR-12 | Create HATEOAS resources/assemblers for notification endpoints |

### Phase 9 — Test Coverage (high effort)

| ID | Action |
|----|--------|
| TST-13 | Add block labels to `ShoppingStoreServiceSpec` and `ShoppingCatalogServiceSpec` |
| TST-14 | Restructure `OAuth2FlowSpec` |
| TST-17 | Create specs for all untested components listed in TST-17 |
