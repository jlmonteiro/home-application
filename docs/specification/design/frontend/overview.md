# Frontend Architecture

## Overview

The Home Application frontend is a modern, responsive Single Page Application (SPA) built with **React 19** and **Mantine 7**. It prioritizes a seamless user experience with real-time updates, offline capabilities, and a modular navigation system.

<div class="grid cards" markdown>

-   :material-layers-outline: **Component-Driven**
    
    Built with **Mantine 7**, ensuring a consistent design system, high accessibility, and a mobile-first responsive layout.

-   :material-sync: **State Management**
    
    Powered by **TanStack Query v5** for efficient server-state synchronization, caching, and optimistic UI updates.

-   :material-cellphone-link: **Mobile Optimized**
    
    Optimized for one-handed store use with large tap targets and a collapsible, persistent navigation sidebar.

</div>

---

## Tech Stack

<div class="grid cards" markdown>

-   :fontawesome-brands-react: **React 19**
    
    Leverages Concurrent Mode and improved transitions for a fluid UI.

-   :material-palette: **Mantine 7**
    
    Core UI library providing accessible components, hooks, and a robust theme system.

-   :material-cloud-sync: **TanStack Query**
    
    Handles asynchronous data fetching, automatic refetching, and local cache management.

-   :material-vector-square: **Tabler Icons**
    
    Comprehensive SVG icon system via `@tabler/icons-react`.

</div>

---

## Architecture Details

### [UI Architecture](ui-architecture.md)
- **Component Hierarchy:** Clear separation between Layout, Sidebar, and Feature Pages.
- **Navigation:** Persistent sidebar with nested modules and state tracking.
- **Loyalty & Coupons:** Specialized rendering for Barcodes (Code 128) and QR Codes.
- **Forms:** Type-safe form management with validation via `@mantine/form`.

---

## Requirements Traceability

!!! info "Implementation Links"
    - :material-menu: **[FR-14: Module Navigation](../../requirements/shared.md#fr-14)**: Nested menus and sidebar persistence.
    - :material-gesture-tap: **[NFR-4: Accessibility & UX](../../requirements/shopping-list.md#nfr-4)**: Mobile-first design and 44x44px tap targets.
    - :material-wifi-off: **[NFR-3: Reliability & Sync](../../requirements/shopping-list.md#nfr-3)**: Offline support and automatic synchronization.

---

## Related Documentation

- [:material-server: Backend Architecture](../backend/overview.md)
- [:material-api: API Design](../backend/api/index.md)
- [:material-test-tube: Test Architecture](../test-strategy/architecture.md)
