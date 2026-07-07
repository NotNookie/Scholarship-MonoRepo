import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FilePlus,
  FileText,
  AlertCircle,
  Banknote,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Application row ───────────────────────────────────────────

function ApplicationCard({ application }) {
  const {
    id,
    status,
    scholarship_name,
    academic_year,
    grant_amount,
    submitted_at,
    created_at,
    reference_no,
  } = application

  const isDraft = status === 'draft'

  return (
    <article className="bg-surface border border-border rounded-xl shadow-card overflow-hidden hover:border-primary transition-colors">
      <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-11 h-11 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
          <FileText size={20} className="text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-content">
              {scholarship_name ?? 'Scholarship Application'}
            </h3>
            <StatusPill status={status} />
          </div>
          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5 text-xs text-content-muted">
            <span>AY {academic_year ?? '2026–2027'}</span>
            <span className="hidden sm:block w-px h-3 bg-border" />
            <span>
              {isDraft
                ? `Started ${formatDate(created_at)}`
                : `Submitted ${formatDate(submitted_at ?? created_at)}`}
            </span>
            {reference_no && (
              <>
                <span className="hidden sm:block w-px h-3 bg-border" />
                <span className="font-mono">Ref: {reference_no}</span>
              </>
            )}
          </div>
        </div>

        {grant_amount != null && status === 'approved' && (
          <div className="flex items-center gap-2 text-tertiary-dark shrink-0">
            <Banknote size={16} />
            <span className="text-sm font-bold">₱{Number(grant_amount).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
        {isDraft ? (
          <Link
            to="/apply"
            className="text-xs font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Continue Application
          </Link>
        ) : (
          <Link
            to={`/applications/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
          >
            View Details <ChevronRight size={13} />
          </Link>
        )}
      </div>
    </article>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function ApplicationsPage() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.applications.list(),
    queryFn: () => api.get('/applications?sort=desc').then((r) => r.data),
    retry: false,
  })

  const applications = data?.data ?? []
  const hasActive = applications.some((a) => a.status !== 'draft' && a.status !== 'rejected')

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Applications</h1>
          <p className="text-sm text-content-muted mt-1">
            View and track the status of your scholarship applications.
          </p>
        </div>
        {!hasActive && (
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0"
          >
            <FilePlus size={15} /> New Application
          </Link>
        )}
      </header>

      {/* ── Policy note ────────────────────────────────────────── */}
      {hasActive && (
        <div className="flex items-start gap-3 bg-primary-light border border-primary/20 rounded-xl px-5 py-4">
          <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-content-muted leading-relaxed">
            You have an active application under review. Per municipal policy, you may only hold
            one active scholarship application per academic year. You can submit a new application
            once the current cycle is completed.
          </p>
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────── */}
      {isPending ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 shadow-card flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center">
            <FilePlus size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-content">No applications yet</p>
            <p className="text-sm text-content-muted mt-1 max-w-sm">
              You haven't started a scholarship application. Begin your application to apply for
              financial assistance from the Municipality.
            </p>
          </div>
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Start Application <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  )
}
