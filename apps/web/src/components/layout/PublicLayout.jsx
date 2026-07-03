import { Outlet, Link, NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/requirements', label: 'Requirements' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/forms', label: 'Forms' },
]

const FOOTER_LINKS = ['Privacy Policy', 'Terms of Service', 'Contact Us', 'FAQ']

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-surface border-b border-border flex items-center px-6 shrink-0">
        <Link to="/" className="text-primary font-bold text-sm tracking-wide shrink-0">
          Iskolar ng Bayan
        </Link>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <nav className="hidden md:flex items-center gap-6 mr-3">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  isActive
                    ? 'text-primary font-semibold border-b-2 border-primary pb-0.5'
                    : 'text-content-muted hover:text-content transition-colors'
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
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
        </div>{/* end ml-auto group */}
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
