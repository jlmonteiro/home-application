# Tasks: Frontend Initial Setup

## Phase 1: Project Bootstrapping & Gradle Integration
- [x] **Task 1.1: Create Frontend Module**
    - **Plan**: Create the `home-app-frontend` directory and initialize a Vite project with React and TypeScript.
    - **Act**: Run `npm create vite@latest home-app-frontend -- --template react-ts`.
    - **Validate**: Ensure the directory structure is created and `package.json` is present.
- [x] **Task 1.2: Gradle Integration**
    - **Plan**: Configure the root `settings.gradle.kts` and create `home-app-frontend/build.gradle.kts` using the `com.github.node-gradle.node` plugin.
    - **Act**: Update `settings.gradle.kts`, create `build.gradle.kts`, and configure tasks to sync with npm.
    - **Validate**: Run `./gradlew :home-app-frontend:nodeSetup` and ensure it succeeds.
- [x] **Task 1.3: Configure Vite Proxy & Base URL**
    - **Plan**: Update `vite.config.ts` to proxy `/api`, `/oauth2`, and `/logout` to `http://localhost:8080`.
    - **Act**: Modify `vite.config.ts`.
    - **Validate**: Start the backend and frontend, then verify a test request is proxied correctly.

## Phase 2: UI Foundation & Core Libraries
- [x] **Task 2.1: Install Dependencies**
    - **Plan**: Install Mantine, TanStack Query, React Router, and their dependencies.
    - **Act**: `npm install @mantine/core @mantine/hooks @tanstack/react-query react-router-dom lucide-react`.
    - **Validate**: Check `package.json` for correct versions.
- [x] **Task 2.2: Mantine & Global Styles Setup**
    - **Plan**: Configure `MantineProvider` and basic theme in `App.tsx`.
    - **Act**: Update `main.tsx` and `App.tsx` with providers.
    - **Validate**: Verify the app renders with Mantine styles.
- [x] **Task 2.3: ESLint & Prettier Configuration**
    - **Plan**: Standardize code quality tools.
    - **Act**: Configure `.eslintrc.cjs` and `.prettierrc`.
    - **Validate**: Run `npm run lint`.

## Phase 3: Authentication & State Management
- [x] **Task 3.1: API Service & Auth Types**
    - **Plan**: Define TypeScript interfaces for the User Profile and create a basic fetcher using `fetch` or `axios`.
    - **Act**: Create `src/services/api.ts` and `src/types/user.ts`.
    - **Validate**: N/A (compile check).
- [x] **Task 3.2: AuthContext & Provider**
    - **Plan**: Create an `AuthContext` to manage the user session and provide a `useAuth` hook. Use TanStack Query to fetch `/api/user/me`.
    - **Act**: Implement `src/context/AuthContext.tsx`.
    - **Validate**: Verify the hook correctly identifies authenticated/unauthenticated states.
- [x] **Task 3.3: Protected Route Guard**
    - **Plan**: Create a `ProtectedRoute` component to handle redirection.
    - **Act**: Implement `src/components/ProtectedRoute.tsx`.
    - **Validate**: Try accessing a protected route while unauthenticated and verify redirect to `/login`.

## Phase 4: Pages & Shell Implementation
- [x] **Task 4.1: Login Page**
    - **Plan**: Create a simple, centered login page with a "Login with Google" button.
    - **Act**: Create `src/pages/LoginPage.tsx`.
    - **Validate**: Verify the button redirects to the backend's `/oauth2/authorization/google`.
- [x] **Task 4.2: App Layout (AppShell)**
    - **Plan**: Implement the main layout with a Header featuring the user's name, email, and avatar.
    - **Act**: Create `src/components/Layout.tsx` using Mantine's `AppShell`.
    - **Validate**: Login and verify user info is correctly displayed in the header.
- [x] **Task 4.3: Logout Functionality**
    - **Plan**: Add a logout button that redirects to the backend's `/logout` endpoint.
    - **Act**: Update the Header component.
    - **Validate**: Verify logout redirects the user and clears the session.

## Phase 5: Testing & Final Polish
- [ ] **Task 5.1: Playwright E2E Setup**
    - **Plan**: Initialize Playwright and create a basic smoke test for the login flow.
    - **Act**: `npx playwright install`, then create `tests/auth.spec.ts`.
    - **Validate**: Run `npx playwright test`.
- [ ] **Task 5.2: Loading States & Skeletons**
    - **Plan**: Add `LoadingOverlay` or `Skeleton` components for the initial session check.
    - **Act**: Update `App.tsx` and `Layout.tsx`.
    - **Validate**: Verify smooth transition from loading to authenticated state.
- [ ] **Task 5.3: Build & Deployment Check**
    - **Plan**: Ensure the full Gradle build works end-to-end.
    - **Act**: Run `./gradlew build` from the root.
    - **Validate**: Verify frontend assets are built and tests pass.
