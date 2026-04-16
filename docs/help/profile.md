# User Profile

Managing your personal information and family role is essential for a personalized experience within the Home Application.

## Editing Your Profile

Access the profile management page by following these simple steps:

1.  :material-cursor-default-click: **Avatar:** Click your profile picture in the top-right corner of the application header.
2.  :material-account-edit: **Action:** Select **"View/Edit Profile"** from the dropdown menu.
3.  :material-form-textbox: **Update:** Modify the desired fields and click the **Save** button.

---

## Profile Details

The profile is divided into mandatory identity fields and optional contact/social details.

<div class="grid cards" markdown>

-   :material-account-circle: **Identity**
    
    Includes your First Name, Last Name, and Email. These are synced from Google and are **read-only**.

-   :material-account-group: **Family Role**
    
    Assign yourself a role (e.g., Mother, Father, Son) to help organize the household hierarchy.

-   :material-phone: **Mobile Phone**
    
    Optional contact number used for future notification features.

-   :material-share-variant: **Social Links**
    
    Connect your LinkedIn, Facebook, or Instagram profiles to share with your family members.

</div>

---

## Rationale & Privacy

!!! info "Traceability"
    - :material-link: **[FR-4: Update User Profile](../specification/requirements/auth-profile.md#fr-4)**: Defines the ability to customize identity and roles.
    - :material-link: **[FR-3: User Profile Quick View](../specification/requirements/auth-profile.md#fr-3)**: Powers the header dropdown summary.

!!! tip "Data Synchronization"
    The application periodically synchronizes your base identity (Name, Email, Photo) with your Google account to ensure your profile remains up-to-date without manual effort.
