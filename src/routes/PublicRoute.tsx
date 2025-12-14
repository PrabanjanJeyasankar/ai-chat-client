import { useAuthStore } from '@/domain/auth/auth.store'
import { Navigate, Outlet } from 'react-router-dom'

export function PublicRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to='/chat' replace />
  }

  return <Outlet />
}
