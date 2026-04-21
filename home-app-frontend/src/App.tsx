import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/auth/LoginPage'
import { Dashboard } from './pages/dashboard/Dashboard'
import { ProfilePage } from './pages/user/ProfilePage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { PreferencesPage } from './pages/settings/PreferencesPage'
import { MealTimesPage } from './pages/settings/MealTimesPage'
import { NutrientSettingsPage } from './pages/settings/NutrientSettingsPage'


import { ShoppingCategoriesPage } from './pages/shopping/ShoppingCategoriesPage'
import { ShoppingItemsPage } from './pages/shopping/ShoppingItemsPage'
import { StoresPage } from './pages/shopping/StoresPage'
import { StoreDetailsPage } from './pages/shopping/StoreDetailsPage'
import { ShoppingListsPage } from './pages/shopping/ShoppingListsPage'
import { ShoppingListDetailsPage } from './pages/shopping/ShoppingListDetailsPage'
import { RecipesListPage } from './pages/recipes/RecipesListPage'
import { RecipeDetailPage } from './pages/recipes/RecipeDetailPage'
import { RecipeFormPage } from './pages/recipes/RecipeFormPage'
import { MealPlannerPage } from './pages/recipes/MealPlannerPage'
import { NotificationsPage } from './pages/notifications/NotificationsPage'
import { MessagingPage } from './pages/notifications/MessagingPage'
import { ErrorPage } from './pages/errors/ErrorPage'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <>
            <Notifications />
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="preferences" element={<PreferencesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="messages/:recipientId" element={<MessagingPage />} />
                <Route path="settings">
                  <Route index element={<SettingsPage />} />
                  <Route path="meal-times" element={<MealTimesPage />} />
                  <Route path="nutrients" element={<NutrientSettingsPage />} />
                </Route>

                {/* Shopping Routes */}
                <Route path="shopping">
                  <Route path="categories" element={<ShoppingCategoriesPage />} />
                  <Route path="items" element={<ShoppingItemsPage />} />
                  <Route path="stores" element={<StoresPage />} />
                  <Route path="stores/:id" element={<StoreDetailsPage />} />
                  <Route path="lists" element={<ShoppingListsPage />} />
                  <Route path="lists/:id" element={<ShoppingListDetailsPage />} />
                </Route>

                {/* Recipe Routes */}
                <Route path="recipes">
                  <Route index element={<RecipesListPage />} />
                  <Route path="planner" element={<MealPlannerPage />} />
                  <Route path="new" element={<RecipeFormPage />} />
                  <Route path=":id" element={<RecipeDetailPage />} />
                  <Route path=":id/edit" element={<RecipeFormPage />} />
                </Route>
              </Route>

              <Route path="*" element={<ErrorPage type="404" />} />
            </Routes>
          </>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
