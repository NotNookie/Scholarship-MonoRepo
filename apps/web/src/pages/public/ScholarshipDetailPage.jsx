import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ChevronLeft, CalendarCheck, Clock, Lock, Bookmark, Banknote, GraduationCap,
  CheckCircle2, ChevronRight, Award, Search,
} from 'lucide-react'
import { SCHOLARSHIPS, QUALIFICATIONS } from '../../data/scholarships'
import { useAuthStore } from '../../store/authStore'

const SAVED_KEY = 'iskolar-saved-scholarships'
function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') } catch { return [] }
}

function StatusBadge({ status, daysLeft }) {
  if (status === 'open') {
    return <span className="inline-flex items-center gap-1.5 bg-tertiary-light text-tertiary-dark text-xs font-semibold px-3 py-1.5 rounded-md border border-tertiary/30"><CalendarCheck size={13} /> Accepting Applications</span>
  }
  if (status === 'closing_soon') {
    return <span className="inline-flex items-center gap-1.5 bg-secondary-light text-secondary-dark text-xs font-semibold px-3 py-1.5 rounded-md border border-secondary/30"><Clock size={13} /> Closes in {daysLeft} Days</span>
  }
  return <span className="inline-flex items-center gap-1.5 bg-surface-alt text-content-muted text-xs font-semibold px-3 py-1.5 rounded-md border border-border"><Lock size={13} /> Closed</span>
}

export function ScholarshipDetailPage() {
  const { id } = useParams()
  const isScholar = useAuthStore((s) => s.user?.role === 'scholar')
  const scholarship = SCHOLARSHIPS.find((s) => String(s.id) === String(id))
  const [saved, setSaved] = useState(() => (scholarship ? readSaved().includes(scholarship.id) : false))

  if (!scholarship) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center">
          <Search size={26} className="text-content-disabled" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Scholarship not found</h1>
          <p className="text-sm text-content-muted mt-1">This program may have been removed or the link is incorrect.</p>
        </div>
        <Link to="/scholarships" className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors">
          Browse scholarships
        </Link>
      </div>
    )
  }

  const { name, category, status, daysLeft, eligibility, benefit } = scholarship
  const isClosed = status === 'closed'

  function toggleSave() {
    const list = readSaved()
    const next = list.includes(scholarship.id) ? list.filter((x) => x !== scholarship.id) : [...list, scholarship.id]
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)) } catch { /* storage unavailable */ }
    setSaved(next.includes(scholarship.id))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      <Link to="/scholarships" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors w-fit">
        <ChevronLeft size={15} /> Back to scholarships
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="mb-3"><StatusBadge status={status} daysLeft={daysLeft} /></div>
          <h1 className="text-3xl font-bold text-content leading-tight">{name}</h1>
          <p className="text-sm font-semibold text-content-muted uppercase tracking-wider mt-2">{category}</p>
        </div>
        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold border border-border px-4 py-2 rounded-lg hover:border-primary transition-colors"
        >
          <Bookmark size={15} className={saved ? 'text-primary fill-primary' : 'text-content-muted'} />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-3 mb-4 border-b border-border">
              <Banknote size={17} className="text-primary" /> Benefit
            </h2>
            <p className={`text-lg font-bold ${isClosed ? 'text-content-muted' : 'text-tertiary-dark'}`}>{benefit}</p>
          </section>

          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-3 mb-4 border-b border-border">
              <GraduationCap size={17} className="text-primary" /> Who can apply
            </h2>
            <p className="text-sm text-content leading-relaxed">{eligibility}</p>
          </section>

          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2 pb-4 mb-4 border-b border-border">
              <CheckCircle2 size={17} className="text-primary" /> How to Qualify
            </h2>
            <ul className="space-y-4">
              {QUALIFICATIONS.map(({ label, text }) => (
                <li key={label} className="flex items-start gap-3">
                  <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-content">{label}</p>
                    <p className="text-xs text-content-muted mt-0.5 leading-snug">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/requirements" className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium mt-5">
              View full requirements <ChevronRight size={14} />
            </Link>
          </section>
        </div>

        {/* CTA rail */}
        <aside className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl shadow-card p-6 lg:sticky lg:top-20">
            <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center mb-3">
              <Award size={20} className="text-primary" />
            </div>
            {isClosed ? (
              <>
                <p className="text-sm font-bold text-content">Applications are closed</p>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">This program isn&rsquo;t accepting applications right now. Check back next cycle.</p>
                <span className="mt-4 w-full inline-flex items-center justify-center bg-surface-alt text-content-muted text-sm font-semibold py-2.5 rounded-lg cursor-not-allowed">
                  Opens next year
                </span>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-content">Ready to apply?</p>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">
                  {isScholar ? 'Start your application for this program.' : 'Create a free account to apply and track your status.'}
                </p>
                <Link
                  to={isScholar ? '/apply' : '/register'}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {isScholar ? 'Apply Now' : 'Register to Apply'} <ChevronRight size={15} />
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
