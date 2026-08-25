// Where each role lands after a successful login. The centralized login page
// routes by role, so this is the single source of truth for that mapping.
export function roleHome(role) {
  return role === 'student' ? '/dashboard' : '/admin/dashboard'
}
