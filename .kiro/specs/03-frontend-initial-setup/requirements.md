# Requirements: Frontend Initial Setup

This specification covers the creation of the `home-app-frontend` module and the implementation of the core shell and authentication flow.

## 1. Module Structure & Quality (REQ-010)
- **AC-010.1**: A new Gradle module named `home-app-frontend` is created in the root project.
- **AC-010.2**: The module is bootstrapped as a modern **React (v19.2+)** application using **Vite**.
- **AC-010.3**: **TypeScript** is used for all frontend code.
- **AC-010.4**: **Mantine (v9.0+)** is configured as the primary UI library.
- **AC-010.5**: Configure a **Vite Proxy** to route `/api/**` and `/oauth2/**` requests to the backend (port 8080) to simplify development and avoid CORS.
- **AC-010.6**: Integrate the frontend build lifecycle into Gradle using a plugin (e.g., `com.github.node-gradle.node`):
    - `./gradlew build` at the root must trigger `npm install` and `npm run build` for the frontend module.
    - Frontend build artifacts (the `dist` folder) should be properly handled as Gradle task outputs for caching.
- **AC-010.7**: **Playwright** is configured for end-to-end (E2E) testing, integrated into the Gradle build.
- **AC-010.8**: Enforce code quality using **ESLint** and **Prettier**.
- **AC-010.9**: Implement a structured directory layout (e.g., `/components`, `/pages`, `/hooks`, `/services`, `/context`).

## 2. Authentication & Authorization (REQ-011)
- **AC-011.1**: A dedicated **Login Page** is implemented.
- **AC-011.2**: The page features a prominent "Login with Google" button.
- **AC-011.3**: Clicking the button redirects the user to the backend OAuth2 authorization endpoint (`/oauth2/authorization/google`).
- **AC-011.4**: Use **React Router** to implement a **Protected Route** guard:
    - If a user is unauthenticated, they are redirected to the Login page.
    - If an authenticated user tries to access the Login page, they are redirected to the Dashboard.
- **AC-011.5**: Implement a **Logout** button in the header that calls the backend `/logout` endpoint.

## 3. Application Shell & State (REQ-012)
- **AC-012.1**: A top panel (Header) is implemented, inspired by the Mantine Analytics Dashboard.
- **AC-012.2**: Use **TanStack Query** for resilient data fetching and server-state management.
- **AC-012.3**: Use **React Context** to provide global access to the authenticated user's profile across the application.
- **AC-012.4**: The application implements a global **Loading State** (e.g., Mantine LoadingOverlay or Skeletons) while the initial user session is being fetched.
- **AC-012.5**: The header automatically fetches the current user's profile via `GET /api/user/me`.
- **AC-012.6**: The header displays the user's **Full Name**, **Email**, and **Profile Photo** (base64) using Mantine's Avatar and Text components.
- **AC-012.7**: The layout is responsive and follows a clean "Home App" aesthetic.
