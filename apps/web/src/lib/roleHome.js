// Where each role lands after a successful login. The centralized login page
// routes by role, so this is the single source of truth for that mapping.
// Roles: scholar (student portal) · staff / admin (municipal admin portal) ·
// super_admin (platform — its portal isn't built yet, falls back to admin).
export function roleHome(role) {
  return role === 'scholar' ? '/dashboard' : '/admin/dashboard'
}
