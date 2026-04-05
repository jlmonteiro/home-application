import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { LoadingOverlay } from '@mantine/core'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingOverlay visible />
  }

  if (user === null) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
