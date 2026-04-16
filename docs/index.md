# Home Application

<div class="grid cards" markdown>

-   :material-shopping: **Shopping Lists**
    
    Create and manage shared shopping lists with your family

-   :material-account-group: **Family Hierarchy**
    
    Age-based classification and role management

-   :material-account: **User Profiles**
    
    Update and manage your profile information

-   :material-store: **Store Management**
    
    Track loyalty cards and coupons

</div>

## Quick Start

!!! tip "Prerequisites"
    - Java 25+
    - Node.js 20+
    - PostgreSQL 16+

### Backend

```bash
./gradlew :home-app-backend:bootRun
```

### Frontend

```bash
cd home-app-frontend
npm install
npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Mantine 7 |
| Backend | Spring Boot 4 + Java 25 |
| Database | PostgreSQL 16+ |
| Auth | Google OAuth2 |

## Documentation

- [User Guide](help/getting-started.md)
- [API Documentation](specification/design/backend/api/index.md)
- [Requirements](specification/requirements/requirements.md)
