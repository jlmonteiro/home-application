import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { ShoppingCategoriesPage } from './pages/ShoppingCategoriesPage'
import { ShoppingItemsPage } from './pages/ShoppingItemsPage'
import { StoresPage } from './pages/StoresPage'
import { StoreDetailsPage } from './pages/StoreDetailsPage'
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
                <Route path="settings" element={<SettingsPage />} />
                
                {/* Shopping Routes */}
                <Route path="shopping">
                  <Route path="categories" element={<ShoppingCategoriesPage />} />
                  <Route path="items" element={<ShoppingItemsPage />} />
                  <Route path="stores" element={<StoresPage />} />
                  <Route path="stores/:id" element={<StoreDetailsPage />} />
                  {/* Placeholders for future stories */}
                  <Route path="lists" element={<Dashboard />} />
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
