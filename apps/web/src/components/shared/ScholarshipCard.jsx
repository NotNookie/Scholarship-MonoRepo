import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, Lock, Bookmark, ChevronRight, Banknote, GraduationCap } from 'lucide-react'

function StatusBadge({ status, daysLeft }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-tertiary-light text-tertiary-dark text-xs font-semibold px-2.5 py-1 rounded-md border border-tertiary/30">
        <CalendarCheck size={12} /> Accepting Applications
      </span>
    )
  }
  if (status === 'closing_soon') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-secondary-light text-on-secondary text-xs font-semibold px-2.5 py-1 rounded-md border border-secondary/30">
        <Clock size={12} /> Closes in {daysLeft} Days
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-surface-alt text-content-muted text-xs font-semibold px-2.5 py-1 rounded-md border border-border">
      <Lock size={12} /> Closed
    </span>
  )
}

/**
 * @param {string} ctaTo  where "View Details" links — /register for guests, /apply for logged-in students.
 */
export function ScholarshipCard({ scholarship, ctaTo = '/register' }) {
  const { name, category, status, daysLeft, eligibility, benefit } = scholarship
  const isClosed = status === 'closed'

  return (
    <article className={`bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-modal transition-shadow flex flex-col h-full relative overflow-hidden ${isClosed ? 'opacity-75' : ''}`}>
      <div className="absolute top-0 right-0 w-14 h-14 bg-primary/5 rounded-bl-full pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <StatusBadge status={status} daysLeft={daysLeft} />
        <Bookmark size={16} className="text-border hover:text-primary transition-colors cursor-pointer" />
      </div>

      <h3 className={`text-base font-bold leading-snug mb-1 ${isClosed ? 'text-content' : 'text-primary'}`}>{name}</h3>
      <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4">{category}</p>

      <div className="flex-1 flex flex-col gap-3 mb-5">
        <div className="flex items-start gap-2">
          <GraduationCap size={16} className="text-content-disabled shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-content-muted uppercase tracking-wide mb-0.5">Eligibility</p>
            <p className="text-xs text-content leading-snug line-clamp-2">{eligibility}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Banknote size={16} className="text-content-disabled shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-content-muted uppercase tracking-wide mb-0.5">Benefits</p>
            <p className={`text-sm font-bold ${isClosed ? 'text-content-muted' : 'text-tertiary-dark'}`}>{benefit}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        {isClosed ? (
          <button disabled className="w-full bg-surface-alt text-content-muted text-xs font-semibold py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-1">
            Opens Next Year
          </button>
        ) : (
          <Link to={ctaTo} className="w-full bg-surface text-primary border border-primary hover:bg-primary hover:text-on-primary text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1">
            View Details <ChevronRight size={13} />
          </Link>
        )}
      </div>
    </article>
  )
}
