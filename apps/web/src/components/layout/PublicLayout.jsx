import { Outlet, Link, NavLink } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-primary flex items-center px-6 shrink-0">
        <Link to="/" className="text-on-primary font-semibold text-sm tracking-wide">
          Iskolar ng Bayan
        </Link>
        <nav className="ml-8 hidden md:flex gap-6 text-sm">
          {[
            { to: '/', label: 'Home' },
            { to: '/requirements', label: 'Requirements' },
            { to: '/announcements', label: 'Announcements' },
            { to: '/forms', label: 'Forms' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
        <div className="ml-auto flex items-center gap-3 text-sm">
          <Link
            to="/login"
            className="text-on-primary/80 hover:text-on-primary transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-secondary text-on-secondary px-4 py-1.5 rounded font-semibold hover:bg-secondary-light transition-colors"
          >
            Register
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-border px-6 py-4 text-sm text-content-muted flex items-center justify-between">
        <span>© {new Date().getFullYear()} Municipality of Sta. Cruz, Laguna — LYDO</span>
        <Link to="/admin/login" className="hover:text-primary transition-colors text-xs">
          Admin Portal
        </Link>
      </footer>
    </div>
  )
}
