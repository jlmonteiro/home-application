import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingOverlay, Box } from '@mantine/core'
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

  if (isError || user === null) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
