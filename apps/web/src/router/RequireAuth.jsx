import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function RequireAuth({ children, roles }) {
  const { user, token } = useAuthStore()
  const location = useLocation()

  if (!token || !user) {
    const isAdmin = location.pathname.startsWith('/admin')
    return (
      <Navigate
        to={isAdmin ? '/admin/login' : '/login'}
        state={{ from: location }}
        replace
      />
    )
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
