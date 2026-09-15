import { NavLink } from 'react-router-dom'

// Two views of one "Applications" section: the review workspace (queue) and the
// full browse/export table. One nav item, switched here.
const TABS = [
  { to: '/admin/applications', label: 'Review Queue' },
  { to: '/admin/applicants', label: 'All Applicants' },
]

export function ApplicationTabs() {
  return (
    <div className="inline-flex items-center gap-1 bg-surface-alt border border-border rounded-lg p-1 shrink-0">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) =>
            `text-sm font-semibold px-3 py-1.5 rounded-md transition-colors ${
              isActive ? 'bg-surface text-primary shadow-sm' : 'text-content-muted hover:text-content'
            }`
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  )
}
