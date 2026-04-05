import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './App.css'

const queryClient = new QueryClient()

// Placeholder components for routing
const LoginPage = () => <div>Login Page</div>
const Dashboard = () => <div>Dashboard</div>

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Notifications />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
