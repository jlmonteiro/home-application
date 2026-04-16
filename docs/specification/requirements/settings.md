# Requirements: Settings & Configuration

!!! info "EARS Syntax Legend (Hover for trigger name)"
    - :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
    - :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
    - :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
    - :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
    - :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."
    - :material-layers-outline:{ title="Complex" } **Complex:** Combinations of the above triggers.

## 1. Functional Requirements

### FR-18: Age Group Configuration {: #fr-18 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall support the **Child**, **Teenager**, and **Adult** predefined age groups.
    2. :material-clock-outline:{ title="State-driven" } While a user is classified as an **Adult**, the system shall allow the user to define the `min_age` and `max_age` for each age group.
    3. :material-alert-circle:{ title="Unwanted Behavior" } If the user defines overlapping age ranges or ranges that do not cover the 0-120 age span, then the system shall return a validation error.
    4. :material-clock-outline:{ title="State-driven" } While a user is NOT classified as an **Adult**, the system shall deny access to all age group configuration settings.

!!! quote "Rationale"
    **So That** age-based classification remains flexible, "Adult" users can customize the age ranges.

### FR-19: Family Role Configuration {: #fr-19 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall protect the **Mother**, **Father**, **Son**, and **Daughter** roles from deletion or renaming.
    2. :material-clock-outline:{ title="State-driven" } While a user is classified as an **Adult**, the system shall allow the user to create and delete custom family roles.
    3. :material-check-all:{ title="Ubiquitous" } The system shall ensure that every user is assigned to exactly one family role.
    4. :material-clock-outline:{ title="State-driven" } While a user is NOT classified as an **Adult**, the system shall deny access to all family role management features.

!!! quote "Rationale"
    **So That** the family hierarchy is accurately represented, "Adult" users can manage available roles.

---

## 2. User Journeys

### UJ-5: Configuring Household Age Groups {: #uj-5 }

!!! info ""
    1. An **Adult** user navigates to the Settings module.
    2. The user modifies the "Teenager" range from 13-17 to 12-18.
    3. The system validates that the new ranges are contiguous and non-overlapping.
    4. Upon saving, the system triggers a recalculation of age groups for all household members.
