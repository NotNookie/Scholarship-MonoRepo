import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useImpersonation } from '../store/impersonationStore'

export function RequireAuth({ children, roles }) {
  const { user, token, hasHydrated } = useAuthStore()
  const impersonating = useImpersonation((s) => !!s.tenant)
  const location = useLocation()

  // Wait for persisted auth to load before deciding — otherwise a hard refresh
  // of a gated page bounces to /login before rehydration runs.
  if (!hasHydrated) return null

  if (!token || !user) {
    // Centralized login — everyone signs in at /login; it routes by role.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    // An operator impersonating a municipality gets that tenant's admin access.
    const impersonationGrants = impersonating && (roles.includes('admin') || roles.includes('staff'))
    if (!impersonationGrants) return <Navigate to="/" replace />
  }

  return children
}
