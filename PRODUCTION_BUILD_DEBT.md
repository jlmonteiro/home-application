# Production Build Tech Debt

**Status:** `npm run build` fails with 9 TypeScript errors

---

## Errors Summary

### 1. Mantine v7 ThemeIcon API Changes

**Files:**
- `src/pages/settings/PreferencesPage.tsx:93,117,141`

**Issue:** Mantine v7 removed `variant="white"` for ThemeIcon. Use `variant="subtle"` instead.

**Fix:**
```tsx
// Before
<ThemeIcon variant="white" color="indigo" withBorder>

// After  
<ThemeIcon variant="subtle" color="indigo" withBorder>
```

---

### 2. Tabler Icons v3 API Changes

**Files:**
- `src/pages/shopping/ShoppingCategoriesPage.tsx:175,292`

**Issue:** Tabler Icons v3 removed `size` prop. Use `style={{ width, height }}` instead.

**Fix:**
```tsx
// Before
<IconComponent size={18} stroke={1.5} />

// After
<IconComponent style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
```

---

### 3. ShoppingListItem.store Type Mismatch

**File:** `src/pages/shopping/ShoppingListDetailsPage.tsx:359`

**Issue:** Type expects `number | null` but code passes `number | null | undefined`.

**Fix:** Ensure store is explicitly `null` or cast appropriately.

---

### 4. StoreDetailsPage Coupon Type Mismatch

**Files:**
- `src/pages/shopping/StoreDetailsPage.tsx:259,540,586`

**Issue:** `createCoupon` expects specific shape but form state doesn't match. The Coupon type has `barcode` but form uses `code`/`barcodeType` fields.

**Fix Options:**

**Option A - Update Coupon type to match form:**
```typescript
interface CouponFormValues {
  name: string
  description?: string
  value?: string
  dueDate?: string
  code?: string
  barcodeType?: 'QR' | 'CODE_128'
}
```

**Option B - Transform form values before API call:**
```typescript
const payload = {
  name: values.name,
  barcode: values.code ? { code: values.code, type: values.barcodeType } : undefined,
  // ... other fields
}
```

---

## Priority

| Priority | Issue | Impact |
|----------|-------|--------|
| High | Build fails | Can't deploy |
| Medium | Coupon type mismatch | May cause runtime errors |
| Low | ThemeIcon/Icon API | Visual only |

---

## Recommended Approach

1. **Quick wins:** Fix ThemeIcon variants and Icon size props (3 files, ~5 min)
2. **Medium effort:** Fix ShoppingListItem.store type (1 file, ~5 min)
3. **Architectural:** Refactor Coupon form to use proper type (1 file, ~15 min)

---

## Commands to Verify

```bash
# Check current build status
npm run build 2>&1 | grep -E "error TS|error:"

# After fixes, should return 0
npm run build
```