import { Link } from 'react-router-dom'
import {
  Wrench,
  Award,
  SlidersHorizontal,
  ListChecks,
  CalendarRange,
  Building2,
  UserCog,
  ArrowRight,
} from 'lucide-react'

// ── Hub cards ─────────────────────────────────────────────────

const CARDS = [
  {
    Icon: Award,
    title: 'Scholarship Policies',
    description: 'Define programs, GWA thresholds, income caps, and eligibility tags for each scholarship.',
    to: '/admin/maintenance/policies',
    action: 'Manage Policies',
  },
  {
    Icon: ListChecks,
    title: 'Document Checklist',
    description: 'Maintain the master list of required application documents and whether each is mandatory.',
    to: '/admin/maintenance/cycles',
    action: 'Manage Checklist',
  },
  {
    Icon: CalendarRange,
    title: 'Application Periods',
    description: 'Schedule opening dates, deadlines, and review windows for each academic cycle.',
    to: '/admin/maintenance/cycles',
    action: 'Manage Periods',
  },
  {
    Icon: Building2,
    title: 'Organization Profile',
    description: 'Update office name, logo, contact details, tagline, and UI theme for the public portal.',
    to: '/admin/maintenance/profile',
    action: 'Manage Profile',
  },
  {
    Icon: UserCog,
    title: 'System Roles',
    description: 'Assign permissions, manage administrative accounts, and audit access.',
    to: '/admin/users',
    action: 'Manage Roles',
  },
  {
    Icon: SlidersHorizontal,
    title: 'Eligibility Rules',
    description: 'Set baseline requirements (residency, voter status, income limits, attestations) that apply to all programs.',
    to: '/admin/maintenance/eligibility',
    action: 'Manage Rules',
  },
]

function HubCard({ Icon, title, description, to, action, comingSoon }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center">
          <Icon size={20} className="text-primary" />
        </div>
        {comingSoon && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-alt text-content-muted border border-border">
            Coming soon
          </span>
        )}
      </div>
      <h3 className="text-base font-bold text-content mt-4">{title}</h3>
      <p className="text-sm text-content-muted mt-1.5 leading-relaxed flex-1">{description}</p>
      {!comingSoon && (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-4 group-hover:gap-2 transition-all">
          {action} <ArrowRight size={15} />
        </span>
      )}
    </>
  )

  if (comingSoon) {
    return (
      <div className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col opacity-70">{inner}</div>
    )
  }

  return (
    <Link to={to} className="group bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col hover:border-primary hover:shadow-modal transition-all">
      {inner}
    </Link>
  )
}

export function MaintenancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
          <Wrench size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">System Maintenance Hub</h1>
          <p className="text-sm text-content-muted mt-1">
            Configure global scholarship policies, application cycles, required documents, and organizational settings — without touching code.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CARDS.map((c) => <HubCard key={c.title} {...c} />)}
      </div>
    </div>
  )
}
