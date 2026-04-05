import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingOverlay, Alert, Box } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isError } = useAuth()

  if (isLoading) {
    return (
      <Box pos="relative" h="100vh">
        <LoadingOverlay visible overlayProps={{ blur: 2 }} />
      </Box>
    )
  }

  if (isError) {
    return (
      <Alert variant="light" color="red" title="Authentication Error" icon={<IconAlertCircle />}>
        Failed to verify your session. Please try refreshing the page or check your connection to
        the backend.
      </Alert>
    )
  }

  if (user === null) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
