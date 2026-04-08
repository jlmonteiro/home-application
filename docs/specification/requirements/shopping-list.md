# Requirements: Shopping List Module

## 1. User Journeys
### UJ-3: Collaborative Shopping
1. **User A** creates a "Weekly Groceries" shopping list and adds "Milk" and "Eggs".
2. **User B** logs in from their mobile device and sees the "Weekly Groceries" list on the dashboard.
3. **User B** adds "Bread" to the same list while at the office.
4. **User A** goes to the store, opens the list, and marks "Milk" as bought.
5. "Milk" moves to the bottom of the list with a strikethrough, visible to both users in real-time.

### UJ-4: Using Loyalty Cards & Coupons
1. **User A** adds a "Dunnes Stores" loyalty card with number `123456789` and selects "Code 128".
2. **User A** adds a "€5 Off Groceries" coupon for Dunnes with an expiration date in 3 days and a photo of the voucher.
3. On the **Home Page**, a warning panel highlights that the "€5 Off" coupon is expiring soon.
4. At the checkout, **User A** opens the Shopping List module, selects Dunnes, and shows the Code 128 barcode to the cashier.
5. **User A** then opens the Coupons section, shows the voucher photo, and marks it as "Used" after the discount is applied.

## 2. Functional Requirements
### FR-5: Category & Item Management
**So That** I can organize my needs, I want to manage shopping categories and master items.
- **Acceptance Criteria:**
    1. **Categories:** Users SHALL be able to create categories with a `name`, `description`, and an `icon` (selected from a system library).
    2. **Items:** Users SHALL be able to create items with a `name` and either an `icon` (system library) or an `uploaded photo`.
    3. **Categorization:** Every item MUST be linked to exactly one category.

### FR-6: Store Management
**So That** I can plan where to shop, I want to manage a list of favorite stores.
- **Acceptance Criteria:**
    1. Users SHALL be able to create stores with a `name`, `description`, and either an `icon` (system library) or an `uploaded photo`.

### FR-7: Shopping List Creation & Collaboration
**So That** our household is synchronized, I want to create shared shopping lists.
- **Acceptance Criteria:**
    1. **Sharing:** All shopping lists SHALL be shared with all members of the household.
    2. **Ownership:** The system SHALL track and display the user who created the list.
    3. **Modifications:** Any household member SHALL be able to add, edit, or remove items from any list.
    4. **Completion:** Lists SHALL have a "Completed" status. Completed lists are hidden from the active view by default.

### FR-8: List Items & Quantities
**So That** I know exactly what to buy, I want to specify quantities and stores for list items.
- **Acceptance Criteria:**
    1. **Store Selection:** When adding an item to a list, users can select a specific store or "Any Place".
    2. **Quantities:** Users SHALL select a quantity and a **Unit of Measure** from a pre-defined list (e.g., kg, L, Pack, Unit).
    3. **Price Recording:** Users CAN provide a price for the item.

### FR-9: Price History & Suggestions
**So That** I can estimate my spending, I want the system to track prices and suggest them.
- **Acceptance Criteria:**
    1. **History:** The system SHALL save the price history per item and per store.
    2. **Suggestions:** When adding an item to a list for a specific store, the system SHALL suggest the **last price** paid at that store.
    3. **Global Suggestion:** If "Any Place" is selected, the system SHALL suggest the **Global Last Price** (most recent price paid regardless of store).

### FR-10: In-Store Progress Tracking
**So That** I don't miss anything while shopping, I want to track what I've already put in my cart.
- **Acceptance Criteria:**
    1. **Check-off:** Users SHALL be able to mark individual items in a list as "Bought".
    2. **Visual Feedback:** "Bought" items SHALL move to the end of the list and be displayed with a strikethrough.

### FR-11: Automatic Data Retention
**So That** the system remains performant and cluttered-free, old shopping lists should be removed automatically.
- **Acceptance Criteria:**
    1. **Retention Period:** The system SHALL identify shopping lists that are older than 3 months (based on completion date or creation date if incomplete).
    2. **Automatic Deletion:** The system SHALL automatically and permanently delete these lists and their associated items.
    3. **Background Processing:** This cleanup SHOULD occur as a scheduled background task.

#### FR-12: Loyalty Cards
**So That** I don't have to carry physical cards, I want to store my loyalty card numbers in the app.
- **Acceptance Criteria:**
    1. **Data:** Users SHALL be able to add loyalty cards to a Store with a `name` and a `card number`.
    2. **Sharing:** Loyalty cards SHALL be shared with all members of the household.
    3. **Visual Representation:** The system SHALL be able to display the card number as either a **QR Code** or a **Code 128** barcode.
    4. **Access:** Cards MUST be easily accessible from the Store details or the main Shopping List menu.

#### FR-13: Store Coupons
**So That** I can save money, I want to manage my digital and physical coupons.
- **Acceptance Criteria:**
    1. **Data:** Coupons SHALL have a `name`, `description`, `value` (free-text), and a `photo` (of the physical or digital voucher).
    2. **Validity:** Coupons MUST have a `due date`.
    3. **Usage Tracking:** Users SHALL be able to mark a coupon as "Used".
    4. **Filtering:** Used or expired coupons SHOULD be hidden from active views by default.

#### FR-15: Expiration Warning Panel (Dashboard)
**So That** I don't forget to use my rewards, I want a prominent reminder of expiring coupons.
- **Acceptance Criteria:**
    1. **Location:** The user Home Page SHALL include a "Expiring Coupons" panel.
    2. **Logic:** The panel SHALL display coupons that:
        - Are NOT marked as "Used".
        - Are NOT yet expired.
        - Have a `due date` less than **4 days** in the future.
    3. **Action:** Clicking a coupon in the panel SHALL navigate the user directly to the coupon's details.

## 3. Non-Functional Requirements
### NFR-3: Reliability & Sync
- **Acceptance Criteria:**
    1. **Offline Support:** The mobile UI SHALL support offline viewing and checking of items, with automatic synchronization when the connection is restored.

### NFR-4: Accessibility & UX
- **Acceptance Criteria:**
    1. **Mobile-First:** The shopping list interface MUST be optimized for one-handed use with large tap targets (minimum 44x44px).
