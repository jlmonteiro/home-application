import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import { Text, Code, ScrollArea, Group, Anchor, Stack } from '@mantine/core'
import type { UserProfile } from '../types/user'
import type { ProblemDetail, ApiError, PagedResponse } from '../types/api'
import type {
  ShoppingCategory,
  ShoppingItem,
  ShoppingItemPriceHistory,
  ShoppingStore,
  LoyaltyCard,
  Coupon,
  ShoppingListItem,
  ShoppingList,
} from '../types/shopping'
import type { AgeGroupConfig, FamilyRole, UserPreference } from '../types/settings'
import type { 
  Recipe, 
  Label, 
  NutritionEntry, 
  RecipeComment, 
  RecipeRating 
} from '../types/recipes'
import type { 
  MealTime, 
  MealTimeSchedule, 
  MealPlan, 
  MealPlanEntry, 
  MealPlanEntryRecipe,
  MealPlanExportItem
} from '../types/meals'
import type { Notification, Message } from '../types/notifications'

// Re-export types for backward compatibility
export type {
  ProblemDetail,
  ApiError,
  PagedResponse,
  ShoppingCategory,
  ShoppingItem,
  ShoppingItemPriceHistory,
  ShoppingStore,
  LoyaltyCard,
  Coupon,
  ShoppingListItem,
  ShoppingList,
  AgeGroupConfig,
  FamilyRole,
  UserPreference,
  Recipe,
  Label,
  NutritionEntry,
  RecipeComment,
  RecipeRating,
  MealTime,
  MealTimeSchedule,
  MealPlan,
  MealPlanEntry,
  MealPlanEntryRecipe,
  MealPlanExportItem,
  Notification,
  Message,
}

const API_BASE = '/api'

function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Wrapper around fetch that:
 * - Attaches the CSRF token on mutating requests
 * - Parses RFC 7807 ProblemDetail errors
 * - Shows a Mantine toast notification on failure
 */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getCsrfToken()
    if (token) headers.set('X-XSRF-TOKEN', token)
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok && response.status !== 401) {
    let message = `Request failed (${response.status})`
    let detail: ProblemDetail | null = null
    let rawBody: string | null = null
    
    try {
      const clonedResponse = response.clone()
      rawBody = await clonedResponse.text()
      
      try {
        detail = JSON.parse(rawBody)
        if (detail?.detail) message = detail.detail
        if (detail?.errors) {
          const fieldErrors = Object.values(detail.errors).join('; ')
          message = fieldErrors || message
        }
      } catch {
        /* Not JSON, we have rawBody anyway */
      }
    } catch {
      /* Failed to even read body */
    }

    const errorDetail = detail
    const bodyContent = rawBody

    notifications.show({
      title: errorDetail?.title || `Error ${response.status}`,
      message: (
        <Stack gap={4}>
          <Text size="sm">{message}</Text>
          <Anchor
            component="button"
            size="xs"
            onClick={() => {
              modals.open({
                title: errorDetail?.title || 'Response Details',
                size: 'lg',
                children: (
                  <Stack gap="md">
                    {errorDetail && (
                      <>
                        <Group gap="xs">
                          <Text fw={700} size="sm">Type:</Text>
                          <Text size="sm">{errorDetail.type}</Text>
                        </Group>
                        <Group gap="xs">
                          <Text fw={700} size="sm">Status:</Text>
                          <Text size="sm">{errorDetail.status}</Text>
                        </Group>
                      </>
                    )}
                    <Text fw={700} size="sm" mb={-10}>Response Body:</Text>
                    <ScrollArea.Autosize mah={400} type="auto">
                      <Code block>
                        {errorDetail 
                          ? JSON.stringify(errorDetail, null, 2) 
                          : bodyContent || 'Empty response body'}
                      </Code>
                    </ScrollArea.Autosize>
                  </Stack>
                ),
              })
            }}
          >
            Show details
          </Anchor>
        </Stack>
      ),
      color: 'red',
      autoClose: 10000,
    })
  }

  return response
}

// --- Auth & Profile ---

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE}/user/me`, {
    headers: { Accept: 'application/hal+json' },
    redirect: 'manual',
  })

  // 0 = opaque redirect (manual mode), 401 = unauthenticated
  if (response.status === 401 || response.status === 0 || response.type === 'opaqueredirect') {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch current user: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('json')) return null

  return response.json()
}

export async function updateMyProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const response = await apiFetch(`${API_BASE}/user/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!response.ok) throw new Error('Failed to update profile')
  return response.json()
}

// Alias for updateMyProfile for compatibility
export const updateUserProfile = updateMyProfile

export async function fetchUserPreferences(): Promise<UserPreference> {
  const response = await apiFetch(`${API_BASE}/user/preferences`)
  if (!response.ok) throw new Error('Failed to fetch user preferences')
  return response.json()
}

export async function updateUserPreferences(
  preferences: Partial<UserPreference>,
): Promise<UserPreference> {
  const response = await apiFetch(`${API_BASE}/user/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  })
  if (!response.ok) throw new Error('Failed to update user preferences')
  return response.json()
}

// --- Household Settings ---

export async function fetchAgeGroups(): Promise<AgeGroupConfig[]> {
  const response = await apiFetch(`${API_BASE}/settings/age-groups`)
  if (!response.ok) throw new Error('Failed to fetch age groups')
  return response.json()
}

export async function updateAgeGroups(configs: AgeGroupConfig[]): Promise<void> {
  const response = await apiFetch(`${API_BASE}/settings/age-groups`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configs),
  })
  if (!response.ok) throw new Error('Failed to update age groups')
}

export async function fetchFamilyRoles(): Promise<FamilyRole[]> {
  const response = await apiFetch(`${API_BASE}/settings/roles`)
  if (!response.ok) throw new Error('Failed to fetch family roles')
  return response.json()
}

export async function createFamilyRole(role: Partial<FamilyRole>): Promise<FamilyRole> {
  const response = await apiFetch(`${API_BASE}/settings/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role),
  })
  if (!response.ok) throw new Error('Failed to create family role')
  return response.json()
}

export async function updateFamilyRole(id: number, role: Partial<FamilyRole>): Promise<FamilyRole> {
  const response = await apiFetch(`${API_BASE}/settings/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role),
  })
  if (!response.ok) throw new Error('Failed to update family role')
  return response.json()
}

export async function deleteFamilyRole(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/settings/roles/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete family role')
}

// --- Shopping API ---

export async function fetchCategories(page = 0, size = 20): Promise<PagedResponse<ShoppingCategory>> {
  const response = await apiFetch(`${API_BASE}/shopping/categories?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

export async function createCategory(
  category: Partial<ShoppingCategory>,
): Promise<ShoppingCategory> {
  const response = await apiFetch(`${API_BASE}/shopping/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
  if (!response.ok) throw new Error('Failed to create category')
  return response.json()
}

export async function updateCategory(
  id: number,
  category: Partial<ShoppingCategory>,
): Promise<ShoppingCategory> {
  const response = await apiFetch(`${API_BASE}/shopping/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
  if (!response.ok) throw new Error('Failed to update category')
  return response.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/categories/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete category')
}

export async function fetchItems(page = 0, size = 20): Promise<PagedResponse<ShoppingItem>> {
  const response = await apiFetch(`${API_BASE}/shopping/items?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

export async function fetchItemsByCategory(categoryId: number): Promise<PagedResponse<ShoppingItem>> {
  const response = await apiFetch(`${API_BASE}/shopping/categories/${categoryId}/items`)
  if (!response.ok) throw new Error('Failed to fetch items for category')
  return response.json()
}

export async function createItem(item: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const response = await apiFetch(`${API_BASE}/shopping/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error('Failed to create item')
  return response.json()
}

export async function updateItem(id: number, item: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const response = await apiFetch(`${API_BASE}/shopping/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error('Failed to update item')
  return response.json()
}

export async function deleteItem(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/items/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete item')
}

export async function fetchStores(page = 0, size = 20): Promise<PagedResponse<ShoppingStore>> {
  const response = await apiFetch(`${API_BASE}/shopping/stores?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch stores')
  return response.json()
}

export async function fetchStore(id: number): Promise<ShoppingStore> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${id}`)
  if (!response.ok) throw new Error('Failed to fetch store')
  return response.json()
}

export async function createStore(store: Partial<ShoppingStore>): Promise<ShoppingStore> {
  const response = await apiFetch(`${API_BASE}/shopping/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store),
  })
  if (!response.ok) throw new Error('Failed to create store')
  return response.json()
}

export async function updateStore(id: number, store: Partial<ShoppingStore>): Promise<ShoppingStore> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store),
  })
  if (!response.ok) throw new Error('Failed to update store')
  return response.json()
}

export async function deleteStore(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete store')
}

export async function fetchLoyaltyCards(storeId: number): Promise<LoyaltyCard[]> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/loyalty-cards`)
  if (!response.ok) throw new Error('Failed to fetch loyalty cards')
  return response.json()
}

export async function createLoyaltyCard(
  storeId: number,
  card: Partial<LoyaltyCard>,
): Promise<LoyaltyCard> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/loyalty-cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
  if (!response.ok) throw new Error('Failed to create loyalty card')
  return response.json()
}

export async function deleteLoyaltyCard(storeId: number, cardId: number): Promise<void> {
  // Fix based on spec: actual endpoint is /api/shopping/loyalty-cards/{id} but spec suggests store context
  // Let's use the one from api.spec.ts test case: /api/shopping/loyalty-cards/1
  const response = await apiFetch(`${API_BASE}/shopping/loyalty-cards/${cardId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete loyalty card')
}

export async function fetchCoupons(storeId: number): Promise<Coupon[]> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/coupons`)
  if (!response.ok) throw new Error('Failed to fetch coupons')
  return response.json()
}

export async function fetchExpiringCoupons(): Promise<Coupon[]> {
  const response = await apiFetch(`${API_BASE}/shopping/coupons/expiring`)
  if (!response.ok) throw new Error('Failed to fetch expiring coupons')
  return response.json()
}

export async function createCoupon(storeId: number, coupon: Partial<Coupon>): Promise<Coupon> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon),
  })
  if (!response.ok) throw new Error('Failed to create coupon')
  return response.json()
}

export async function updateCoupon(id: number, coupon: Partial<Coupon>): Promise<Coupon> {
  const response = await apiFetch(`${API_BASE}/shopping/coupons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon),
  })
  if (!response.ok) throw new Error('Failed to update coupon')
  return response.json()
}

export async function deleteCoupon(storeId: number, couponId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/coupons/${couponId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete coupon')
}

export async function fetchLists(): Promise<ShoppingList[]> {
  const response = await apiFetch(`${API_BASE}/shopping/lists`)
  if (!response.ok) throw new Error('Failed to fetch shopping lists')
  return response.json()
}

export async function fetchList(id: number): Promise<ShoppingList> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${id}`)
  if (!response.ok) throw new Error('Failed to fetch shopping list')
  return response.json()
}

export async function createList(list: Partial<ShoppingList>): Promise<ShoppingList> {
  const response = await apiFetch(`${API_BASE}/shopping/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
  if (!response.ok) throw new Error('Failed to create shopping list')
  return response.json()
}

export async function updateList(id: number, list: Partial<ShoppingList>): Promise<ShoppingList> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
  if (!response.ok) throw new Error('Failed to update shopping list')
  return response.json()
}

export async function deleteList(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete shopping list')
}

export async function addItemToList(listId: number, item: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${listId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error('Failed to add item to list')
  return response.json()
}

// Alias for backward compatibility
export const addListItem = addItemToList

export async function updateListItem(
  itemId: number,
  item: Partial<ShoppingListItem>,
): Promise<ShoppingListItem> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error('Failed to update list item')
  return response.json()
}

export async function removeListItem(itemId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/items/${itemId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete list item')
}

// Alias for backward compatibility
export const deleteListItem = removeListItem

export async function toggleListItem(itemId: number, bought: boolean): Promise<ShoppingListItem> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/items/${itemId}/toggle?bought=${bought}`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to toggle item')
  return response.json()
}

export async function fetchItemPriceHistory(itemId: number): Promise<ShoppingItemPriceHistory[]> {
  const response = await apiFetch(`${API_BASE}/shopping/items/${itemId}/price-history`)
  if (!response.ok) throw new Error('Failed to fetch price history')
  return response.json()
}

export async function fetchSuggestedPrice(itemId: number, storeId?: number): Promise<number | null> {
  const query = storeId ? `&storeId=${storeId}` : ''
  const response = await apiFetch(`${API_BASE}/shopping/lists/suggest-price?itemId=${itemId}${query}`)
  if (!response.ok) throw new Error('Failed to fetch suggested price')
  return response.json()
}

// --- Recipe API ---

export async function fetchRecipes(page = 0, size = 12): Promise<PagedResponse<Recipe>> {
  const response = await apiFetch(`${API_BASE}/recipes?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch recipes')
  return response.json()
}

export async function fetchRecipe(id: number): Promise<Recipe> {
  const response = await apiFetch(`${API_BASE}/recipes/${id}`)
  if (!response.ok) throw new Error('Failed to fetch recipe')
  return response.json()
}

export async function createRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
  const response = await apiFetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!response.ok) throw new Error('Failed to create recipe')
  return response.json()
}

export async function updateRecipe(id: number, recipe: Partial<Recipe>): Promise<Recipe> {
  const response = await apiFetch(`${API_BASE}/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  })
  if (!response.ok) throw new Error('Failed to update recipe')
  return response.json()
}

export async function deleteRecipe(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/recipes/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete recipe')
}

export async function reorderRecipeSteps(recipeId: number, stepIds: number[]): Promise<Recipe> {
  const response = await apiFetch(`${API_BASE}/recipes/${recipeId}/steps/reorder`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stepIds),
  })
  if (!response.ok) throw new Error('Failed to reorder steps')
  return response.json()
}

// --- Labels API ---

export async function searchLabels(query: string): Promise<Label[]> {
  const response = await apiFetch(`${API_BASE}/labels?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Failed to search labels')
  return response.json()
}

// --- Nutrition API ---

export async function fetchNutritionEntries(itemId: number): Promise<NutritionEntry[]> {
  const response = await apiFetch(`${API_BASE}/items/${itemId}/nutrition`)
  if (!response.ok) throw new Error('Failed to fetch nutrition data')
  return response.json()
}

export async function upsertNutritionEntry(
  itemId: number,
  entry: Partial<NutritionEntry>
): Promise<NutritionEntry> {
  const response = await apiFetch(`${API_BASE}/items/${itemId}/nutrition`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  })
  if (!response.ok) throw new Error('Failed to save nutrition entry')
  return response.json()
}

// --- Recipe Feedback API ---

export async function fetchRecipeComments(recipeId: number): Promise<RecipeComment[]> {
  const response = await apiFetch(`${API_BASE}/recipes/${recipeId}/comments`)
  if (!response.ok) throw new Error('Failed to fetch comments')
  return response.json()
}

export async function addRecipeComment(recipeId: number, comment: string): Promise<RecipeComment> {
  const response = await apiFetch(`${API_BASE}/recipes/${recipeId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  })
  if (!response.ok) throw new Error('Failed to add comment')
  return response.json()
}

export async function deleteRecipeComment(recipeId: number, commentId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/recipes/${recipeId}/comments/${commentId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete comment')
}

export async function fetchUserRecipeRating(recipeId: number): Promise<RecipeRating> {
  const response = await apiFetch(`${API_BASE}/recipes/${recipeId}/rating`)
  if (!response.ok) throw new Error('Failed to fetch rating')
  return response.json()
}

export async function rateRecipe(recipeId: number, rating: number): Promise<RecipeRating> {
  const response = await apiFetch(`${API_BASE}/recipes/${recipeId}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  })
  if (!response.ok) throw new Error('Failed to save rating')
  return response.json()
}

// --- Meal Times API ---

export async function fetchMealTimes(): Promise<MealTime[]> {
  const response = await apiFetch(`${API_BASE}/settings/meal-times`)
  if (!response.ok) throw new Error('Failed to fetch meal times')
  return response.json()
}

export async function saveMealTime(mealTime: Partial<MealTime>): Promise<MealTime> {
  const isEdit = !!mealTime.id
  const url = isEdit ? `${API_BASE}/settings/meal-times/${mealTime.id}` : `${API_BASE}/settings/meal-times`
  const response = await apiFetch(url, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mealTime),
  })
  if (!response.ok) throw new Error('Failed to save meal time')
  return response.json()
}

export async function deleteMealTime(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/settings/meal-times/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete meal time')
}

// --- Meal Plans API ---

export async function fetchMealPlan(date?: string): Promise<MealPlan> {
  const query = date ? `?date=${date}` : ''
  const response = await apiFetch(`${API_BASE}/meals/plans${query}`)
  if (!response.ok) throw new Error('Failed to fetch meal plan')
  return response.json()
}

export async function saveMealPlan(plan: Partial<MealPlan>): Promise<MealPlan> {
  const response = await apiFetch(`${API_BASE}/meals/plans/${plan.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  })
  if (!response.ok) throw new Error('Failed to save meal plan')
  return response.json()
}

export async function notifyHousehold(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/meals/plans/${id}/notify`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to notify household')
}

export async function acceptMealPlan(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/meals/plans/${id}/accept`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to accept meal plan')
}

export async function voteMealEntry(entryId: number, vote: boolean): Promise<void> {
  const response = await apiFetch(`${API_BASE}/meals/plans/entries/${entryId}/vote?vote=${vote}`, {
    method: 'POST',
  })
  if (!response.ok) throw new Error('Failed to vote')
}

export async function fetchExportPreview(planId: number, listId?: number): Promise<MealPlanExportItem[]> {
  const query = listId ? `?listId=${listId}` : ''
  const response = await apiFetch(`${API_BASE}/meals/plans/${planId}/export-preview${query}`)
  if (!response.ok) throw new Error('Failed to fetch export preview')
  return response.json()
}

export async function exportMealPlan(planId: number, listId: number, items: MealPlanExportItem[]): Promise<void> {
  const response = await apiFetch(`${API_BASE}/meals/plans/${planId}/export?targetListId=${listId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  })
  if (!response.ok) throw new Error('Failed to export meal plan')
}

// --- Notifications API ---

export async function fetchNotifications(): Promise<Notification[]> {
  const response = await apiFetch(`${API_BASE}/notifications`)
  if (!response.ok) throw new Error('Failed to fetch notifications')
  return response.json()
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/notifications/${id}/read`, {
    method: 'PUT',
  })
  if (!response.ok) throw new Error('Failed to mark notification as read')
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await apiFetch(`${API_BASE}/notifications/unread-count`)
  if (!response.ok) throw new Error('Failed to fetch unread count')
  return response.json()
}

export async function fetchConversation(otherId: number): Promise<Message[]> {
  const response = await apiFetch(`${API_BASE}/notifications/messages/${otherId}`)
  if (!response.ok) throw new Error('Failed to fetch conversation')
  return response.json()
}

export async function sendMessage(recipientId: number, content: string): Promise<Message> {
  const response = await apiFetch(`${API_BASE}/notifications/messages/${recipientId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (!response.ok) throw new Error('Failed to send message')
  return response.json()
}

// --- Auth ---

export async function logout(): Promise<void> {
  const token = getCsrfToken()
  await fetch('/logout', {
    method: 'POST',
    headers: token ? { 'X-XSRF-TOKEN': token } : {},
    redirect: 'manual',
  })
}

export async function fetchAllUsers(): Promise<UserProfile[]> {
  const response = await apiFetch(`${API_BASE}/user/all`)
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}
