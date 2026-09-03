import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useBrand } from '../../tenant/TenantContext'
import {
  Users,
  ClipboardList,
  BadgeCheck,
  AlertOctagon,
  CalendarDays,
  CalendarClock,
  MapPin,
  ChevronRight,
  Plus,
  Inbox,
  AlertTriangle,
  Gavel,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'
import { scholarStatus } from '../../components/admin/scholars/scholarUtils'

// ── Helpers ───────────────────────────────────────────────────

function currentAcademicYear() {
  const now = new Date()
  const y = now.getFullYear()
  // PH academic year starts ~August; before August the AY started the prior year.
  const start = now.getMonth() >= 7 ? y : y - 1
  return `${start}–${start + 1}`
}

function initials(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase()
}

function applicantName(a) {
  return a.applicant_name ?? ([a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Applicant')
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const TONES = {
  neutral: { chip: 'bg-primary-light text-primary',       bar: 'bg-primary' },
  amber:   { chip: 'bg-secondary-light text-on-secondary', bar: 'bg-secondary' },
  green:   { chip: 'bg-tertiary-light text-tertiary-dark', bar: 'bg-tertiary' },
  red:     { chip: 'bg-danger-light text-danger',          bar: 'bg-danger' },
}
const ATT_TONE = {
  amber: 'bg-secondary-light text-on-secondary',
  red: 'bg-danger-light text-danger',
  blue: 'bg-primary-light text-primary',
  primary: 'bg-primary-light text-primary',
}

// ── Stat card ─────────────────────────────────────────────────

function StatCard({ Icon, label, value, sub, tone = 'neutral', to }) {
  const t = TONES[tone]
  const Wrapper = to ? Link : 'div'
  const wrapperProps = to
    ? { to, className: 'group block bg-surface border border-border rounded-xl shadow-card overflow-hidden hover:border-primary hover:shadow-modal transition-all' }
    : { className: 'bg-surface border border-border rounded-xl shadow-card overflow-hidden' }
  return (
    <Wrapper {...wrapperProps}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-sm text-content-muted">{label}</p>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.chip}`}>
            <Icon size={17} />
          </div>
        </div>
        <p className="text-3xl font-bold text-content leading-none mt-2">{value}</p>
        {sub && (
          <p className="text-xs text-content-muted mt-1.5 inline-flex items-center gap-1">
            {sub}
            {to && <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
          </p>
        )}
      </div>
      <div className={`h-1 ${t.bar}`} />
    </Wrapper>
  )
}

// ── Recent application row ─────────────────────────────────────

function RecentRow({ application }) {
  const name = applicantName(application)
  return (
    <tr className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center shrink-0">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <Link to="/admin/applications" className="text-sm font-semibold text-content hover:text-primary transition-colors truncate block">
              {name}
            </Link>
            <p className="text-xs text-content-muted truncate">{application.reference_no ?? application.id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 hidden sm:table-cell min-w-0">
        <p className="text-sm text-content truncate">{application.course ?? application.scholarship_name ?? '—'}</p>
        <p className="text-xs text-content-muted truncate">{application.school_name ?? ''}</p>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell text-xs text-content-muted whitespace-nowrap">
        {formatDateTime(application.submitted_at ?? application.created_at)}
      </td>
      <td className="px-5 py-3.5 text-right">
        <StatusPill status={application.status} size="sm" />
      </td>
    </tr>
  )
}

// ── Schedule row ──────────────────────────────────────────────

function ScheduleRow({ event }) {
  const date = event.date ? new Date(event.date) : null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-12 shrink-0 rounded-lg bg-primary-light text-primary flex flex-col items-center justify-center py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
          {date ? date.toLocaleDateString('en-PH', { month: 'short' }) : '—'}
        </span>
        <span className="text-base font-bold leading-tight">{date ? date.getDate() : '—'}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-content leading-snug">{event.title ?? event.type ?? 'Scheduled Event'}</p>
        <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap mt-0.5 text-xs text-content-muted">
          {(event.start_time || event.time) && (
            <span className="inline-flex items-center gap-1"><CalendarClock size={11} />{event.start_time ?? event.time}</span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1 truncate"><MapPin size={11} />{event.location}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const brand = useBrand()

  const statsQuery = useQuery({
    queryKey: queryKeys.stats.admin(),
    queryFn: () => api.get('/admin/stats').then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  const recentQuery = useQuery({
    queryKey: queryKeys.adminApplications.list({ per_page: 5, sort: 'desc' }),
    queryFn: () => api.get('/admin/applications?per_page=5&sort=desc').then((r) => r.data),
    retry: false,
  })

  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules.list(),
    queryFn: () => api.get('/admin/schedules?upcoming=1&per_page=4').then((r) => r.data),
    retry: false,
  })

  // Actionable "needs attention" counts.
  const appealsQuery = useQuery({
    queryKey: ['admin', 'appeals', 'pending'],
    queryFn: () => api.get('/admin/appeals?status=pending').then((r) => r.data),
    retry: false,
  })
  const renewalsQuery = useQuery({
    queryKey: ['admin', 'renewals'],
    queryFn: () => api.get('/admin/renewals').then((r) => r.data),
    retry: false,
  })
  const scholarsQuery = useQuery({
    queryKey: ['admin', 'scholars'],
    queryFn: () => api.get('/admin/scholars').then((r) => r.data),
    retry: false,
  })
  const policiesQuery = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'policies'],
    queryFn: () => api.get('/admin/maintenance/policies').then((r) => r.data),
    retry: false,
  })

  const stats = statsQuery.data ?? {}
  const recent = recentQuery.data?.data ?? []
  const schedules = schedulesQuery.data?.data ?? []

  const incompleteRejected =
    stats.incomplete_rejected ?? ((stats.incomplete ?? 0) + (stats.rejected ?? 0))

  const scholars = scholarsQuery.data?.data ?? []
  const policies = policiesQuery.data?.data ?? []
  const attention = [
    { key: 'pending', label: 'Pending review', count: stats.pending_review ?? stats.pending ?? 0, to: '/admin/applications', Icon: ClipboardList, tone: 'amber' },
    { key: 'atrisk', label: 'Scholars at risk', count: scholars.filter((s) => scholarStatus(s, policies) === 'at_risk').length, to: '/admin/scholars?status=at_risk', Icon: AlertTriangle, tone: 'red' },
    { key: 'renewals', label: 'Renewals to review', count: (renewalsQuery.data?.data ?? []).filter((r) => r.status === 'pending').length, to: '/admin/scholars/renewals', Icon: RefreshCw, tone: 'blue' },
    { key: 'appeals', label: 'Open appeals', count: (appealsQuery.data?.data ?? []).length, to: '/admin/appeals?status=pending', Icon: Gavel, tone: 'primary' },
  ]
  const attentionLoading = appealsQuery.isPending || renewalsQuery.isPending || scholarsQuery.isPending
  const totalAttention = attention.reduce((s, a) => s + a.count, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Dashboard Overview</h1>
          <p className="text-sm text-content-muted mt-1">
            Here's the current status of the A.Y. {currentAcademicYear()} scholarship cycle.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-surface border border-border rounded-lg px-3 py-2 text-sm text-content-muted">
          <CalendarDays size={15} />
          {new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* ── Needs attention ────────────────────────────────────── */}
      {attentionLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : (
        <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
            {totalAttention > 0 ? (
              <><AlertTriangle size={16} className="text-secondary" /><h2 className="text-sm font-bold text-content">Needs attention today</h2></>
            ) : (
              <><CheckCircle2 size={16} className="text-tertiary-dark" /><h2 className="text-sm font-bold text-content">All caught up</h2></>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {attention.map((a) => (
              <Link key={a.key} to={a.to} className="group bg-surface p-4 flex items-start gap-3 hover:bg-surface-alt transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ATT_TONE[a.tone]}`}>
                  <a.Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className={`text-2xl font-bold leading-none ${a.count > 0 ? 'text-content' : 'text-content-disabled'}`}>{a.count}</p>
                  <p className="text-xs text-content-muted mt-1 inline-flex items-center gap-1">
                    {a.label}
                    <ChevronRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Stat cards ─────────────────────────────────────────── */}
      {statsQuery.isPending ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-card space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard Icon={Users} tone="neutral" to="/admin/applicants" label="Total Applicants"
            value={(stats.total_applicants ?? 0).toLocaleString()} sub="This cycle" />
          <StatCard Icon={ClipboardList} tone="amber" to="/admin/applications" label="Pending Review"
            value={(stats.pending_review ?? stats.pending ?? 0).toLocaleString()} sub="Needs action" />
          <StatCard Icon={BadgeCheck} tone="green" to="/admin/applicants?status=approved" label="Approved"
            value={(stats.approved ?? 0).toLocaleString()} sub="Scholars this cycle" />
          <StatCard Icon={AlertOctagon} tone="red" to="/admin/applicants?status=incomplete" label="Incomplete / Rejected"
            value={incompleteRejected.toLocaleString()} sub="Requires follow-up" />
        </div>
      )}

      {/* ── Main grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent applications */}
        <section className="lg:col-span-2 bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-content">Recent Applications</h2>
              <p className="text-xs text-content-muted mt-0.5">Latest submissions awaiting initial processing.</p>
            </div>
            <Link to="/admin/applications" className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0">
              View All <ChevronRight size={13} />
            </Link>
          </div>

          {recentQuery.isPending ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-3 w-40" /><Skeleton className="h-3 w-24" /></div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-content-muted border-b border-border">
                    <th className="px-5 py-2.5">Applicant &amp; ID</th>
                    <th className="px-5 py-2.5 hidden sm:table-cell">Program / School</th>
                    <th className="px-5 py-2.5 hidden md:table-cell">Submitted</th>
                    <th className="px-5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((a) => <RecentRow key={a.id} application={a} />)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Inbox size={30} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No applications submitted yet.</p>
            </div>
          )}
        </section>

        {/* Right rail */}
        <aside className="flex flex-col gap-6">

          {/* Upcoming schedules */}
          <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-base font-bold text-content inline-flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" /> Upcoming Schedules
              </h2>
              <Link to="/admin/schedules" className="text-xs text-primary hover:underline">Manage</Link>
            </div>
            <div className="px-5">
              {schedulesQuery.isPending ? (
                <div className="py-4 space-y-3">
                  {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                </div>
              ) : schedules.length > 0 ? (
                schedules.map((e) => <ScheduleRow key={e.id} event={e} />)
              ) : (
                <p className="text-sm text-content-muted text-center py-6">No upcoming schedules.</p>
              )}
            </div>
            <div className="px-5 py-4 border-t border-border">
              <Link to="/admin/schedules" className="flex items-center justify-center gap-2 w-full text-xs font-semibold text-primary border border-border rounded-lg py-2.5 hover:border-primary hover:bg-primary-light/40 transition-colors">
                <Plus size={14} /> Add Schedule
              </Link>
            </div>
          </section>

          {/* Generate reports CTA */}
          <section className="relative rounded-xl p-6 text-on-primary overflow-hidden shadow-modal">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
            <div className="relative z-10">
              <h2 className="text-base font-bold">Generate Reports</h2>
              <p className="text-xs text-on-primary/70 mt-1 mb-4 leading-relaxed">
                Export current cycle statistics for the {brand.officeShort} and the Mayor's Office.
              </p>
              <Link to="/admin/reports" className="inline-flex items-center gap-2 bg-surface text-primary text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
                Generate Reports <ChevronRight size={15} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
