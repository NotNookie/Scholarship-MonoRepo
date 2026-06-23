import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard, FileText, Megaphone, FilePlus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/apply', label: 'Apply', Icon: FilePlus },
  { to: '/applications', label: 'My Applications', Icon: FileText },
  { to: '/student/announcements', label: 'Announcements', Icon: Megaphone },
]

export function StudentLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-primary flex items-center px-6 shrink-0">
        <Link to="/dashboard" className="text-on-primary font-semibold text-sm tracking-wide">
          Iskolar ng Bayan
        </Link>
        <nav className="ml-8 hidden md:flex gap-6 text-sm">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'text-secondary font-medium'
                  : 'text-on-primary/80 hover:text-on-primary transition-colors'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm text-on-primary/80">
          <span className="hidden sm:inline">{user?.name ?? 'Scholar'}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 hover:text-on-primary transition-colors"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 bg-surface-alt p-6">
        <Outlet />
      </main>
    </div>
  )
}
