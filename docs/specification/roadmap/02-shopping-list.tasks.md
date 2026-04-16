# Tasks: Shopping List Module

## 1. Overview
Implement a comprehensive shopping assistant module that allows household members to manage categories, items, stores, and collaborative shopping lists, complete with loyalty cards and coupon tracking.

!!! info "Status Legend"
    - :material-check-circle: **Completed**
    - :material-play-circle: **In Progress**
    - :material-clock-outline: **Planned**

---

## 2. User Stories

### US-1: Master Data - Categories & Items :material-check-circle: {: #us-1 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to manage my own categories and items, **so that** I can organize my shopping needs according to my preferences.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** None

!!! note "Validates Requirements"
    - [:material-format-list-bulleted-type: **FR-5: Category & Item Management**](../requirements/shopping-list.md#fr-5)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } CRUD operations for Shopping Categories (Name, Description, Icon).
    2. :material-check-all:{ title="Ubiquitous" } CRUD operations for Shopping Items (Name, Photo, Category).
    3. :material-check-all:{ title="Ubiquitous" } Every item is linked to a category.
    4. :material-alert-circle:{ title="Unwanted Behavior" } If a category name is not unique, then the system shall return a validation error.

!!! example "Implementation Tasks"
    - [x] :material-database-sync: Create Liquibase migration for `shopping_categories` and `shopping_items`.
    - [x] :material-file-code: Implement JPA Entities and Repositories for Category and Item.
    - [x] :material-api: Implement REST Controllers with HATEOAS support.
    - [x] :material-layers: Build React management pages using Mantine.

---

### US-2: Store Management - Loyalty & Coupons :material-check-circle: {: #us-2 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to manage stores, loyalty cards, and coupons, **so that** I can save money and shop efficiently.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 8 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-store: **FR-6: Store Management**](../requirements/shopping-list.md#fr-6)
    - [:material-barcode-scan: **FR-12: Loyalty Cards**](../requirements/shopping-list.md#fr-12)
    - [:material-ticket-percent: **FR-13: Store Coupons**](../requirements/shopping-list.md#fr-13)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } CRUD for Stores (Name, Description, Icon, Photo).
    2. :material-check-all:{ title="Ubiquitous" } Add/Display Loyalty Cards with QR/Code 128 rendering.
    3. :material-check-all:{ title="Ubiquitous" } Manage Coupons with due dates, photos, and "Used" status.
    4. :material-clock-outline:{ title="State-driven" } While a loyalty card exists, the system shall share it with the entire household.

!!! example "Implementation Tasks"
    - [x] :material-database-sync: Create Liquibase migration for `shopping_stores`, `loyalty_cards`, and `coupons`.
    - [x] :material-file-code: Implement JPA Entities and HATEOAS Controllers.
    - [x] :material-barcode: Integrate `react-barcode` and `qrcode.react` libraries.
    - [x] :material-layers: Build Store details view with nested sections.

---

### US-3: Shopping Lists - Planning & Suggestions :material-check-circle: {: #us-3 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to create and plan shared shopping lists with price suggestions, **so that** my family is synchronized on what to buy.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 8 hours
    - **Dependencies:** [US-2](#us-2)

!!! note "Validates Requirements"
    - [:material-account-multiple: **FR-7: Shopping List Collaboration**](../requirements/shopping-list.md#fr-7)
    - [:material-pound: **FR-8: List Items & Quantities**](../requirements/shopping-list.md#fr-8)
    - [:material-lightbulb-on: **FR-9: Price History & Suggestions**](../requirements/shopping-list.md#fr-9)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Create shared shopping lists with a "Completed" status.
    2. :material-check-all:{ title="Ubiquitous" } Add items to lists with quantity, unit (L, kg, etc.), and optional price.
    3. :material-plus-circle-outline:{ title="Optional" } Where a user adds an item, the system shall suggest the last price paid at the selected store.
    4. :material-check-all:{ title="Ubiquitous" } Lists shall display the user who created them.

!!! example "Implementation Tasks"
    - [x] :material-database-sync: Create Liquibase migration for `shopping_lists` and `shopping_list_items`.
    - [x] :material-cog: Implement Price Suggestion logic in `ShoppingService`.
    - [x] :material-layers: Build "Create/Edit List" UI with searchable item selection.
    - [x] :material-sync: Implement real-time list sharing via TanStack Query.

---

### US-4: Shopping Mode - In-Store Experience :material-check-circle: {: #us-4 }

!!! abstract "Story Definition"
    **As a shopper**, **I want** to check off items in real-time while at the store, **so that** I don't miss anything and others know what was bought.
    
    - **Persona:** Frontend Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** [US-3](#us-3)

!!! note "Validates Requirements"
    - [:material-playlist-check: **FR-10: In-Store Progress Tracking**](../requirements/shopping-list.md#fr-10)
    - [:material-sync: **NFR-3: Reliability & Sync**](../requirements/shopping-list.md#nfr-3)

!!! success "Acceptance Criteria"
    1. :material-play-circle:{ title="Event-driven" } When a user marks an item as "Bought", the system shall move it to the bottom with a strikethrough.
    2. :material-check-all:{ title="Ubiquitous" } The interface shall be mobile-optimized with a minimum 44x44px tap target.
    3. :material-clock-outline:{ title="State-driven" } While offline, the system shall support viewing and checking items.

!!! example "Implementation Tasks"
    - [x] :material-layers: Implement "Shopping Mode" UI optimized for mobile devices.
    - [x] :material-sync: Implement optimistic updates for check-off actions.
    - [x] :material-clock: Add `completed_at` timestamp logic for list finalization.

---

### US-5: Global Maintenance & Warnings :material-check-circle: {: #us-5 }

!!! abstract "Story Definition"
    **As a system user**, **I want** to be warned about expiring coupons and have old data purged, **so that** the app remains relevant and fast.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** [US-2](#us-2), [US-4](#us-4)

!!! note "Validates Requirements"
    - [:material-delete-sweep: **FR-11: Automatic Data Retention**](../requirements/shopping-list.md#fr-11)
    - [:material-alert-decagram: **FR-15: Expiration Warning Panel**](../requirements/shopping-list.md#fr-15)

!!! success "Acceptance Criteria"
    1. :material-clock-outline:{ title="State-driven" } While a coupon is due within 4 days, the system shall display it in the "Expiring Coupons" dashboard panel.
    2. :material-check-all:{ title="Ubiquitous" } The side navigation shall use a nested "Shopping" menu for all sub-features.
    3. :material-play-circle:{ title="Event-driven" } When the daily retention task runs, the system shall delete lists older than 3 months.

!!! example "Implementation Tasks"
    - [x] :material-cog-sync: Implement Spring `@Scheduled` task for 3-month data retention.
    - [x] :material-layers: Build the "Expiring Coupons" widget for the Dashboard.
    - [x] :material-code-json: Refactor global navigation to use nested structures.

---

## 3. Definition of Done (DoD)

!!! tip "Quality Checklist"
    - [x] :material-check-decagram: Code follows project conventions (Java 25, React 19, Spock).
    - [x] :material-test-tube: All unit and integration tests (TS-13 to TS-17) are passing.
    - [x] :material-bug: RFC 7807 compliance for all new shopping APIs.
    - [x] :material-link-variant: Traceability between requirements, design, and implementation is maintained.
