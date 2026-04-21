# UI Architecture

## Overview

The Home Application frontend is built as a highly interactive **Single Page Application (SPA)** that emphasizes performance, real-time collaboration, and a mobile-first user experience.

<div class="grid cards" markdown>

-   :material-sitemap-outline: **Hierarchical Design**
    
    Modular component structure with clear separation between layouts, functional pages, and shared UI primitives.

-   :material-cached: **Server State**
    
    Advanced caching and synchronization logic to minimize latency and support collaborative workflows.

-   :material-devices: **Adaptive UI**
    
    Fluid responsiveness ensuring usability from desktop monitors down to single-handed mobile use in-store.

</div>

---

## Tech Stack

=== "Core"

    | Tool | Purpose | link |
    | :--- | :--- | :--- |
    | :fontawesome-brands-react: **React 19** | UI library with Concurrent rendering and improved hooks. | [Site](https://react.dev/) |
    | :material-palette: **Mantine 7** | Core component library for layout, forms, and theming. | [Site](https://mantine.dev/) |
    | :material-sync: **TanStack Query** | Server state management, caching, and optimistic updates. | [Site](https://tanstack.com/query/latest) |
    | :material-router: **React Router 7** | Client-side routing with nested layout support. | [Site](https://reactrouter.com/) |

=== "Utilities"

    | Tool | Purpose |
    | :--- | :--- |
    | :material-barcode: **react-barcode** | Linear 1D barcode generation (Code 128). |
    | :material-qrcode: **qrcode.react** | 2D QR code generation for digital cards. |
    | :material-clock-outline: **dayjs** | Lightweight date manipulation and formatting. |
    | :material-alphabetical: **Tabler Icons** | High-quality SVG icon system. |
    | :material-code-braces: **react-syntax-highlighter** | Syntax highlighting for code blocks in markdown. |
    | :material-drag: **@dnd-kit/core** | Drag-and-drop for recipe step reordering. |
    | :material-text: **react-markdown** | Markdown rendering for recipe descriptions and steps. |

---

## Component Architecture

### Component Hierarchy

The application follows a nested layout pattern. Providers at the root inject global state (Auth, Query Client, Theme) into the component tree.

```mermaid
graph TD
    Root["<b>main.tsx</b><br/>App Entry"]
    App["<b>App.tsx</b><br/>Providers (Auth, Query, Theme)"]
    Router["<b>React Router</b><br/>Routes & Outlets"]
    Layout["<b>Layout.tsx</b><br/>Main Shell"]
    Sidebar["<b>Sidebar.tsx</b><br/>Nav (FR-14)"]
    Header["<b>Header.tsx</b><br/>Profile (FR-3) + NotificationBell (FR-38)"]
    Page["<b>Feature Page</b><br/>(Lists, Stores, Recipes, Meals, etc.)"]
    Shared["<b>Common/</b><br/>Reusable UI"]

    Root --> App
    App --> Router
    Router --> Page
    Page --> Layout
    Layout --> Sidebar
    Layout --> Header
    Page --> Shared
```

### Folder Structure

```text
src/
├── App.tsx              # Application shell & providers
├── theme.ts             # Mantine theme configuration
├── components/          # Reusable components
│   ├── Layout.tsx       # Main layout wrapper (sidebar + header)
│   ├── ProtectedRoute.tsx # Auth guard
│   ├── PhotoUpload.tsx  # Reusable photo upload component
│   ├── NotificationBell.tsx # Header notification bell
│   ├── MarkdownContent.tsx  # Markdown renderer
│   ├── shopping/        # Shopping domain UI (modals, list items, barcodes)
│   └── recipes/         # Recipe domain UI (steps, feedback, export, markdown editor)
├── context/             # React Context (Auth)
├── hooks/               # Custom hooks (usePhotoUpload)
├── pages/               # Route-level components
│   ├── dashboard/       # Dashboard with widgets
│   ├── shopping/        # Shopping pages (lists, items, stores, categories)
│   ├── recipes/         # RecipesListPage, RecipeDetailPage, RecipeFormPage, MealPlannerPage
│   ├── notifications/   # NotificationsPage, MessagingPage
│   ├── settings/        # SettingsPage, PreferencesPage, MealTimesPage, NutrientSettingsPage
│   ├── user/            # ProfilePage
│   ├── errors/          # ErrorPage (404, etc.)
│   └── auth/            # LoginPage
├── services/
│   └── api.tsx          # Fetch client with CSRF support
├── types/               # TypeScript interfaces
│   ├── shopping.ts
│   ├── recipes.ts       # Recipe, Ingredient, Step, Comment, Rating, Label, Nutrient, NutritionEntry
│   ├── meals.ts         # MealTime, MealPlan, MealPlanEntry, MealPlanEntryItem, MealPlanEntryRecipe
│   ├── notifications.ts # Notification, Message
│   ├── user.ts          # UserProfile
│   ├── settings.ts      # AgeGroupConfig, FamilyRole, UserPreference
│   └── api.ts           # ProblemDetail, ApiError, PagedResponse
└── utils/               # Formatting & calculations (units, currency, photo)
```

---

## State Management

The application leverages **TanStack Query v5** to manage all asynchronous server state. This strategy minimizes unnecessary network traffic and ensures a highly responsive user interface.

### Server State & Caching

The "Server Cache" acts as the source of truth for all domain data. By configuring granular caching policies, the frontend achieves near-instant navigation between views.

!!! note "[:octicons-rocket-24: NFR-2: Performance (Latency)](../../requirements/shared.md#nfr-2)"

    To meet the 150ms latency target, reference data (Categories, Stores) is cached with a long `staleTime`, while volatile data (Shopping Lists) uses aggressive invalidation.

**Global Query Defaults:**
- **`staleTime: 5 * 60 * 1000`**: Data is considered "fresh" for 5 minutes.
- **`gcTime: 10 * 60 * 1000`**: Unused data is kept in memory for 10 minutes before garbage collection.
- **`retry: 1`**: Failed requests are retried once before showing an error UI.

**Example: Cached Store Data**
```typescript
export const useStores = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: () => api.get<Store[]>('/api/shopping/stores'),
    staleTime: 10 * 60 * 1000, // Stores change rarely (fresh for 10m)
  });
};
```

### Data Synchronization & Mutations

Mutations handle all data-modifying operations (POST, PUT, DELETE). To ensure the UI reflects changes immediately, the application employs two primary strategies: **Invalidation** and **Optimistic Updates**.

!!! note "[:octicons-sync-24: NFR-3: Reliability & Sync](../../requirements/shopping-list.md#nfr-3)"

    Mutations implement Optimistic Updates to ensure the UI remains responsive and functional even under high latency or intermittent connectivity.

#### Pattern: Optimistic Update (Item Check-off)

When a user checks off an item, the UI is updated immediately *before* the server responds. If the server request fails, the UI is rolled back to the previous state.

```typescript
export const useCheckItem = (listId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => api.patch(`/api/shopping/lists/${listId}/items/${itemId}/toggle`),
    
    // Step 1: Cancel outgoing fetches
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-list', listId] });
      const previousList = queryClient.getQueryData(['shopping-list', listId]);

      // Step 2: Optimistically update the cache
      queryClient.setQueryData(['shopping-list', listId], (old: ShoppingList) => ({
        ...old,
        items: old.items.map(i => i.id === itemId ? { ...i, bought: !i.bought } : i)
      }));

      return { previousList }; // Return context for rollback
    },

    // Step 3: Rollback on error
    onError: (err, itemId, context) => {
      queryClient.setQueryData(['shopping-list', listId], context?.previousList);
      notifications.show({ color: 'red', message: 'Failed to sync update' });
    },

    // Step 4: Always refetch after error or success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
    },
  });
};
```

---

## Navigation & Layout

### Modular Sidebar

!!! note "[:material-menu: FR-14: Module Navigation](../../requirements/shared.md#fr-14)"

    The application implements a persistent, nested navigation system that adapts to user roles and persists its state across sessions.

- **Persistence:** The expanded/collapsed state of parent menus (Shopping, Settings) is persisted in `localStorage`.
- **RBAC:** Navigation items are conditionally rendered based on the user's Age Group (e.g., Settings is hidden for "Child" or "Teenager").

### User Profile Quick View

!!! note "[:material-account-box: FR-3: User Profile Quick View](../../requirements/auth-profile.md#fr-3)"

    The header dropdown provides an immediate summary of the user's identity, including dynamic social links and role status.

- Rendered as a dropdown in the `Header`.
- Displays dynamic icons for LinkedIn, Facebook, and Instagram based on the presence of profile URLs.
- Provides a direct link to the full Profile Update page.

---

## UI Logic & Specialized Rendering

### Barcode Generation

!!! note "[:material-barcode-scan: FR-12: Loyalty Cards](../../requirements/shopping-list.md#fr-12)"

    Digital loyalty cards are rendered as industry-standard linear barcodes (Code 128) or QR codes to ensure compatibility with physical store scanners.

```tsx
<Barcode 
  value={cardNumber} 
  format="CODE128" 
  width={2} 
  height={100} 
  displayValue={false} 
/>
```

### Coupon Urgency Logic

!!! note "[:material-alert-decagram: FR-15: Expiration Warning Panel](../../requirements/shopping-list.md#fr-15)"

    The dashboard proactively highlights coupons nearing their expiration date using a time-based urgency calculation.

```typescript
const isUrgent = (dueDate: string): boolean => {
  const daysRemaining = differenceInDays(new Date(dueDate), new Date());
  return daysRemaining <= 3; // Highlight within 3 days of expiry
};
```

---

## Implementation Standards

### Form Management
- All user inputs are handled via `@mantine/form`.
- **Validation:** Synchronous client-side validation for phone formats and URL patterns (matching backend regex).

### Build & Quality
- **Bundler:** Vite 6 for rapid HMR (Hot Module Replacement).
- **Gradle Integration:** The frontend build is wrapped in a Gradle task (`:home-app-frontend:build`) to ensure it runs during CI.
- **Linting:** Strict ESLint configuration using `eslint-plugin-react-refresh`.

---

## Recipes & Meals UI

### Recipe Step Drag-and-Drop

!!! note "[:material-format-list-numbered: FR-27: Preparation Steps](../../requirements/recipes-meals.md#fr-27)"

    Recipe steps support drag-and-drop reordering via `@dnd-kit/core`. When a user drops a step in a new position, the UI sends a reorder request with the new step ID sequence.

### Markdown Editing

Recipe descriptions and step instructions support **markdown** content. The existing `MarkdownContent.tsx` component handles rendering. For editing, a textarea with markdown preview toggle is used.

### Notification Bell

!!! note "[:material-bell: FR-38: In-App Notifications](../../requirements/notifications.md#fr-38)"

    The `Header.tsx` component includes a `NotificationBell` that displays an unread count badge. Clicking opens a dropdown with recent notifications. The count is polled via TanStack Query.

### Meals This Week Dashboard Widget

!!! note "[:material-view-week: FR-35: Meals This Week](../../requirements/recipes-meals.md#fr-35)"

    The Dashboard includes a "Meals This Week" card showing today's planned meals with recipe names and assigned members. A "View Full Week" link navigates to the dedicated `MealsThisWeekPage`.

### Navigation

The sidebar adds a **Recipes & Meals** parent menu with sub-items:

- :material-chef-hat: Recipes
- :material-calendar-week: Meal Planner

And a **Settings** parent menu with sub-items:

- :material-account-cog: Family & Roles
- :material-heart-pulse: Preferences
- :material-clock-edit: Meal Times
- :material-flask: Nutrients

Notifications are accessed via the **bell icon** in the header, not the sidebar.

---

## Related Documentation

- [:material-server: Backend Architecture](../backend/overview.md)
- [:material-api: API Design](../backend/api/index.md)
- [:material-test-tube: Test Architecture](../test-strategy/architecture.md)
