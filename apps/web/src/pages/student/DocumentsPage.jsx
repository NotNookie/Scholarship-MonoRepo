import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Upload,
  Download,
  Banknote,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'

const APPLICATION_STEPS = ['Draft', 'Submitted', 'Under Review', 'Decision', 'Awarded']

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Progress tracker ──────────────────────────────────────────

function ProgressTracker({ status }) {
  const currentStep = { draft: 0, submitted: 2, incomplete: 2, approved: 3, rejected: 3 }[status] ?? 0

  return (
    <div className="px-6 py-6">
      <div className="relative flex items-center">
        <div className="absolute top-4 left-0 right-0 h-px bg-border z-0" />
        <div
          className="absolute top-4 left-0 h-px bg-primary z-0 transition-all duration-700"
          style={{ width: `${(currentStep / (APPLICATION_STEPS.length - 1)) * 100}%` }}
        />
        <div className="relative z-10 flex justify-between w-full">
          {APPLICATION_STEPS.map((label, i) => {
            const done = i < currentStep
            const active = i === currentStep
            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                    done
                      ? 'bg-primary border-primary text-on-primary'
                      : active
                      ? 'bg-surface border-primary text-primary'
                      : 'bg-surface border-border text-content-muted'
                  }`}
                >
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
  )
}

// ── Summary row ───────────────────────────────────────────────

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-content-muted">{label}</p>
      <p className="text-sm font-medium text-content mt-0.5">{value ?? '—'}</p>
    </div>
  )
}

// ── Document row ──────────────────────────────────────────────

function DocumentRow({ doc }) {
  const isRejected = doc.status === 'rejected'
  return (
    <div className={`border rounded-xl p-5 flex items-center gap-4 ${isRejected ? 'border-danger/30 bg-danger-light/30' : 'border-border bg-surface'}`}>
      <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
        <FileText size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-content">{doc.name}</p>
        <p className="text-xs text-content-muted mt-0.5">
          Uploaded {formatDate(doc.uploaded_at)}
        </p>
        {isRejected && doc.remarks && (
          <p className="text-xs text-danger mt-1 leading-snug">
            <span className="font-semibold">Reason:</span> {doc.remarks}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusPill status={doc.status} kind="document" size="sm" />
        {isRejected ? (
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary-light transition-colors"
          >
            <Upload size={12} /> Re-upload
          </Link>
        ) : doc.url ? (
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-3 py-1.5 rounded-lg hover:border-primary hover:text-primary transition-colors"
          >
            <Download size={12} /> View
          </a>
        ) : null}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function DocumentsPage() {
  const { id } = useParams()

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: () => api.get(`/applications/${id}`).then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  const application = data ?? null
  const documents = application?.documents ?? []
  const isRejected = application?.status === 'rejected'

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

      {/* ── Back link ──────────────────────────────────────────── */}
      <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors w-fit">
        <ChevronLeft size={15} /> Back to My Applications
      </Link>

      {isPending ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError || !application ? (
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-danger-light rounded-full flex items-center justify-center">
            <AlertCircle size={24} className="text-danger" />
          </div>
          <div>
            <p className="text-base font-bold text-content">Application not found</p>
            <p className="text-sm text-content-muted mt-1 max-w-sm">
              We couldn't load this application. It may have been removed, or you may not have access to it.
            </p>
          </div>
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors"
          >
            Back to Applications
          </Link>
        </div>
      ) : (
        <>
          {/* ── Header + tracker ───────────────────────────────── */}
          <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-bold text-content">
                  {application.scholarship_name ?? 'Scholarship Application'}
                </h1>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1 text-xs text-content-muted">
                  <span>AY {application.academic_year ?? '2026–2027'}</span>
                  {application.reference_no && (
                    <>
                      <span className="hidden sm:block w-px h-3 bg-border" />
                      <span className="font-mono">Ref: {application.reference_no}</span>
                    </>
                  )}
                  <span className="hidden sm:block w-px h-3 bg-border" />
                  <span>Submitted {formatDate(application.submitted_at ?? application.created_at)}</span>
                </div>
              </div>
              <StatusPill status={application.status} />
            </div>
            <ProgressTracker status={application.status} />
          </section>

          {/* ── Decision banner ────────────────────────────────── */}
          {isRejected && (
            <section className="bg-danger-light border border-danger/30 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-11 h-11 bg-danger/10 rounded-lg flex items-center justify-center shrink-0">
                <ShieldAlert size={20} className="text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-content">Application Not Approved</p>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">
                  {application.decision_remarks ??
                    'Your application did not meet the requirements for this cycle. If you believe this was a mistake, you may file an appeal for reconsideration.'}
                </p>
              </div>
              <Link
                to={`/appeal/${application.id}`}
                className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
              >
                File an Appeal <ArrowRight size={15} />
              </Link>
            </section>
          )}

          {application.status === 'approved' && application.grant_amount != null && (
            <section className="bg-tertiary-light border border-tertiary/30 rounded-xl p-6 flex items-center gap-4">
              <div className="w-11 h-11 bg-tertiary/10 rounded-lg flex items-center justify-center shrink-0">
                <Banknote size={20} className="text-tertiary-dark" />
              </div>
              <div>
                <p className="text-sm font-bold text-tertiary-dark">Congratulations! Your scholarship is approved.</p>
                <p className="text-xs text-content-muted mt-1">
                  Grant amount: <span className="font-semibold text-content">₱{Number(application.grant_amount).toLocaleString()}</span> per semester.
                </p>
              </div>
            </section>
          )}

          {/* ── Application summary ─────────────────────────────── */}
          <section className="bg-surface border border-border rounded-xl shadow-card p-6">
            <h2 className="text-base font-bold text-content pb-4 border-b border-border mb-5">
              Application Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <SummaryItem label="Applicant" value={application.applicant_name ?? ([application.first_name, application.last_name].filter(Boolean).join(' ') || null)} />
              <SummaryItem label="School" value={application.school_name} />
              <SummaryItem label="Course & Year" value={application.course && application.year_level ? `${application.course} — ${application.year_level}` : application.course} />
              <SummaryItem label="GWA" value={application.gwa} />
              <SummaryItem label="Barangay" value={application.barangay} />
              <SummaryItem label="Contact" value={application.mobile} />
            </div>
          </section>

          {/* ── Documents ──────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-content">Submitted Documents</h2>
              <p className="text-sm text-content-muted mt-1">
                Verification status of each document reviewed by the LYDO staff.
              </p>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentRow key={doc.id ?? doc.name} doc={doc} />
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl shadow-card p-10 flex flex-col items-center text-center gap-3">
                <Upload size={28} className="text-content-disabled" />
                <p className="text-sm text-content-muted">No documents have been recorded for this application yet.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
