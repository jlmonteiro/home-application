# Getting Started

Welcome to the Home Application! This guide will help you set up your development environment.

## Prerequisites

<div class="grid cards" markdown>

-   :fontawesome-brands-java: **Java 25**
    
    Required for Spring Boot 4.0

-   :fontawesome-brands-node: **Node.js 22**
    
    Required for frontend build

-   :material-docker: **Docker**
    
    For PostgreSQL and docs build

-   :material-database: **PostgreSQL 16+**
    
    Can run via Docker Compose

-   :fontawesome-brands-google: **Google OAuth2**
    
    For authentication testing

</div>

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/jlmonteiro/home-application.git
cd home-application
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Configure Environment

Create `.env` file in the project root:

```bash
# Google OAuth2 credentials (required for login)
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Database (default for local dev)
export DATABASE_URL="jdbc:postgresql://localhost:5432/homeapp"
export DATABASE_USERNAME="homeapp"
export DATABASE_PASSWORD="homeapp"

# Frontend URL for CORS
export FRONTEND_URL="http://localhost:5173"
```

### 4. Run Backend

```bash
./gradlew :home-app-backend:bootRun
```

The API will be available at `http://localhost:8080`

### 5. Run Frontend

```bash
cd home-app-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Login

Open `http://localhost:5173` and sign in with your Google account.

## Development Commands

### Frontend

```bash
cd home-app-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Run E2E tests (with MSW mocks)
npm run test:e2e:mock

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend

```bash
# Run tests
./gradlew :home-app-backend:test

# Run with coverage
./gradlew :home-app-backend:jacocoTestReport

# Build JAR
./gradlew :home-app-backend:bootJar

# Run application
./gradlew :home-app-backend:bootRun
```

### Documentation

```bash
# Build docs (Docker-based)
./scripts/generate-docs.sh

# Output: build/site/
# View: open build/site/index.html
```

## Project Structure

```
home-application/
├── home-app-backend/           # Spring Boot 4.0 API
│   ├── src/main/java/          # Java source
│   ├── src/main/resources/     # Config & migrations
│   └── src/test/groovy/        # Spock tests
├── home-app-frontend/          # React 19 SPA
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level components
│   │   ├── services/           # API client
│   │   ├── types/              # TypeScript types
│   │   └── test/               # Tests (unit + E2E)
│   ├── e2e/                    # Playwright E2E tests
│   └── build/                  # Build output & reports
├── docs/                       # MkDocs documentation
│   ├── user/                   # User guides
│   ├── technical/              # Developer docs
│   └── specification/          # Requirements & design
├── scripts/
│   └── generate-docs.sh        # Docs build script
├── compose.yaml                # Docker Compose
└── mkdocs.yml                  # MkDocs config
```

## Testing

### Unit Tests (Frontend)

```bash
cd home-app-frontend
npm run test:unit
```

### E2E Tests

```bash
cd home-app-frontend
npm run test:e2e:mock  # Uses MSW mocks, no backend needed
```

### Backend Tests

```bash
./gradlew :home-app-backend:test
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8080
lsof -i :5173

# Kill process
kill <PID>
```

### Database Connection Issues

```bash
# Check PostgreSQL status
docker compose ps postgres

# View logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres
```

### Clear Gradle Cache

```bash
./gradlew clean
rm -rf ~/.gradle/caches
```

### Clear Node Modules

```bash
cd home-app-frontend
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the [Architecture Overview](../specification/design/design.md)
- Explore the [API Reference](../specification/design/backend/api/index.md)
- Review the [Testing Strategy](../specification/design/test-strategy/architecture.md)