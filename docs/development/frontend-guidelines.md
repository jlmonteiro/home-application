# Frontend Development Guidelines

## Overview

This document defines the technical standards and architectural patterns for the **React 19** frontend. The application uses **Mantine 7** for UI, **TanStack Query** for server state, and **TypeScript** for type safety.

---

## 1. Project Structure

```text
src/
├── App.tsx              # Providers, routing, layout
├── main.tsx             # Entry point, MantineProvider
├── theme.ts             # Mantine theme customization
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main shell with sidebar/header
│   ├── ProtectedRoute.tsx
│   ├── MarkdownContent.tsx
│   └── shopping/        # Domain-specific components
├── pages/               # Route-level components
│   ├── auth/
│   ├── dashboard/
│   ├── settings/
│   ├── shopping/
│   └── user/
├── services/
│   └── api.ts           # Centralized API layer
├── types/               # TypeScript interfaces
│   ├── api.ts
│   ├── shopping.ts
│   ├── settings.ts
│   ├── user.ts
│   └── index.ts         # Barrel re-export
├── utils/               # Pure utility functions
└── context/             # React Context providers
```

| Folder | Purpose |
| :----- | :------ |
| `pages/<domain>/` | Route-level components that own data fetching and state |
| `components/<domain>/` | Reusable, presentational UI components |
| `services/` | API client and HTTP logic |
| `types/<domain>.ts` | TypeScript interfaces grouped by domain |
| `utils/` | Pure helper functions with no side effects |
| `context/` | React Context providers (e.g., `AuthContext`) |

---

## 2. Component Architecture

### Pages vs Components

!!! success "Separation of Concerns"
    - :material-check-all: **Pages** (`pages/`) own data fetching (`useQuery`), mutations (`useMutation`), and state management.
    - :material-check-all: **Components** (`components/`) are presentational — they receive data and callbacks via props.
    - :material-alert-circle: Components in `components/` must **never** call `useQuery`, `useMutation`, or `fetch` directly.

### Decomposing Pages

When a page grows complex, extract modals, list rows, and repeated UI into `components/<domain>/`. Each extracted component gets its own file and props interface.

```text
pages/shopping/ShoppingListDetailsPage.tsx   ← owns data, state, mutations
components/shopping/ListItemRow.tsx           ← renders a single item row
components/shopping/EditListModal.tsx         ← edit form modal
components/shopping/AddItemModal.tsx          ← add item modal
components/shopping/PriceHistoryModal.tsx     ← price chart modal
```

!!! tip "When to Extract"
    Extract a component when it has a clear responsibility (a modal, a list row, a display widget) or when the page file exceeds ~300 lines.

### Props Interfaces

Every component defines a named `<Component>Props` interface directly above the component function.

```tsx
interface ListItemRowProps {
  item: ShoppingListItem
  listStatus: string
  onToggleBought: (id: number, bought: boolean) => void
  onEdit: (item: ShoppingListItem) => void
  onRemove: (id: number) => void
}

export function ListItemRow({ item, listStatus, onToggleBought, onEdit, onRemove }: ListItemRowProps) {
```

### Named Exports

!!! success "Export Convention"
    - :material-check-all: Use `export function ComponentName` — named exports improve refactoring, auto-imports, and searchability.
    - :material-alert-circle: DO NOT use `export default` — the only exception is `App.tsx`.

---

## 3. TypeScript Conventions

Types are organized by domain in `types/`, with a barrel `index.ts` that re-exports everything.

| File | Content |
| :--- | :------ |
| `types/api.ts` | Shared types: `ProblemDetail`, `ApiError`, `PagedResponse<T>` |
| `types/shopping.ts` | `ShoppingList`, `ShoppingItem`, `Coupon`, `LoyaltyCard`, etc. |
| `types/user.ts` | `UserProfile` |
| `types/settings.ts` | `AgeGroupConfig`, `FamilyRole`, `UserPreference` |
| `types/index.ts` | Barrel: `export * from './api'`, etc. |

!!! success "Type Rules"
    - :material-check-all: Use `interface` for object shapes — no `I` prefix (`ShoppingList`, not `IShoppingList`).
    - :material-check-all: HATEOAS `_links` are typed as optional (`_links?: { self: { href: string } }`).
    - :material-alert-circle: NEVER use `any` — use `unknown` and narrow with type guards if needed.

---

## 4. API Service Layer

All HTTP logic lives in `services/api.ts`. A private `apiFetch` wrapper handles cross-cutting concerns:

- :material-shield-check: **CSRF** — extracts `XSRF-TOKEN` from cookies and attaches it as `X-XSRF-TOKEN` header on mutating requests
- :material-alert-circle: **Error Handling** — parses RFC 7807 `ProblemDetail` responses and shows Mantine toast notifications on failure
- :material-lock: **Auth** — 401 responses are silently passed through for the auth layer to handle

```typescript
// Public API functions — one per operation
export async function fetchLists(): Promise<ShoppingList[]> { ... }
export async function createList(data: Partial<ShoppingList>): Promise<ShoppingList> { ... }
export async function deleteList(id: number): Promise<void> { ... }
```

!!! warning "Single Source of Truth"
    All API calls MUST go through `apiFetch`. Never call `fetch()` directly from components or pages — this bypasses CSRF, error handling, and notification logic.

---

## 5. Data Fetching & State

### Queries

Use `useQuery` with domain-specific query keys. The key should reflect the resource being fetched.

```typescript
const { data: lists, isLoading } = useQuery({
  queryKey: ['shopping-lists'],
  queryFn: fetchLists,
})
```

### Mutations

Use `useMutation` with `onSuccess` to invalidate related queries and show a success notification.

```typescript
const createMutation = useMutation({
  mutationFn: (values: typeof form.values) => createList(values),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['shopping-lists'] })
    notifications.show({ message: 'Shopping list created', color: 'green' })
    close()
  },
})
```

### Auth Context

`AuthContext` provides the current user via `useQuery` with a 5-minute `staleTime`. Components access it through the `useAuth()` hook.

```typescript
const { user, isLoading, isError, logout } = useAuth()
```

!!! tip "Query Key Naming"
    Use descriptive, hierarchical keys: `['shopping-lists']`, `['shopping-list', id]`, `['stores']`, `['store', id, 'coupons']`.

---

## 6. Mantine UI Patterns

### Forms

Use `@mantine/form` with `useForm` and inline validation for all forms.

```typescript
const form = useForm({
  initialValues: { name: '', description: '' },
  validate: {
    name: (value) => (value.length < 2 ? 'Name must have at least 2 characters' : null),
  },
})
```

### Modals

Use `useDisclosure` from `@mantine/hooks` for modal open/close state.

```typescript
const [opened, { open, close }] = useDisclosure(false)
```

### Notifications

Use `notifications.show()` from `@mantine/notifications` for user feedback after mutations.

```typescript
notifications.show({ message: 'List deleted', color: 'green' })
```

### Icons

Use `@tabler/icons-react` exclusively. Do not mix icon libraries.

```tsx
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react'
```

### Styling

!!! tip "Prefer Mantine Style Props"
    Use Mantine's built-in style props (`p`, `m`, `bg`, `c`, `fw`, `gap`, etc.) over inline `style` objects. They are theme-aware and responsive-friendly. Only fall back to `style` for truly custom CSS that Mantine doesn't cover.

```tsx
// ✅ Prefer
<Stack gap="md" p="lg" bg="gray.0">

// ❌ Avoid
<Stack style={{ gap: 16, padding: 24, backgroundColor: '#f8f9fa' }}>
```

---

## 7. Routing & Providers

### Provider Hierarchy

```text
main.tsx:  MantineProvider → ModalsProvider → App
App.tsx:   QueryClientProvider → AuthProvider → ModalsProvider → Notifications → BrowserRouter
```

### Protected Routes

The `ProtectedRoute` component checks auth state and redirects unauthenticated users to `/login`.

```tsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="shopping">
    <Route path="lists" element={<ShoppingListsPage />} />
    <Route path="lists/:id" element={<ShoppingListDetailsPage />} />
  </Route>
</Route>
```

!!! info "Route Grouping"
    Routes are nested by domain (`shopping`, `settings`, `user`). New features should follow this pattern rather than adding flat top-level routes.

---

## 8. Utilities

Pure helper functions live in `utils/`. They must have no side effects and include JSDoc.

```typescript
/**
 * Determine the correct image source for photos.
 * Handles direct URLs, data URIs, and base64 strings.
 */
export const getPhotoSrc = (photo: string | undefined | null): string | null => {
  if (!photo) return null
  if (photo.startsWith('http') || photo.startsWith('data:image')) return photo
  if (photo.startsWith('/')) return photo
  return `data:image/png;base64,${photo}`
}
```

!!! success "Utility Rules"
    - :material-check-all: Pure functions only — no side effects, no imports from React or Mantine.
    - :material-check-all: Include JSDoc describing the function's purpose.

---

## 9. Code Quality

| Tool | Configuration | Purpose |
| :--- | :------------ | :------ |
| **TypeScript** | `strict` mode | Type safety |
| **ESLint** | `recommended` + `strict` + `stylistic` | Code quality |
| **Prettier** | No semicolons, single quotes, trailing commas, 100 char width | Formatting |
| **react-hooks** | ESLint plugin | Hook rules enforcement |
| **react-refresh** | ESLint plugin | HMR compatibility |

!!! info "Automated Formatting"
    Formatting is enforced by Prettier via ESLint. Do not override Prettier rules in individual files. Run `npm run lint` to check compliance.

---

## AI Alignment

!!! info "Directives for AI Agents"
    - :material-gavel: ALWAYS use named exports for components and pages — no `export default`.
    - :material-gavel: ALWAYS define a `<Component>Props` interface for component props.
    - :material-gavel: ALWAYS place pages in `pages/<domain>/` and reusable components in `components/<domain>/`.
    - :material-gavel: ALWAYS use TanStack Query for data fetching — never fetch in `useEffect`.
    - :material-gavel: ALWAYS use `apiFetch` from `services/api.ts` — never call `fetch` directly.
    - :material-gavel: ALWAYS invalidate relevant queries after mutations.
    - :material-gavel: ALWAYS use `notifications.show()` for user feedback after mutations.
    - :material-gavel: ALWAYS use `@tabler/icons-react` for icons — do not mix icon libraries.
    - :material-gavel: ALWAYS define types in `types/<domain>.ts` — never use `any`.
    - :material-gavel: PREFER Mantine style props over inline `style` objects.
    - :material-gavel: KEEP components in `components/` pure — no `useQuery`, no direct API calls.
    - :material-gavel: EXTRACT modals, list rows, and repeated UI from pages into `components/<domain>/`.
    - :material-gavel: USE `useForm` for all form state and validation.
    - :material-gavel: USE `useDisclosure` for modal open/close state.
