import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/auth/LoginPage'
import { Dashboard } from './pages/dashboard/Dashboard'
import { ProfilePage } from './pages/user/ProfilePage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { PreferencesPage } from './pages/settings/PreferencesPage'
import { ShoppingCategoriesPage } from './pages/shopping/ShoppingCategoriesPage'
import { ShoppingItemsPage } from './pages/shopping/ShoppingItemsPage'
import { StoresPage } from './pages/shopping/StoresPage'
import { StoreDetailsPage } from './pages/shopping/StoreDetailsPage'
import { ShoppingListsPage } from './pages/shopping/ShoppingListsPage'
import { ShoppingListDetailsPage } from './pages/shopping/ShoppingListDetailsPage'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalsProvider>
          <Notifications />
          <BrowserRouter>
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
                <Route path="settings" element={<SettingsPage />} />

                {/* Shopping Routes */}
                <Route path="shopping">
                  <Route path="categories" element={<ShoppingCategoriesPage />} />
                  <Route path="items" element={<ShoppingItemsPage />} />
                  <Route path="stores" element={<StoresPage />} />
                  <Route path="stores/:id" element={<StoreDetailsPage />} />
                  <Route path="lists" element={<ShoppingListsPage />} />
                  <Route path="lists/:id" element={<ShoppingListDetailsPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ModalsProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
