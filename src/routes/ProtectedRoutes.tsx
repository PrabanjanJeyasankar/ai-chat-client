import { useAuthStore } from '@/domain/auth/auth.store'
import { Navigate, Outlet } from 'react-router-dom'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />
  }

  return <Outlet />
}
