// Where each role lands after a successful login. The centralized login page
// routes by role, so this is the single source of truth for that mapping.
// Roles: scholar (student portal) · staff / admin (municipal admin portal) ·
// super_admin (platform operator console).
export function roleHome(role) {
  if (role === 'scholar') return '/dashboard'
  if (role === 'super_admin') return '/platform'
  return '/admin/dashboard'
}

// Which portal a path belongs to. Public/student pages fall through to 'student'.
function portalOf(pathname) {
  if (pathname.startsWith('/platform')) return 'platform'
  if (pathname.startsWith('/admin')) return 'admin'
  return 'student'
}

// Which portal each role is allowed to be sent into by a post-login redirect.
const ROLE_PORTAL = {
  scholar: 'student',
  staff: 'admin',
  admin: 'admin',
  super_admin: 'platform',
}

// Resolve where to land after login. `from` is the page RequireAuth was trying
// to reach before it bounced the user to /login — but it can be stale (e.g. a
// previous user logged out from /admin, leaving `from` pointing there). Only
// honor it when it belongs to THIS role's portal; otherwise send them home.
export function resolveLanding(role, from) {
  if (from && portalOf(from) === ROLE_PORTAL[role]) return from
  return roleHome(role)
}
