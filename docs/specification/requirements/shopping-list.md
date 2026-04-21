# Requirements: Shopping List Module

!!! info "EARS Syntax Legend (Hover for trigger name)"
    - :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
    - :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
    - :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
    - :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
    - :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."
    - :material-layers-outline:{ title="Complex" } **Complex:** Combinations of the above triggers.

## 1. User Journeys

### UJ-3: Collaborative Shopping {: #uj-3 }

!!! info ""
    1. **User A** creates a "Weekly Groceries" shopping list and adds "Milk" and "Eggs".
    2. **User B** logs in from their mobile device and sees the "Weekly Groceries" list on the dashboard.
    3. **User B** adds "Bread" to the same list while at the office.
    4. **User A** goes to the store, opens the list, and marks "Milk" as bought.
    5. "Milk" moves to the bottom of the list with a strikethrough, visible to both users in real-time.

### UJ-4: Using Loyalty Cards & Coupons {: #uj-4 }

!!! info ""
    1. **User A** adds a "Dunnes Stores" loyalty card with number `123456789` and selects "Code 128".
    2. **User A** adds a "€5 Off Groceries" coupon for Dunnes with an expiration date in 3 days and a photo of the voucher.
    3. On the **Home Page**, a warning panel highlights that the "€5 Off" coupon is expiring soon.
    4. At the checkout, **User A** opens the Shopping List module, selects Dunnes, and shows the Code 128 barcode to the cashier.
    5. **User A** then opens the Coupons section, shows the voucher photo, and marks it as "Used" after the discount is applied.

---

## 2. Functional Requirements

### FR-5: Category & Item Management {: #fr-5 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to create categories with a `name`, `description`, and a library icon.
    2. :material-check-all:{ title="Ubiquitous" } The system shall allow users to create items with a `name`, a `unit` (the default selling unit), and either a library icon or an uploaded photo stored via the centralized media service.
    3. :material-check-all:{ title="Ubiquitous" } The system shall establish a link between every shopping item and exactly one category.
    4. :material-check-all:{ title="Ubiquitous" } The system shall enforce a unique constraint on `(name, category_id)` to prevent duplicate items within the same category.
    5. :material-plus-circle-outline:{ title="Optional" } Where an item is sold in discrete pieces (e.g., a 1L bottle), the system shall allow users to specify `pc_quantity` and `pc_unit` for piece-to-unit conversion.
    6. :material-check-all:{ title="Ubiquitous" } The system shall store `nutrition_sample_size` (default 100) and `nutrition_sample_unit` (default 'g') to define the reference portion for nutrition data.

!!! quote "Rationale"
    **So That** I can organize my needs, I want to manage shopping categories and master items.

### FR-6: Store Management {: #fr-6 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to create stores with a `name`, `description`, and either a library icon or an uploaded photo.

!!! quote "Rationale"
    **So That** I can plan where to shop, I want to manage a list of favorite stores.

### FR-7: Shopping List Creation & Collaboration {: #fr-7 }

!!! success "Acceptance Criteria"
    1. :material-clock-outline:{ title="State-driven" } While a shopping list exists, the system shall share its visibility and edit permissions with all members of the household.
    2. :material-check-all:{ title="Ubiquitous" } The system shall display the identity of the user who created the list.
    3. :material-plus-circle-outline:{ title="Optional" } Where a list is marked as "Completed", the system shall hide it from the default active view.

!!! quote "Rationale"
    **So That** our household is synchronized, I want to create shared shopping lists.

### FR-8: List Items & Quantities {: #fr-8 }

!!! success "Acceptance Criteria"
    1. :material-plus-circle-outline:{ title="Optional" } Where a user adds an item to a list, the system shall allow the selection of a specific store or the "Any Place" designation.
    2. :material-check-all:{ title="Ubiquitous" } The system shall require the selection of a quantity and a Unit of Measure for each list item.
    3. :material-plus-circle-outline:{ title="Optional" } Where a user provides a price, the system shall record it against the specific list item.

!!! quote "Rationale"
    **So That** I know exactly what to buy, I want to specify quantities and stores for list items.

### FR-9: Price History & Suggestions {: #fr-9 }

!!! success "Acceptance Criteria"
    1. :material-play-circle:{ title="Event-driven" } When a price is recorded for an item at a store, the system shall save it to the permanent price history.
    2. :material-plus-circle-outline:{ title="Optional" } Where a user adds an item for a specific store, the system shall suggest the last price paid for that item at that store.
    3. :material-plus-circle-outline:{ title="Optional" } Where a user adds an item with the "Any Place" designation, the system shall suggest the most recent price paid for that item across all stores.

!!! quote "Rationale"
    **So That** I can estimate my spending, I want the system to track prices and suggest them.

### FR-10: In-Store Progress Tracking {: #fr-10 }

!!! success "Acceptance Criteria"
    1. :material-play-circle:{ title="Event-driven" } When a user marks an item as "Bought", the system shall move the item to the end of the list and apply a strikethrough style to its name.
    2. :material-play-circle:{ title="Event-driven" } When a user marks an item as "Unavailable", the system shall visually distinguish it from bought and pending items, indicating the item could not be found at the store.

!!! quote "Rationale"
    **So That** I don't miss anything while shopping, I want to track what I've already put in my cart.

### FR-11: Automatic Data Retention {: #fr-11 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall identify shopping lists that are older than 3 months.
    2. :material-play-circle:{ title="Event-driven" } When the daily retention task executes, the system shall permanently delete all shopping lists older than 3 months and their associated items.

!!! quote "Rationale"
    **So That** the system remains performant and cluttered-free, old shopping lists should be removed automatically.

#### FR-12: Loyalty Cards {: #fr-12 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to associate loyalty cards with specific stores.
    2. :material-clock-outline:{ title="State-driven" } While a loyalty card exists, the system shall share it with all members of the household.
    3. :material-check-all:{ title="Ubiquitous" } The system shall render loyalty card numbers as either a QR Code or a Code 128 barcode upon user request.

!!! quote "Rationale"
    **So That** I don't have to carry physical cards, I want to store my loyalty card numbers in the app.

#### FR-13: Store Coupons {: #fr-13 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to store coupons with a `name`, `description`, `value`, `photo`, `due date`, and an optional `barcode` (code + type).
    2. :material-plus-circle-outline:{ title="Optional" } Where a coupon has a barcode configured, the system shall render it as either a QR Code or a Code 128 barcode for scanning at checkout.
    3. :material-play-circle:{ title="Event-driven" } When a user marks a coupon as "Used", the system shall hide it from all default active views.

!!! quote "Rationale"
    **So That** I can save money, I want to manage my digital and physical coupons.

#### FR-15: Expiration Warning Panel (Dashboard) {: #fr-15 }

!!! success "Acceptance Criteria"
    1. :material-clock-outline:{ title="State-driven" } While a coupon is NOT marked as "Used" and its `due date` is within 4 days, the system shall display it in the "Expiring Coupons" dashboard panel.

!!! quote "Rationale"
    **So That** I don't forget to use my rewards, I want a prominent reminder of expiring coupons.

---

## 3. Non-Functional Requirements

### NFR-3: Reliability & Sync {: #nfr-3 }

!!! success "Acceptance Criteria"
    1. :material-clock-outline:{ title="State-driven" } While the mobile UI is offline, the system shall allow users to view and check off items.
    2. :material-play-circle:{ title="Event-driven" } When internet connectivity is restored, the system shall automatically synchronize offline changes with the server.

### NFR-4: Accessibility & UX {: #nfr-4 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall provide a minimum tap target size of 44x44px for all interactive elements in the shopping list interface.
