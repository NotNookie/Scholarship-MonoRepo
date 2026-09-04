import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Inbox,
  ShieldAlert,
  FileText,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  MessageSquare,
  X,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useDialog } from '../../lib/useDialog'
import { undoToast } from '../../lib/undoToast'
import { Skeleton } from '../../components/shared/Skeleton'

// ── Appeal status config ──────────────────────────────────────

const APPEAL_STATUS = {
  pending:   { label: 'Pending',        Icon: Clock,        color: 'text-secondary-dark',  bg: 'bg-secondary-light', border: 'border-secondary/30' },
  more_info: { label: 'Info Requested', Icon: Info,         color: 'text-primary',       bg: 'bg-primary-light',   border: 'border-primary/20' },
  approved:  { label: 'Approved',       Icon: CheckCircle2, color: 'text-tertiary-dark', bg: 'bg-tertiary-light',  border: 'border-tertiary/30' },
  rejected:  { label: 'Rejected',       Icon: XCircle,      color: 'text-danger',        bg: 'bg-danger-light',    border: 'border-danger/30' },
}

const FILTERS = [
  { key: 'all', label: 'All Statuses' },
  { key: 'pending', label: 'Pending' },
  { key: 'more_info', label: 'Info Requested' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
]

const MODAL_CONFIG = {
  approved: {
    title: 'Approve Appeal',
    description: 'The application will be reopened to Pending Review so staff can re-evaluate it with the new information.',
    reasonLabel: 'Remarks (optional)',
    reasonRequired: false,
    confirmLabel: 'Approve Appeal',
    confirmCls: 'bg-tertiary-dark text-white hover:opacity-90',
    Icon: CheckCircle2,
    iconCls: 'bg-tertiary-light text-tertiary-dark',
  },
  rejected: {
    title: 'Reject Appeal',
    description: 'The original decision will stand. The applicant will be notified of this outcome.',
    reasonLabel: 'Reason for rejection',
    reasonRequired: true,
    confirmLabel: 'Reject Appeal',
    confirmCls: 'bg-danger text-white hover:opacity-90',
    Icon: XCircle,
    iconCls: 'bg-danger-light text-danger',
  },
  more_info: {
    title: 'Request More Information',
    description: 'Ask the applicant to provide additional details or documents before a decision is made.',
    reasonLabel: 'What information is needed?',
    reasonRequired: true,
    confirmLabel: 'Send Request',
    confirmCls: 'bg-secondary text-on-secondary hover:opacity-90',
    Icon: MessageSquare,
    iconCls: 'bg-secondary-light text-secondary-dark',
  },
}

function appellantName(a) {
  return a.applicant_name ?? ([a.first_name, a.last_name].filter(Boolean).join(' ') || 'Unnamed Applicant')
}

function initials(name) {
  if (!name) return '—'
  const parts = name.trim().split(/\s+/)
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function AppealStatusPill({ status, size = 'md' }) {
  const cfg = APPEAL_STATUS[status] ?? APPEAL_STATUS.pending
  const { Icon, label, color, bg, border } = cfg
  const pad = size === 'sm' ? 'text-xs px-2.5 py-1' : 'text-xs px-3 py-1.5'
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${pad} ${color} ${bg} ${border}`}>
      <Icon size={size === 'sm' ? 11 : 13} strokeWidth={2.5} />
      {label}
    </span>
  )
}

// ── Action modal ──────────────────────────────────────────────

function ActionModal({ type, isPending, onConfirm, onClose }) {
  const dialogRef = useDialog(onClose)
  const cfg = MODAL_CONFIG[type]
  const [reason, setReason] = useState('')
  if (!cfg) return null
  const canConfirm = !cfg.reasonRequired || reason.trim().length > 0
  const { Icon } = cfg

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="appeal-action-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconCls}`}><Icon size={20} /></div>
            <div className="flex-1">
              <h3 id="appeal-action-title" className="text-base font-bold text-content">{cfg.title}</h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">{cfg.description}</p>
            </div>
            <button onClick={onClose} className="text-content-muted hover:text-content shrink-0" aria-label="Close"><X size={18} /></button>
          </div>
          <div className="mt-5">
            <label htmlFor="appeal-reason" className="text-sm font-medium text-content">{cfg.reasonLabel}</label>
            <textarea
              id="appeal-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Type here…"
              className="mt-1.5 w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button
            disabled={!canConfirm || isPending}
            onClick={() => onConfirm(reason.trim())}
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

// ── List row ──────────────────────────────────────────────────

function AppealRow({ appeal, active, onSelect, checked, onToggle }) {
  return (
    <div className={`flex items-stretch border-b border-border transition-colors ${active ? 'bg-primary-light' : checked ? 'bg-primary-light/40' : 'hover:bg-surface-alt'}`}>
      <label className="flex items-center pl-3.5 pr-1 cursor-pointer shrink-0">
        <input type="checkbox" checked={checked} onChange={() => onToggle(appeal.id)} className="w-4 h-4 accent-primary" aria-label={`Select ${appellantName(appeal)} for bulk action`} />
      </label>
      <button onClick={() => onSelect(appeal.id)} className="flex-1 text-left pl-2 pr-4 py-3.5 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={`text-sm font-semibold truncate ${active ? 'text-primary' : 'text-content'}`}>{appellantName(appeal)}</p>
          <AppealStatusPill status={appeal.status} size="sm" />
        </div>
        <p className="text-xs text-content-muted truncate">{appeal.reference_no ?? appeal.application_id}</p>
        {appeal.reason && <p className="text-xs font-medium text-content mt-1 truncate">{appeal.reason}</p>}
        {appeal.statement && <p className="text-xs text-content-muted mt-0.5 line-clamp-2 leading-snug">"{appeal.statement}"</p>}
      </button>
    </div>
  )
}

// ── Detail helpers ────────────────────────────────────────────

function InfoCard({ label, value, tone }) {
  return (
    <div className="border border-border rounded-lg p-4">
      <p className="text-xs text-content-muted">{label}</p>
      <p className={`text-sm font-semibold mt-1 ${tone ?? 'text-content'}`}>{value ?? '—'}</p>
    </div>
  )
}

// ── Detail pane ───────────────────────────────────────────────

function DetailPane({ appeal, onBack, onAction, busy }) {
  if (!appeal) {
    return (
      <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center gap-3 text-content-muted">
        <Inbox size={40} className="text-content-disabled" />
        <p className="text-sm">Select an appeal to review it.</p>
      </div>
    )
  }

  const decided = appeal.status === 'approved' || appeal.status === 'rejected'

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="lg:hidden text-content-muted hover:text-content" aria-label="Back"><ChevronLeft size={20} /></button>
        <div className="w-10 h-10 rounded-full bg-primary-light text-primary text-sm font-bold flex items-center justify-center shrink-0">
          {initials(appellantName(appeal))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-bold text-content">{appellantName(appeal)}</h2>
            <AppealStatusPill status={appeal.status} size="sm" />
          </div>
          <p className="text-xs text-content-muted mt-0.5">
            Appeal {appeal.reference_no ?? appeal.application_id} · Submitted {formatDate(appeal.created_at)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard label="Appeal Reason" value={appeal.reason} />
          <InfoCard label="Original Decision" value={APPLICATION_LABEL(appeal.original_status)} tone="text-danger" />
          <InfoCard label="Application ID" value={appeal.reference_no ?? appeal.application_id} />
        </div>

        <section className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-content pb-3 mb-3 border-b border-border">Student Statement</h3>
          <p className="text-sm text-content leading-relaxed whitespace-pre-line">
            {appeal.statement || 'No statement provided.'}
          </p>
        </section>

        {appeal.supporting_document_url && (
          <a
            href={appeal.supporting_document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-border rounded-lg px-4 py-2.5 hover:border-primary hover:bg-primary-light/40 transition-colors"
          >
            <FileText size={15} /> View Supporting Document <Download size={13} />
          </a>
        )}

        {appeal.decision_remarks && (
          <div className="bg-surface-alt border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-1">Decision Remarks</p>
            <p className="text-sm text-content leading-relaxed">{appeal.decision_remarks}</p>
          </div>
        )}
      </div>

      {/* Action bar */}
      {!decided ? (
        <div className="px-6 py-4 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => onAction('more_info')}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold border border-border text-secondary-dark bg-secondary-light px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <MessageSquare size={15} /> Request More Info
          </button>
          <button
            onClick={() => onAction('rejected')}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold border border-danger text-danger px-5 py-2.5 rounded-lg hover:bg-danger-light disabled:opacity-50 transition-colors"
          >
            <XCircle size={15} /> Reject Appeal
          </button>
          <button
            onClick={() => onAction('approved')}
            disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold bg-tertiary-dark text-white px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <CheckCircle2 size={15} /> Approve Appeal
          </button>
        </div>
      ) : (
        <div className="px-6 py-4 border-t border-border bg-surface-alt flex items-center gap-2 shrink-0">
          <ShieldAlert size={15} className="text-content-muted" />
          <p className="text-xs text-content-muted">
            This appeal has been {appeal.status === 'approved' ? 'approved — the application was reopened for review.' : 'rejected — the original decision stands.'}
          </p>
        </div>
      )}
    </div>
  )
}

// Original decision label (application status being appealed)
function APPLICATION_LABEL(status) {
  return { rejected: 'Not Approved', incomplete: 'Incomplete', approved: 'Approved' }[status] ?? (status ?? '—')
}

// ── Main ──────────────────────────────────────────────────────

export function AppealsPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const filter = searchParams.get('status') ?? 'pending'
  const [selectedId, setSelectedId] = useState(null)
  const [modalType, setModalType] = useState(null)   // single decision modal
  const [bulkType, setBulkType] = useState(null)      // bulk decision modal
  const [checked, setChecked] = useState(() => new Set())

  function setFilter(f) {
    setSearchParams(f === 'pending' ? {} : { status: f }, { replace: true })
    setSelectedId(null); setChecked(new Set())
  }

  const { data, isPending } = useQuery({
    queryKey: ['admin', 'appeals', filter],
    queryFn: () => api.get(`/admin/appeals${filter === 'all' ? '' : `?status=${filter}`}`).then((r) => r.data),
    retry: false,
  })

  const appeals = useMemo(() => data?.data ?? [], [data])
  const selected = appeals.find((a) => a.id === selectedId) ?? null
  const isDecided = (a) => !!a && (a.status === 'approved' || a.status === 'rejected')

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'appeals'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] })
  }

  const revertMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/appeals/${id}/revert`),
    onSuccess: () => { toast.success('Decision undone.'); invalidate() },
  })

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision, remarks }) => api.post(`/admin/appeals/${id}/decision`, { decision, remarks }),
    onSuccess: (_r, vars) => {
      const name = appellantName(appeals.find((a) => a.id === vars.id) ?? {})
      if (vars.decision === 'more_info') toast.success('Information request sent.')
      else undoToast(`Appeal ${vars.decision === 'approved' ? 'approved' : 'rejected'} — ${name}.`, () => revertMutation.mutate(vars.id))
      invalidate(); setModalType(null)
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed. Please try again.'),
  })

  const checkedIds = appeals.filter((a) => checked.has(a.id)).map((a) => a.id)
  const bulkMutation = useMutation({
    mutationFn: ({ ids, decision, remarks }) => api.post('/admin/appeals/bulk-decision', { ids, decision, remarks }),
    onSuccess: (_r, vars) => {
      const ids = vars.ids
      if (vars.decision !== 'more_info') {
        undoToast(`${ids.length} appeal${ids.length === 1 ? '' : 's'} ${vars.decision === 'approved' ? 'approved' : 'rejected'}.`, () => {
          api.post('/admin/appeals/bulk-revert', { ids }).then(() => { toast.success('Bulk decision undone.'); invalidate() })
        })
      } else toast.success(`Info requested on ${ids.length} appeal${ids.length === 1 ? '' : 's'}.`)
      invalidate(); setBulkType(null); setChecked(new Set())
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Bulk action failed.'),
  })

  function toggleCheck(id) {
    setChecked((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  // Keyboard triage: j/k move through the list; a/r/i decide the selected appeal.
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (document.querySelector('[role="dialog"]')) return
      if (!appeals.length) return
      const idx = appeals.findIndex((a) => a.id === selectedId)
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setSelectedId((appeals[Math.min(idx + 1, appeals.length - 1)] ?? appeals[0]).id) }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); setSelectedId((appeals[Math.max(idx - 1, 0)] ?? appeals[0]).id) }
      else if ((e.key === 'a' || e.key === 'r' || e.key === 'i') && selected && !isDecided(selected)) {
        setModalType({ a: 'approved', r: 'rejected', i: 'more_info' }[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [appeals, selectedId, selected])

  const pendingCount = appeals.filter((a) => a.status === 'pending').length

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-content">Appeal Handling</h1>
          <p className="text-xs text-content-muted mt-0.5">Review and adjudicate scholarship appeals.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <p className="hidden lg:block text-xs text-content-muted">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">j</kbd>/<kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">k</kbd> move ·{' '}
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">a</kbd>/<kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">r</kbd>/<kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">i</kbd> decide
          </p>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-surface text-content focus:outline-none focus:border-primary"
          >
            {FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* List */}
        <aside className={`${selectedId ? 'hidden lg:flex' : 'flex'} w-full lg:w-[360px] flex-col border-r border-border bg-surface shrink-0 min-h-0`}>
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-sm font-semibold text-content">
              {filter === 'pending' ? 'Pending Appeals' : 'Appeals'}
              <span className="ml-1.5 text-content-muted">({isPending ? '…' : appeals.length})</span>
            </p>
          </div>

          {checkedIds.length > 0 && (
            <div className="px-4 py-2.5 border-b border-border bg-primary-light flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-primary shrink-0">{checkedIds.length} selected</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <button onClick={() => setBulkType('approved')} className="text-xs font-semibold text-tertiary-dark border border-tertiary/40 bg-surface px-2.5 py-1 rounded-lg hover:bg-tertiary-light transition-colors">Approve</button>
                <button onClick={() => setBulkType('more_info')} className="text-xs font-semibold text-secondary-dark border border-secondary/40 bg-surface px-2.5 py-1 rounded-lg hover:bg-secondary-light transition-colors">Request info</button>
                <button onClick={() => setBulkType('rejected')} className="text-xs font-semibold text-danger border border-danger/40 bg-surface px-2.5 py-1 rounded-lg hover:bg-danger-light transition-colors">Reject</button>
                <button onClick={() => setChecked(new Set())} className="text-xs font-medium text-content-muted hover:text-content px-1.5 py-1" aria-label="Clear selection">Clear</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto min-h-0">
            {isPending ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            ) : appeals.length > 0 ? (
              appeals.map((a) => (
                <AppealRow key={a.id} appeal={a} active={a.id === selectedId} onSelect={setSelectedId} checked={checked.has(a.id)} onToggle={toggleCheck} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-20 px-6">
                <Inbox size={32} className="text-content-disabled" />
                <p className="text-sm text-content-muted">No appeals in this category.</p>
              </div>
            )}
          </div>
          <div className="px-4 py-2.5 border-t border-border text-xs text-content-muted shrink-0">
            {pendingCount} pending
          </div>
        </aside>

        {/* Detail */}
        <div className={`${selectedId ? 'flex' : 'hidden lg:flex'} flex-1 bg-surface-alt min-w-0`}>
          <DetailPane
            appeal={selected}
            busy={decisionMutation.isPending}
            onBack={() => setSelectedId(null)}
            onAction={(type) => setModalType(type)}
          />
        </div>
      </div>

      {modalType && selected && (
        <ActionModal
          type={modalType}
          isPending={decisionMutation.isPending}
          onClose={() => setModalType(null)}
          onConfirm={(remarks) => decisionMutation.mutate({ id: selected.id, decision: modalType, remarks })}
        />
      )}

      {bulkType && (
        <ActionModal
          type={bulkType}
          isPending={bulkMutation.isPending}
          onClose={() => setBulkType(null)}
          onConfirm={(remarks) => bulkMutation.mutate({ ids: checkedIds, decision: bulkType, remarks })}
        />
      )}
    </div>
  )
}
