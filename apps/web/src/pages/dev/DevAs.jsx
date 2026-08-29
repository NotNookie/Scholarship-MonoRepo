import { useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// DEV-ONLY route (`/__dev-as/:role`) — logs in as a role and jumps to `?to=`,
// so an automated headless browser (or you) can reach an auth-gated page
// directly for screenshots, e.g. /__dev-as/super_admin?to=/platform&shot=1
// This route is only registered when import.meta.env.DEV is true.
const DEV_USERS = {
  scholar: { id: 1, name: 'Juan Dela Cruz', first_name: 'Juan', role: 'scholar', email: 'juan@test.com' },
  staff: { id: 2, name: 'Ana Reyes', first_name: 'Ana', role: 'staff', email: 'ana@stacruz.gov.ph' },
  admin: { id: 3, name: 'Maria Santos', first_name: 'Maria', role: 'admin', email: 'maria@stacruz.gov.ph' },
  super_admin: { id: 4, name: 'Platform Admin', first_name: 'Platform', role: 'super_admin', email: 'admin@iskolar.ph' },
}

export function DevAs() {
  const { role } = useParams()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  useEffect(() => {
    login(DEV_USERS[role] ?? DEV_USERS.super_admin, 'dev-token')
    navigate(sp.get('to') ?? '/', { replace: true })
    // Runs once on mount; the query is read synchronously.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
