# Requirements: Settings & Configuration

## 1. Functional Requirements

### FR-18: Age Group Configuration
**So That** age-based classification remains flexible, "Adult" users can customize the age ranges.
- **Acceptance Criteria:**
    1. **Predefined Groups:** The system SHALL support at least three predefined age groups: **Child**, **Teenager**, and **Adult**.
    2. **Range Customization:** Users in the "Adult" group SHALL be able to define the `min_age` and `max_age` for each group.
    3. **Consistency:** The system SHALL ensure that age ranges do not overlap and cover all possible ages from 0 to 120.
    4. **Permissions:** ONLY users currently classified as "Adult" SHALL be able to access and modify these settings.

### FR-19: Family Role Configuration
**So That** the family hierarchy is accurately represented, "Adult" users can manage available roles.
- **Acceptance Criteria:**
    1. **Immutable Roles:** The roles **Mother**, **Father**, **Son**, and **Daughter** SHALL be predefined and immutable (cannot be deleted or renamed).
    2. **Custom Roles:** Users in the "Adult" group SHALL be able to create additional custom roles (e.g., Grandmother, Nanny).
    3. **Single Assignment:** The system SHALL ensure that each user is assigned to exactly one family role.
    4. **Permissions:** ONLY users currently classified as "Adult" SHALL be able to manage custom roles.

## 2. User Journeys

### UJ-5: Configuring Household Age Groups
1. An **Adult** user navigates to the Settings module.
2. The user modifies the "Teenager" range from 13-17 to 12-18.
3. The system validates that the new ranges are contiguous and non-overlapping.
4. Upon saving, the system triggers a recalculation of age groups for all household members.
