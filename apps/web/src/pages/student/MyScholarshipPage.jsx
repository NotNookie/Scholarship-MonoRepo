import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts'
import {
  GraduationCap, Banknote, BadgeCheck, CalendarClock, AlertTriangle, ArrowRight,
  CheckCircle2, Circle, FilePlus, IdCard, History, ChevronRight, ShieldAlert,
  FileText, Upload, Download,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'
import { APPLICATION_STATUS } from '../../components/shared/statusConfig'
import { ScholarshipCard } from '../../components/shared/ScholarshipCard'
import { SCHOLARSHIPS } from '../../data/scholarships'
import { useBrand } from '../../tenant/TenantContext'

const SCHOLAR_STATUS = {
  active:      { label: 'Active Scholar', dot: 'bg-tertiary',  text: 'text-tertiary-dark' },
  renewed:     { label: 'Renewed',        dot: 'bg-tertiary',  text: 'text-tertiary-dark' },
  renewal_due: { label: 'Renewal Due',    dot: 'bg-secondary', text: 'text-on-secondary' },
  at_risk:     { label: 'At Risk',        dot: 'bg-danger',    text: 'text-danger' },
  terminated:  { label: 'Terminated',     dot: 'bg-danger',    text: 'text-danger' },
  graduated:   { label: 'Graduated',      dot: 'bg-primary',   text: 'text-primary' },
}

// The journey starts at the application — the scholarship is its continuation.
const JOURNEY_STEPS = ['Applied', 'Submitted', 'Under Review', 'Decision', 'Awarded']
const STEP_INDEX = { draft: 0, submitted: 2, under_review: 2, incomplete: 2, approved: 3, rejected: 3 }

function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}
function daysUntil(v) {
  if (!v) return null
  return Math.ceil((new Date(v) - new Date()) / 86400000)
}
/** Direction-aware: lower-is-better (1.00–5.00) vs higher-is-better (percentage). */
function gwaPasses(gwa, required, direction) {
  if (gwa == null || required == null) return null
  return direction === 'higher_better' ? Number(gwa) >= Number(required) : Number(gwa) <= Number(required)
}

function StatCard({ Icon, label, value, sub, chip, chipCls, accent }) {
  return (
    <div className={`bg-surface border rounded-xl p-5 shadow-card ${accent ?? 'border-border'}`}>
      <p className="text-xs font-semibold text-content-muted uppercase tracking-wide inline-flex items-center gap-1.5">
        <Icon size={13} /> {label}
      </p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <p className="text-xl font-bold text-content">{value}</p>
        {chip && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${chipCls}`}>{chip}</span>}
      </div>
      {sub && <p className="text-xs text-content-muted mt-1">{sub}</p>}
    </div>
  )
}

// ── Application-phase tracker ─────────────────────────────────

function ApplicationStage({ application }) {
  const current = STEP_INDEX[application.status] ?? 0
  return (
    <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-content">{application.scholarship_name ?? 'Scholarship Application'}</h2>
          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1 text-xs text-content-muted">
            <span>A.Y. {application.academic_year ?? '—'}</span>
            {application.reference_no && <span className="font-mono">Ref: {application.reference_no}</span>}
            <span>Submitted {formatDate(application.submitted_at ?? application.created_at)}</span>
          </div>
        </div>
        <StatusPill status={application.status} />
      </div>

      {/* Progress */}
      <div className="px-6 py-6">
        <div className="relative flex items-center">
          <div className="absolute top-4 left-0 right-0 h-px bg-border z-0" />
          <div className="absolute top-4 left-0 h-px bg-primary z-0 transition-all duration-700"
            style={{ width: `${(current / (JOURNEY_STEPS.length - 1)) * 100}%` }} />
          <div className="relative z-10 flex justify-between w-full">
            {JOURNEY_STEPS.map((label, i) => {
              const done = i < current
              const active = i === current
              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                    done ? 'bg-primary border-primary text-on-primary'
                      : active ? 'bg-surface border-primary text-primary'
                      : 'bg-surface border-border text-content-muted'}`}>
                    {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${active ? 'text-primary' : done ? 'text-content' : 'text-content-muted'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-5 flex flex-wrap gap-3">
        {application.status === 'draft' ? (
          <Link to="/apply" className="text-xs font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            Continue Application
          </Link>
        ) : (
          <Link to={`/applications/${application.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
            View Details <ChevronRight size={13} />
          </Link>
        )}
        {application.status === 'rejected' && (
          <Link to={`/appeal/${application.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-danger text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <ShieldAlert size={13} /> File an Appeal
          </Link>
        )}
      </div>
    </section>
  )
}

// ── History ───────────────────────────────────────────────────

function HistorySection({ applications, renewals }) {
  if (applications.length === 0 && renewals.length === 0) return null
  return (
    <section className="bg-surface border border-border rounded-xl shadow-card p-6">
      <h2 className="text-base font-bold text-content pb-4 mb-4 border-b border-border inline-flex items-center gap-2">
        <History size={16} className="text-primary" /> Application &amp; Renewal History
      </h2>
      <div className="divide-y divide-border">
        {applications.map((a) => (
          <Link key={`a-${a.id}`} to={`/applications/${a.id}`} className="flex items-center gap-4 py-3 hover:bg-surface-alt -mx-2 px-2 rounded-lg transition-colors group">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content truncate group-hover:text-primary transition-colors">
                {a.scholarship_name ?? 'Scholarship Application'}
              </p>
              <p className="text-xs text-content-muted">A.Y. {a.academic_year ?? '—'} · {formatDate(a.submitted_at ?? a.created_at)}</p>
            </div>
            <StatusPill status={a.status} size="sm" />
            <ChevronRight size={15} className="text-content-disabled group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
        {renewals.map((r, i) => (
          <div key={`r-${i}`} className="flex items-center gap-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-content truncate">Renewal — {r.term ?? r.label}</p>
              <p className="text-xs text-content-muted">{formatDate(r.date)}{r.gwa ? ` · GWA ${r.gwa}` : ''}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-tertiary-light text-tertiary-dark border border-tertiary/30">
              {r.status ?? 'Renewed'}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Documents ─────────────────────────────────────────────────

function DocumentsCard() {
  const { data, isPending } = useQuery({
    queryKey: ['student', 'documents'],
    queryFn: () => api.get('/student/documents').then((r) => r.data),
    retry: false,
  })
  const docs = data?.data ?? []

  return (
    <section className="bg-surface border border-border rounded-xl shadow-card p-6">
      <h2 className="text-base font-bold text-content pb-4 mb-4 border-b border-border inline-flex items-center gap-2">
        <FileText size={16} className="text-primary" /> My Documents
      </h2>
      {isPending ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : docs.length > 0 ? (
        <div className="space-y-2.5">
          {docs.map((doc) => {
            const rejected = doc.status === 'rejected'
            return (
              <div key={doc.id ?? doc.name} className={`border rounded-lg p-4 flex items-center gap-3 ${rejected ? 'border-danger/30 bg-danger-light/30' : 'border-border'}`}>
                <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0"><FileText size={16} className="text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-content truncate">{doc.name}</p>
                  <p className="text-xs text-content-muted">Uploaded {formatDate(doc.uploaded_at)}</p>
                  {rejected && doc.remarks && <p className="text-xs text-danger mt-1 leading-snug"><span className="font-semibold">Reason:</span> {doc.remarks}</p>}
                </div>
                <StatusPill status={doc.status} kind="document" size="sm" />
                {rejected ? (
                  <Link to="/apply" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors shrink-0">
                    <Upload size={12} /> Re-upload
                  </Link>
                ) : doc.url ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-content-muted hover:text-primary transition-colors shrink-0" aria-label="View document"><Download size={15} /></a>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-2 py-8">
          <Upload size={24} className="text-content-disabled" />
          <p className="text-sm text-content-muted">Documents you submit with your application will appear here.</p>
        </div>
      )}
    </section>
  )
}

// ── Available scholarships (embedded catalog) ─────────────────

function AvailableScholarships({ compact }) {
  const list = compact ? SCHOLARSHIPS.filter((s) => s.status !== 'closed') : SCHOLARSHIPS
  if (list.length === 0) return null
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-content">{compact ? 'Explore Other Programs' : 'Available Scholarships'}</h2>
          {!compact && <p className="text-sm text-content-muted mt-0.5">Programs you can apply for right now.</p>}
        </div>
        <Link to="/scholarships" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0">
          View all <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {list.map((s) => <ScholarshipCard key={s.id} scholarship={s} />)}
      </div>
    </section>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function MyScholarshipPage() {
  const brand = useBrand()
  const scholarshipQuery = useQuery({
    queryKey: ['student', 'scholarship'],
    queryFn: () => api.get('/student/scholarship').then((r) => r.data?.data ?? r.data),
    retry: false,
  })
  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.list(),
    queryFn: () => api.get('/applications?sort=desc').then((r) => r.data),
    retry: false,
  })

  const isPending = scholarshipQuery.isPending || applicationsQuery.isPending
  const s = scholarshipQuery.data ?? null
  const applications = applicationsQuery.data?.data ?? []
  const currentApplication = applications[0] ?? null
  const pastApplications = s ? applications : applications.slice(1)
  const renewals = s?.renewals ?? []

  if (isPending) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    )
  }

  // ── Nothing yet ──────────────────────────────────────────────
  if (!s && applications.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center">
            <GraduationCap size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-content">You haven't applied yet</h1>
            <p className="text-sm text-content-muted mt-1 max-w-sm">
              Browse the available programs below, then start an application — you'll track your status, documents, grant, and renewals right here.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/requirements" className="text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors">
              View requirements
            </Link>
            <Link to="/apply" className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors">
              <FilePlus size={15} /> Start application
            </Link>
          </div>
        </div>
        <AvailableScholarships />
      </div>
    )
  }

  // ── Application phase (not yet a scholar) ────────────────────
  if (!s) {
    const cfg = APPLICATION_STATUS[currentApplication.status]
    return (
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6">
        <section className="relative rounded-2xl px-8 py-8 text-on-primary overflow-hidden shadow-modal">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
          <div className="relative z-10">
            <p className="text-xs font-semibold text-on-primary/70 uppercase tracking-widest">My Scholarship</p>
            <h1 className="text-3xl font-bold mt-1">{cfg?.label ?? 'Application in progress'}</h1>
            <p className="text-on-primary/70 text-sm mt-2">
              Your scholarship journey starts with your application. Track its progress below.
            </p>
          </div>
        </section>

        <ApplicationStage application={currentApplication} />
        <DocumentsCard />
        <HistorySection applications={pastApplications} renewals={[]} />
        <AvailableScholarships compact />
      </div>
    )
  }

  // ── Scholar phase ────────────────────────────────────────────
  const status = SCHOLAR_STATUS[s.status] ?? SCHOLAR_STATUS.active
  const passes = gwaPasses(s.latest_gwa, s.required_gwa, s.gwa_direction)
  const remaining = daysUntil(s.renewal_deadline)
  const history = s.gwa_history ?? []
  const timeline = s.timeline ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-6">

      {/* Header band */}
      <section className="relative rounded-2xl px-8 py-8 text-on-primary overflow-hidden shadow-modal">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-on-primary/70 uppercase tracking-widest">My Scholarship</p>
            <h1 className="text-3xl font-bold mt-1">{s.name ?? 'Scholar'}</h1>
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-2 text-sm text-on-primary/80">
              <span className="inline-flex items-center gap-1.5"><IdCard size={14} /> ID: {s.scholar_id ?? s.id}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarClock size={14} /> A.Y. {s.academic_year ?? '—'}{s.semester ? ` · ${s.semester}` : ''}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 bg-surface px-4 py-2 rounded-full shrink-0 self-start">
            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span className={`text-sm font-bold ${status.text}`}>{status.label}</span>
          </span>
        </div>
      </section>

      {passes === false && (
        <div className="flex items-start gap-3 bg-danger-light border border-danger/30 rounded-xl px-5 py-4">
          <AlertTriangle size={17} className="text-danger shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-content">Your GWA is below the requirement</p>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              Your latest GWA of {s.latest_gwa} does not meet the {s.required_gwa} requirement for this program.
              Please coordinate with the {brand.officeShort} office before the next renewal.
            </p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard Icon={BadgeCheck} label="Current Status" value={status.label} sub={s.status_note ?? 'Valid for this semester'} />
        <StatCard Icon={Banknote} label="Grant Amount"
          value={s.grant_amount != null ? `₱${Number(s.grant_amount).toLocaleString()}` : '—'} sub="Per semester" />
        <StatCard Icon={GraduationCap} label="Latest GWA" value={s.latest_gwa ?? '—'}
          chip={passes == null ? null : passes ? 'Good Standing' : 'Below requirement'}
          chipCls={passes ? 'bg-tertiary-light text-tertiary-dark' : 'bg-danger-light text-danger'}
          sub={s.required_gwa != null ? `Requirement: ${s.required_gwa}${s.gwa_direction === 'higher_better' ? ' or higher' : ' or better'}` : undefined} />
        <StatCard Icon={CalendarClock} label="Renewal Deadline" value={s.renewal_deadline ? formatDate(s.renewal_deadline) : '—'}
          sub={remaining != null ? `${remaining} days remaining` : undefined}
          accent={s.renewal_open ? 'border-primary/30' : undefined} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-surface border border-border rounded-xl shadow-card p-6">
          <h2 className="text-base font-bold text-content pb-4 mb-4 border-b border-border">Scholarship Timeline</h2>
          {timeline.length > 0 ? (
            <ol className="relative">
              {timeline.map((t, i) => {
                const isLast = i === timeline.length - 1
                const done = t.state === 'done'
                const current = t.state === 'current'
                return (
                  <li key={i} className="flex gap-3 pb-6 last:pb-0 relative">
                    {!isLast && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />}
                    <span className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary text-on-primary' : current ? 'bg-surface border-2 border-primary' : 'bg-surface border-2 border-border'}`}>
                      {done ? <CheckCircle2 size={13} strokeWidth={2.5} /> : current ? <span className="w-2 h-2 rounded-full bg-primary" /> : <Circle size={8} className="text-content-disabled" />}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${current ? 'text-primary' : 'text-content'}`}>{t.label}</p>
                      <p className="text-xs text-content-muted mt-0.5">{t.date ? formatDate(t.date) : t.note ?? ''}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="text-sm text-content-muted py-6 text-center">Your scholarship timeline will build up each semester.</p>
          )}
        </section>

        <div className="lg:col-span-2 flex flex-col gap-6">
          {s.renewal_open && (
            <section className="bg-primary-light border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center shrink-0">
                <FilePlus size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-content">
                  Renewal for A.Y. {s.renewal_academic_year ?? s.academic_year} is open
                </h2>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">
                  Submit your latest grades and required documents to secure your grant for the next term.
                </p>
              </div>
              <Link to="/scholarship/renew"
                className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0">
                Start Renewal <ArrowRight size={15} />
              </Link>
            </section>
          )}

          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-content">Academic Performance</h2>
              {s.required_gwa != null && (
                <span className="inline-flex items-center gap-2 text-xs text-content-muted">
                  <span className="w-4 border-t-2 border-dashed border-danger" /> Threshold ({s.required_gwa})
                </span>
              )}
            </div>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="term" tick={{ fill: 'var(--color-content-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                  <YAxis tick={{ fill: 'var(--color-content-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  {s.required_gwa != null && <ReferenceLine y={Number(s.required_gwa)} stroke="var(--color-danger)" strokeDasharray="4 4" />}
                  <Line type="monotone" dataKey="gwa" name="Your GWA" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-55 flex flex-col items-center justify-center text-center gap-2 text-content-muted">
                <GraduationCap size={26} className="text-content-disabled" />
                <p className="text-sm">Your GWA history will appear here after your first renewal.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      <DocumentsCard />
      <HistorySection applications={pastApplications} renewals={renewals} />
      <AvailableScholarships compact />
    </div>
  )
}
