import { Link } from 'react-router-dom'
import { FilePlus, FileText, Megaphone, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const QUICK_LINKS = [
  {
    to: '/apply',
    Icon: FilePlus,
    label: 'New Application',
    desc: 'Submit a scholarship application for this academic year.',
    cta: 'Apply Now',
    accent: 'bg-primary text-on-primary hover:bg-primary-dark',
  },
  {
    to: '/applications',
    Icon: FileText,
    label: 'My Applications',
    desc: 'Track the status of your submitted applications and upload documents.',
    cta: 'View',
    accent: 'bg-surface border border-border text-primary hover:border-primary',
  },
  {
    to: '/student/announcements',
    Icon: Megaphone,
    label: 'Announcements',
    desc: 'Stay updated with the latest news from the LYDO office.',
    cta: 'Read',
    accent: 'bg-surface border border-border text-primary hover:border-primary',
  },
]

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.first_name ?? user?.name?.split(' ')[0] ?? 'Scholar'

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content">Welcome back, {firstName}.</h1>
        <p className="text-sm text-content-muted mt-1">
          Manage your scholarship application and stay informed.
        </p>
      </div>

      <div className="grid gap-4">
        {QUICK_LINKS.map(({ to, Icon, label, desc, cta, accent }) => (
          <div key={to} className="bg-surface rounded-xl shadow-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
              <Icon size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-content">{label}</p>
              <p className="text-xs text-content-muted mt-0.5 leading-snug">{desc}</p>
            </div>
            <Link
              to={to}
              className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0 ${accent}`}
            >
              {cta}
              <ChevronRight size={13} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
