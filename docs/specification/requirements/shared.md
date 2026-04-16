# Requirements: Shared & Global UI

!!! info "EARS Syntax Legend (Hover for trigger name)"
    - :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
    - :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
    - :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
    - :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
    - :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."
    - :material-layers-outline:{ title="Complex" } **Complex:** Combinations of the above triggers.

## 1. Functional Requirements (Shared Patterns)

### FR-14: Module Navigation (Nested Menus) {: #fr-14 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall provide top-level parent items in the main navigation for each functional module.
    2. :material-play-circle:{ title="Event-driven" } When a user selects a parent navigation item, the system shall reveal the nested sub-menu for its internal features.
    3. :material-clock-outline:{ title="State-driven" } While a sub-feature is active, the system shall highlight the corresponding navigation item and maintain the expanded state of the parent module menu.

!!! quote "Rationale"
    **So That** the interface remains organized as the application grows, all functional modules SHALL follow a consistent navigation pattern.

---

## 2. Non-Functional Requirements (Global)

### NFR-2: Performance (Latency) {: #nfr-2 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall complete 95% of standard CRUD API requests within 150ms.
    2. :material-play-circle:{ title="Event-driven" } When a user interacts with a UI element, the system shall provide visual feedback within 100ms.
