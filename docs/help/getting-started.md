# Getting Started

Welcome to the **Home Application**! This guide will walk you through setting up your development environment and running the application for the first time.

## Prerequisites

Ensuring you have the correct versions of these tools is critical for a smooth setup.

<div class="grid cards" markdown>

-   :fontawesome-brands-java: **Java 25**
    
    Required for the Spring Boot 4.0 backend.

-   :fontawesome-brands-node: **Node.js 22+**
    
    Required for the React frontend and Vite build system.

-   :material-docker: **Docker & Compose**
    
    Used for the PostgreSQL database and documentation build.

-   :fontawesome-brands-google: **Google Cloud Console**
    
    Required to generate OAuth2 credentials for authentication.

</div>

---

## Quick Start

### 1. Clone & Enter
```bash
git clone https://github.com/jlmonteiro/home-application.git
cd home-application
```

### 2. Infrastructure
Start the PostgreSQL database container:
```bash
docker compose up -d postgres
```

### 3. Environment Setup
Create a `.env` file in the root directory. You MUST provide valid Google OAuth2 credentials to enable login.

!!! warning "Security Notice"
    Never commit your `.env` file to version control. It is already included in `.gitignore`.

```bash
# Google OAuth2 credentials
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Database (default settings)
export DATABASE_URL="jdbc:postgresql://localhost:5432/homeapp"
export DATABASE_USERNAME="homeapp"
export DATABASE_PASSWORD="homeapp"

# Frontend URL for CORS
export FRONTEND_URL="http://localhost:5173"
```

---

## Running the App

=== ":material-server: Backend"

    1.  **Launch the API:**
        ```bash
        ./gradlew :home-app-backend:bootRun
        ```
    2.  **Verify:**
        Access the HATEOAS root at `http://localhost:8080/api`

=== ":material-responsive: Frontend"

    1.  **Install & Start:**
        ```bash
        cd home-app-frontend
        npm install
        npm run dev
        ```
    2.  **Verify:**
        Open `http://localhost:5173` in your browser.

---

## Development Workflow

### Useful Commands

=== ":material-test-tube: Testing"

    | Module | Command | Purpose |
    | :--- | :--- | :--- |
    | **Backend** | `./gradlew :home-app-backend:test` | Run Spock integration tests. |
    | **Frontend** | `npm run test:e2e:mock` | Run Playwright E2E with MSW mocks. |

=== ":material-chart-bar: Coverage"

    | Module | Command | Purpose |
    | :--- | :--- | :--- |
    | **Backend** | `./gradlew :home-app-backend:jacocoTestReport` | Generate JaCoCo reports. |

=== ":material-book-open-page-variant: Documentation"

    | Task | Command |
    | :--- | :--- |
    | **Build Site** | `./scripts/generate-docs.sh` |
    | **Clean Build** | `rm -rf build/site` |

---

## Project Structure

!!! tip "Organization"
    The project is a Gradle-managed monorepo, keeping frontend, backend, and documentation in a single atomic structure.

-   :material-folder-cog: `home-app-backend/`: Spring Boot 4.0 API (Java 25).
-   :material-folder-layers: `home-app-frontend/`: React 19 SPA (Vite).
-   :material-folder-text: `docs/`: Markdown documentation source.
-   :material-file-code: `mkdocs.yml`: Documentation site configuration.

---

## Troubleshooting

??? bug "Port 8080 or 5173 is already in use"
    Use `lsof -i :8080` to find the process ID, then `kill -9 <PID>` to free the port.

??? bug "Database connection refused"
    Ensure the Docker container is running: `docker compose ps`. If it's down, try `docker compose up -d`.

??? bug "Google Login returns 'Redirect URI Mismatch'"
    Ensure your Google Cloud Console project has `http://localhost:8080/login/oauth2/code/google` added to the Authorized redirect URIs.

---

## Next Steps

-   [:material-sitemap: **Architecture Overview**](../specification/design/design.md)
-   [:material-api: **API Design**](../specification/design/backend/api/index.md)
-   [:material-test-tube: **Test Strategy**](../specification/design/test-strategy/architecture.md)
