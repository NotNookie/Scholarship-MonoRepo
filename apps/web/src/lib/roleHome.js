// Where each role lands after a successful login. The centralized login page
// routes by role, so this is the single source of truth for that mapping.
// Roles: scholar (student portal) · staff / admin (municipal admin portal) ·
// super_admin (platform operator console).
export function roleHome(role) {
  if (role === 'scholar') return '/dashboard'
  if (role === 'super_admin') return '/platform'
  return '/admin/dashboard'
}
