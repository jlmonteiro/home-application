# Shopping Assistant

The Shopping module is the core collaborative feature of the Home Application, allowing your family to coordinate grocery runs, track prices, and manage digital loyalty assets.

## Core Features

<div class="grid cards" markdown>

-   :material-cart-arrow-right: **Shared Lists**
    
    Create lists that are instantly visible to every member of your household. Changes sync in real-time.

-   :material-barcode-scan: **Digital Cards**
    
    Store your store loyalty numbers and render them as scannable barcodes directly on your phone.

-   :material-ticket-percent: **Coupons**
    
    Track store-specific coupons with expiration dates. Receive dashboard warnings for items expiring soon.

-   :material-lightbulb-on: **Smart Pricing**
    
    The system remembers what you paid for items at different stores and suggests prices automatically.

</div>

---

## User Guides

### 1. Planning a Grocery Run
1.  Navigate to **Shopping** :material-arrow-right: **Lists**.
2.  Click :material-plus: **New List** and give it a name (e.g., "Weekly Groceries").
3.  Add items by selecting them from your **Master Catalog**.
4.  Specify the **Store** where you plan to buy each item to get price suggestions.

### 2. In-Store Experience
1.  Open the list on your mobile device.
2.  Switch to **Shopping Mode** for an optimized, large-target interface.
3.  Tap an item to mark it as **Bought**. It will move to the bottom with a strikethrough.
4.  Access your **Loyalty Cards** directly from the store details to scan at the checkout.

---

## Rationale & Logic

!!! info "Traceability"
    - :material-link: **[FR-7: Shopping List Collaboration](../specification/requirements/shopping-list.md#fr-7)**: Powers real-time household synchronization.
    - :material-link: **[FR-9: Price Suggestions](../specification/requirements/shopping-list.md#fr-9)**: Logic for historical price tracking and estimates.
    - :material-link: **[FR-12: Loyalty Cards](../specification/requirements/shopping-list.md#fr-12)**: Barcode and QR code rendering for store scanners.

!!! tip "Automatic Cleanup"
    To keep your dashboard clean, completed lists and their items are automatically archived and purged after 3 months.
