import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Inbox,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Banknote,
  GraduationCap,
  Users,
  User,
  X,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'

// ── Filters ───────────────────────────────────────────────────

const FILTERS = [
  { key: 'submitted',  label: 'Pending' },
  { key: 'incomplete', label: 'Incomplete' },
  { key: 'approved',   label: 'Approved' },
  { key: 'rejected',   label: 'Rejected' },
  { key: 'all',        label: 'All' },
]

// ── Action modal config ───────────────────────────────────────

const MODAL_CONFIG = {
  approve: {
    title: 'Approve Application',
    description: 'Confirm approval and set the scholarship grant amount for this applicant.',
    showGrant: true,
    reasonLabel: 'Remarks (optional)',
    reasonRequired: false,
    confirmLabel: 'Approve Application',
    confirmCls: 'bg-tertiary-dark text-white hover:opacity-90',
    Icon: CheckCircle2,
    iconCls: 'bg-tertiary-light text-tertiary-dark',
  },
  rejected: {
    title: 'Reject Application',
    description: 'This applicant will be notified. They may file an appeal within 15 days.',
    showGrant: false,
    reasonLabel: 'Reason for rejection',
    reasonRequired: true,
    confirmLabel: 'Reject Application',
    confirmCls: 'bg-danger text-white hover:opacity-90',
    Icon: XCircle,
    iconCls: 'bg-danger-light text-danger',
  },
  incomplete: {
    title: 'Mark as Incomplete',
    description: 'Request corrections. The applicant will be asked to re-upload or fix the noted items.',
    showGrant: false,
    reasonLabel: 'What needs to be corrected?',
    reasonRequired: true,
    confirmLabel: 'Mark Incomplete',
    confirmCls: 'bg-secondary text-on-secondary hover:opacity-90',
    Icon: AlertTriangle,
    iconCls: 'bg-secondary-light text-on-secondary',
  },
  docReject: {
    title: 'Reject Document',
    description: 'Provide a reason so the applicant knows what to correct and re-upload.',
    showGrant: false,
    reasonLabel: 'Reason',
    reasonRequired: true,
    confirmLabel: 'Reject Document',
    confirmCls: 'bg-danger text-white hover:opacity-90',
    Icon: XCircle,
    iconCls: 'bg-danger-light text-danger',
  },
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function applicantName(a) {
  return a.applicant_name ?? ([a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Applicant')
}

// ── Action modal ──────────────────────────────────────────────

function ActionModal({ type, isPending, onConfirm, onClose }) {
  const cfg = MODAL_CONFIG[type]
  const [reason, setReason] = useState('')
  const [grant, setGrant] = useState('')

  if (!cfg) return null

  const canConfirm =
    (!cfg.reasonRequired || reason.trim().length > 0) &&
    (!cfg.showGrant || Number(grant) > 0)

  const { Icon } = cfg

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconCls}`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-content">{cfg.title}</h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">{cfg.description}</p>
            </div>
            <button onClick={onClose} className="text-content-muted hover:text-content transition-colors shrink-0" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {cfg.showGrant && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="grant" className="text-sm font-medium text-content">Grant Amount (₱ / semester)</label>
                <div className="relative">
                  <Banknote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                  <input
                    id="grant"
                    type="number"
                    min="0"
                    value={grant}
                    onChange={(e) => setGrant(e.target.value)}
                    placeholder="10000"
                    className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reason" className="text-sm font-medium text-content">{cfg.reasonLabel}</label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Type here…"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!canConfirm || isPending}
            onClick={() => onConfirm({ reason: reason.trim(), grant_amount: grant ? Number(grant) : undefined })}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${cfg.confirmCls}`}
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Queue list ────────────────────────────────────────────────

function QueueRow({ application, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(application.id)}
      className={`w-full text-left px-4 py-3.5 border-b border-border transition-colors ${
        active ? 'bg-primary-light' : 'hover:bg-surface-alt'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className={`text-sm font-semibold truncate ${active ? 'text-primary' : 'text-content'}`}>
          {applicantName(application)}
        </p>
        <StatusPill status={application.status} size="sm" />
      </div>
      <p className="text-xs text-content-muted truncate">
        {application.scholarship_name ?? 'Scholarship Application'}
      </p>
      <p className="text-xs text-content-disabled mt-0.5">
        Submitted {formatDate(application.submitted_at ?? application.created_at)}
      </p>
    </button>
  )
}

// ── Detail helpers ────────────────────────────────────────────

function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-content-muted">{label}</p>
      <p className="text-sm font-medium text-content mt-0.5 break-words">{value ?? '—'}</p>
    </div>
  )
}

function SummarySection({ Icon, title, children }) {
  return (
    <section className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border">
        <Icon size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-content">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function DocReviewRow({ doc, onVerify, onReject, busy }) {
  return (
    <div className="border border-border rounded-lg p-4 flex items-center gap-3 bg-surface">
      <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
        <FileText size={16} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-content truncate">{doc.name}</p>
        {doc.status === 'rejected' && doc.remarks && (
          <p className="text-xs text-danger mt-0.5 leading-snug">{doc.remarks}</p>
        )}
      </div>
      <StatusPill status={doc.status} kind="document" size="sm" />
      {doc.url && (
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-content-muted hover:text-primary transition-colors shrink-0"
          aria-label="View document"
        >
          <Download size={15} />
        </a>
      )}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onVerify(doc)}
          disabled={busy || doc.status === 'verified'}
          className="p-1.5 rounded-lg border border-border text-tertiary-dark hover:bg-tertiary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Verify document"
          title="Verify"
        >
          <CheckCircle2 size={15} />
        </button>
        <button
          onClick={() => onReject(doc)}
          disabled={busy || doc.status === 'rejected'}
          className="p-1.5 rounded-lg border border-border text-danger hover:bg-danger-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Reject document"
          title="Reject"
        >
          <XCircle size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Detail pane ───────────────────────────────────────────────

function DetailPane({ id, onBack }) {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null) // { type, docId? }

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.adminApplications.detail(id),
    queryFn: () => api.get(`/admin/applications/${id}`).then((r) => r.data?.data ?? r.data),
    enabled: !!id,
    retry: false,
  })

  const application = data ?? null

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: queryKeys.adminApplications.detail(id) })
    queryClient.invalidateQueries({ queryKey: queryKeys.adminApplications.all })
  }

  const decisionMutation = useMutation({
    mutationFn: ({ decision, reason, grant_amount }) =>
      api.post(`/admin/applications/${id}/decision`, { decision, remarks: reason, grant_amount }),
    onSuccess: (_res, vars) => {
      toast.success(
        vars.decision === 'approved' ? 'Application approved.'
        : vars.decision === 'rejected' ? 'Application rejected.'
        : 'Application marked as incomplete.'
      )
      invalidate()
      setModal(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Action failed. Please try again.'),
  })

  const docMutation = useMutation({
    mutationFn: ({ docId, status, reason }) =>
      api.post(`/admin/applications/${id}/documents/${docId}/review`, { status, remarks: reason }),
    onSuccess: () => {
      toast.success('Document updated.')
      invalidate()
      setModal(null)
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? 'Could not update document.'),
  })

  function handleConfirm({ reason, grant_amount }) {
    if (modal.type === 'docReject') {
      docMutation.mutate({ docId: modal.docId, status: 'rejected', reason })
    } else {
      decisionMutation.mutate({ decision: modal.type, reason, grant_amount })
    }
  }

  // ── States ──
  if (!id) {
    return (
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center gap-3 text-content-muted">
        <Inbox size={40} className="text-content-disabled" />
        <p className="text-sm">Select an application from the queue to review it.</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex-1 p-6 space-y-5 overflow-auto">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !application) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-6">
        <XCircle size={36} className="text-danger" />
        <p className="text-sm font-semibold text-content">Couldn't load this application.</p>
        <button onClick={onBack} className="text-sm text-primary hover:underline lg:hidden">Back to queue</button>
      </div>
    )
  }

  const documents = application.documents ?? []
  const isDecided = ['approved', 'rejected'].includes(application.status)
  const busy = decisionMutation.isPending || docMutation.isPending

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="lg:hidden text-content-muted hover:text-content" aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-bold text-content">{applicantName(application)}</h2>
            <StatusPill status={application.status} size="sm" />
          </div>
          <p className="text-xs text-content-muted mt-0.5">
            {application.scholarship_name ?? 'Scholarship Application'} · AY {application.academic_year ?? '2026–2027'}
            {application.reference_no && <span className="font-mono"> · {application.reference_no}</span>}
          </p>
        </div>
      </div>

      {/* Body (scrolls) */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        <SummarySection Icon={User} title="Personal & Contact">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <SummaryItem label="Full Name" value={applicantName(application)} />
            <SummaryItem label="Sex" value={application.sex} />
            <SummaryItem label="Civil Status" value={application.civil_status} />
            <SummaryItem label="Birthdate" value={application.birthdate ? formatDate(application.birthdate) : null} />
            <SummaryItem label="Mobile" value={application.mobile} />
            <SummaryItem label="Barangay" value={application.barangay} />
          </div>
        </SummarySection>

        <SummarySection Icon={GraduationCap} title="Academic Records">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <SummaryItem label="School" value={application.school_name} />
            <SummaryItem label="Course" value={application.course} />
            <SummaryItem label="Year Level" value={application.year_level} />
            <SummaryItem label="GWA" value={application.gwa} />
          </div>
        </SummarySection>

        <SummarySection Icon={Users} title="Family Background">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            <SummaryItem label="Annual Income" value={application.annual_income_range} />
            <SummaryItem label="Dependents" value={application.num_dependents} />
            <SummaryItem label="Primary Earner" value={application.primary_earner} />
          </div>
          {application.financial_need_statement && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-content-muted mb-1">Financial Need Statement</p>
              <p className="text-sm text-content leading-relaxed whitespace-pre-line">{application.financial_need_statement}</p>
            </div>
          )}
        </SummarySection>

        {application.essay && (
          <SummarySection Icon={FileText} title="Essay & Statement">
            <p className="text-sm text-content leading-relaxed whitespace-pre-line">{application.essay}</p>
          </SummarySection>
        )}

        {/* Documents */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border">
            <FileText size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-content">Documents</h3>
            <span className="text-xs text-content-muted">({documents.length})</span>
          </div>
          {documents.length > 0 ? (
            <div className="space-y-2.5">
              {documents.map((doc) => (
                <DocReviewRow
                  key={doc.id ?? doc.name}
                  doc={doc}
                  busy={busy}
                  onVerify={(d) => docMutation.mutate({ docId: d.id, status: 'verified', reason: '' })}
                  onReject={(d) => setModal({ type: 'docReject', docId: d.id })}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-muted py-4 text-center">No documents submitted.</p>
          )}
        </section>
      </div>

      {/* Decision bar (sticky footer) */}
      {!isDecided && (
        <div className="px-6 py-4 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => setModal({ type: 'incomplete' })}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold border border-border text-on-secondary bg-secondary-light px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <AlertTriangle size={15} /> Mark Incomplete
          </button>
          <button
            onClick={() => setModal({ type: 'rejected' })}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold border border-danger text-danger px-5 py-2.5 rounded-lg hover:bg-danger-light disabled:opacity-50 transition-colors"
          >
            <XCircle size={15} /> Reject
          </button>
          <button
            onClick={() => setModal({ type: 'approve' })}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold bg-tertiary-dark text-white px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <CheckCircle2 size={15} /> Approve
          </button>
        </div>
      )}

      {isDecided && (
        <div className="px-6 py-4 border-t border-border bg-surface-alt flex items-center gap-2 shrink-0">
          <CheckCircle2 size={15} className="text-content-muted" />
          <p className="text-xs text-content-muted">
            This application has been {application.status === 'approved' ? 'approved' : 'rejected'}
            {application.grant_amount != null && application.status === 'approved'
              ? ` — ₱${Number(application.grant_amount).toLocaleString()} / semester.`
              : '.'}
          </p>
        </div>
      )}

      {modal && (
        <ActionModal
          type={modal.type}
          isPending={busy}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function QueuePage() {
  const [filter, setFilter] = useState('submitted')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: queryKeys.adminApplications.list({ status: filter, search }),
    queryFn: () => {
      const params = new URLSearchParams({ sort: 'desc' })
      if (filter !== 'all') params.set('status', filter)
      if (search) params.set('search', search)
      return api.get(`/admin/applications?${params.toString()}`).then((r) => r.data)
    },
    retry: false,
  })

  const applications = data?.data ?? []

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      <div className="px-6 py-4 border-b border-border bg-surface shrink-0">
        <h1 className="text-lg font-bold text-content">Verification Queue</h1>
        <p className="text-xs text-content-muted mt-0.5">Review submitted applications and verify documents.</p>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ── Queue list ─────────────────────────────────────── */}
        <aside className={`${selectedId ? 'hidden lg:flex' : 'flex'} w-full lg:w-[360px] flex-col border-r border-border bg-surface shrink-0 min-h-0`}>
          {/* Search + filters */}
          <div className="p-4 border-b border-border shrink-0 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicants…"
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    filter === f.key
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto min-h-0">
            {isPending ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                ))}
              </div>
            ) : applications.length > 0 ? (
              applications.map((a) => (
                <QueueRow key={a.id} application={a} active={a.id === selectedId} onSelect={setSelectedId} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-20 px-6">
                <Inbox size={32} className="text-content-disabled" />
                <p className="text-sm text-content-muted">No applications in this category.</p>
              </div>
            )}
          </div>

          {/* Count footer */}
          <div className="px-4 py-2.5 border-t border-border text-xs text-content-muted shrink-0 flex items-center justify-between">
            <span>{applications.length} application{applications.length === 1 ? '' : 's'}</span>
            <ChevronRight size={13} className="lg:hidden" />
          </div>
        </aside>

        {/* ── Detail pane ────────────────────────────────────── */}
        <div className={`${selectedId ? 'flex' : 'hidden lg:flex'} flex-1 bg-surface-alt min-w-0`}>
          <DetailPane id={selectedId} onBack={() => setSelectedId(null)} />
        </div>
      </div>
    </div>
  )
}
