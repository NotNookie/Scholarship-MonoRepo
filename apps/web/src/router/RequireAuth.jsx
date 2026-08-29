import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RequireAuth({ children, roles }) {
  const { user, token, hasHydrated } = useAuthStore()
  const location = useLocation()

  // Wait for persisted auth to load before deciding — otherwise a hard refresh
  // of a gated page bounces to /login before rehydration runs.
  if (!hasHydrated) return null

  if (!token || !user) {
    // Centralized login — everyone signs in at /login; it routes by role.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
