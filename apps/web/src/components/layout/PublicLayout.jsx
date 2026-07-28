import { useState } from 'react'
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Settings, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { NotificationBell } from './NotificationBell'

const PUBLIC_NAV_ALWAYS = [
  { to: '/', label: 'Home', end: true },
  { to: '/scholarships', label: 'Scholarships', end: false },
  { to: '/requirements', label: 'Requirements', end: false },
]

const PUBLIC_NAV_ANNOUNCEMENTS = { to: '/announcements', label: 'Announcements', end: false }

const STUDENT_NAV = [
  { to: '/dashboard', label: 'Dashboard', end: false },
  { to: '/scholarship', label: 'My Scholarship', end: false },
  { to: '/student/announcements', label: 'Announcements', end: false },
]

const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Contact Us', 'FAQ']

const navLinkCls = ({ isActive }) =>
  isActive
    ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
    : 'text-content-muted hover:text-content transition-colors'

export function PublicLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const [menuOpen, setMenuOpen] = useState(false)
  const isStudent = user?.role === 'student'
  const firstName = user?.first_name ?? user?.name?.split(' ')[0] ?? null
  const fullName = user?.name ?? [user?.first_name, user?.last_name].filter(Boolean).join(' ')
  const initials = (fullName || 'S').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-surface border-b border-border flex items-center px-6 shrink-0 sticky top-0 z-30">
        <Link to={isStudent ? '/dashboard' : '/'} className="text-primary font-bold text-sm tracking-wide shrink-0 flex-1">
          Iskolar ng Bayan
        </Link>

        {/* Nav — centered */}
        <nav className="hidden md:flex items-center gap-5 text-sm shrink-0">
          {/* Public tabs — Scholarships is embedded in My Scholarship for students */}
          {PUBLIC_NAV_ALWAYS
            .filter(({ to }) => !(isStudent && to === '/scholarships'))
            .map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={navLinkCls}>
                {label}
              </NavLink>
            ))}

          {!isStudent && (
            <NavLink to={PUBLIC_NAV_ANNOUNCEMENTS.to} end={PUBLIC_NAV_ANNOUNCEMENTS.end} className={navLinkCls}>
              {PUBLIC_NAV_ANNOUNCEMENTS.label}
            </NavLink>
          )}

          {/* Separator + student tabs */}
          {isStudent && (
            <>
              <span className="w-px h-4 bg-border shrink-0" />
              {STUDENT_NAV.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={navLinkCls}>
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center gap-3 text-sm justify-end shrink-0">
          {isStudent ? (
            <>
              <NotificationBell />
              <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-border hover:border-primary transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:block text-xs font-medium text-content">{firstName ?? 'Scholar'}</span>
                <ChevronDown size={13} className={`text-content-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div role="menu" className="absolute right-0 mt-2 w-52 bg-surface border border-border rounded-xl shadow-dropdown z-20 overflow-hidden">
                    <Link role="menuitem" to="/settings" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-content hover:bg-surface-alt transition-colors">
                      <Settings size={15} className="text-content-muted" /> Account Settings
                    </Link>
                    <button role="menuitem" type="button" onClick={() => { setMenuOpen(false); handleLogout() }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-danger-light transition-colors border-t border-border">
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                </>
              )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/admin/login"
                className="border border-border text-content px-4 py-1.5 rounded font-medium hover:border-primary hover:text-primary transition-colors"
              >
                Admin Portal
              </Link>
              <Link
                to="/login"
                className="bg-primary text-on-primary px-4 py-1.5 rounded font-semibold hover:bg-primary-dark transition-colors"
              >
                Student Login
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-border px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <p className="text-sm font-semibold text-content">Iskolar ng Bayan</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {FOOTER_LINKS.map((label) => (
              <span key={label} className="text-xs text-content-muted hover:text-primary cursor-pointer transition-colors">
                {label}
              </span>
            ))}
          </div>
          <p className="text-xs text-content-disabled text-center">
            © {new Date().getFullYear()} Municipal Youth Development Office, Sta. Cruz, Laguna. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
