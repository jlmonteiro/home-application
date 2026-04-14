# Tasks: Shopping List Module

## 1. Overview
Implement a comprehensive shopping assistant module that allows household members to manage categories, items, stores, and collaborative shopping lists, complete with loyalty cards and coupon tracking.

## 2. User Stories & Implementation Plan

---

### US-1: Master Data - Categories & Items
**As a** household member, **I want** to manage my own categories and items, **so that** I can organize my shopping needs according to my preferences.

**Persona:** Full-stack Engineer
**Linked Requirements:** FR-5
**Estimate:** 6 hours
**Dependencies:** None

#### Acceptance Criteria
- [x] AC-1.1: CRUD operations for Shopping Categories (Name, Description, Icon).
- [x] AC-1.2: CRUD operations for Shopping Items (Name, Photo, Category).
- [x] AC-1.3: Every item is linked to a category.
- [x] AC-1.4: Real-time validation for unique category names.

#### Tasks
- [x] T-1.1: Create Liquibase migration for `shopping_categories` and `shopping_items` tables in `shopping` schema.
- [x] T-1.2: Implement JPA Entities and Repositories for Category and Item.
- [x] T-1.3: Implement REST Controllers with HATEOAS support for Categories and Items.
- [x] T-1.4: Build React management pages for Categories and Items using Mantine.

---

### US-2: Store Management - Loyalty & Coupons
**As a** household member, **I want** to manage stores, loyalty cards, and coupons, **so that** I can save money and shop efficiently.

**Persona:** Full-stack Engineer
**Linked Requirements:** FR-6, FR-12, FR-13
**Estimate:** 8 hours
**Dependencies:** US-1

#### Acceptance Criteria
- [x] AC-2.1: CRUD for Stores (Name, Description, Icon, Photo).
- [x] AC-2.2: Add/Display Loyalty Cards for a store with QR/Code 128 rendering.
- [x] AC-2.3: Manage Coupons with due dates, photos, and "Used" status.
- [x] AC-2.4: Loyalty cards are shared with the entire household.

#### Tasks
- [x] T-2.1: Create Liquibase migration for `shopping_stores`, `loyalty_cards`, and `coupons` tables.
- [x] T-2.2: Implement JPA Entities and HATEOAS Controllers for Store, Card, and Coupon.
- [x] T-2.3: Integrate `react-barcode` and `qrcode.react` libraries in the frontend.
- [x] T-2.4: Build Store details view with nested Loyalty Card and Coupon sections.

---

### US-3: Shopping Lists - Planning & Suggestions
**As a** household member, **I want** to create and plan shared shopping lists with price suggestions, **so that** my family is synchronized on what to buy.

**Persona:** Full-stack Engineer
**Linked Requirements:** FR-7, FR-8, FR-9
**Estimate:** 8 hours
**Dependencies:** US-2

#### Acceptance Criteria
- [x] AC-3.1: Create shared shopping lists with a "Completed" status.
- [x] AC-3.2: Add items to lists with quantity, unit (L, kg, etc.), and optional price.
- [x] AC-3.3: System suggests the last price paid at the selected store (or global last price).
- [x] AC-3.4: Lists show the user who created them.

#### Tasks
- [x] T-3.1: Create Liquibase migration for `shopping_lists` and `shopping_list_items` tables.
- [x] T-3.2: Implement Price Suggestion logic in `ShoppingService`.
- [x] T-3.3: Build "Create/Edit List" UI with searchable item selection and store mapping.
- [x] T-3.4: Implement real-time list sharing via TanStack Query invalidation.

---

### US-4: Shopping Mode - In-Store Experience
**As a shopper**, **I want** to check off items in real-time while at the store, **so that** I don't miss anything and others know what was bought.

**Persona:** Frontend Engineer
**Linked Requirements:** FR-10, NFR-3, NFR-4
**Estimate:** 6 hours
**Dependencies:** US-3

#### Acceptance Criteria
- [x] AC-4.1: Items can be marked as "Bought" with a single tap.
- [x] AC-4.2: Bought items move to the bottom with a strikethrough.
- [x] AC-4.3: Interface is mobile-optimized (large tap targets).
- [x] AC-4.4: Supports offline viewing and checking (local cache sync).

#### Tasks
- [x] T-4.1: Implement "Shopping Mode" UI optimized for mobile devices.
- [x] T-4.2: Implement optimistic updates for `PATCH /list-items/{id}`.
- [x] T-4.3: Add `completed_at` timestamp logic when a list is finished.

---

### US-5: Global Maintenance & Warnings
**As a system user**, **I want** to be warned about expiring coupons and have old data purged, **so that** the app remains relevant and fast.

**Persona:** Full-stack Engineer
**Linked Requirements:** FR-11, FR-14, FR-15
**Estimate:** 4 hours
**Dependencies:** US-2, US-4

#### Acceptance Criteria
- [x] AC-5.1: Dashboard "Expiring Coupons" panel shows coupons due in < 4 days.
- [x] AC-5.2: Side navigation uses a nested "Shopping" menu for all sub-features.
- [x] AC-5.3: Lists older than 3 months are automatically deleted from the DB.

#### Tasks
- [x] T-5.1: Implement Spring `@Scheduled` task for 3-month data retention.
- [x] T-5.2: Build the "Expiring Coupons" widget for the Dashboard.
- [x] T-5.3: Refactor global navigation to use the nested "Shopping" structure.

---

## 3. General Requirements
### Definition of Done (DoD)
- [x] Code follows project conventions (Java 25, React 19, Spock).
- [x] All unit and integration tests (TS-13 to TS-17) are passing.
- [x] RFC 7807 compliance for all new shopping APIs.
- [x] Traceability between requirements, design, and implementation is maintained.
