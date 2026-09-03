import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, Inbox, Search, FileText, Download, CheckCircle2, XCircle, Flag,
  AlertTriangle, X, Loader2, History, GraduationCap, BadgeCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useDialog } from '../../lib/useDialog'
import { undoToast } from '../../lib/undoToast'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'
import {
  RENEWAL_STATUS, resolvePolicy, gwaPasses, initials, scholarName, formatDate,
} from '../../components/admin/scholars/scholarUtils'

const MODAL_CONFIG = {
  approved: {
    title: 'Approve Renewal',
    description: 'The scholarship continues for the next term and the scholar advances a semester.',
    reasonLabel: 'Remarks (optional)', reasonRequired: false,
    confirmLabel: 'Approve Renewal', confirmCls: 'bg-tertiary-dark text-white hover:opacity-90',
    Icon: CheckCircle2, iconCls: 'bg-tertiary-light text-tertiary-dark',
  },
  correction: {
    title: 'Request Correction',
    description: 'Ask the scholar to fix or re-upload something before a decision is made.',
    reasonLabel: 'What needs to be corrected?', reasonRequired: true,
    confirmLabel: 'Send Request', confirmCls: 'bg-secondary text-on-secondary hover:opacity-90',
    Icon: Flag, iconCls: 'bg-secondary-light text-on-secondary',
  },
  terminated: {
    title: 'Terminate Scholarship',
    description: 'This ends the scholarship. The scholar will be notified and moved to Terminated.',
    reasonLabel: 'Reason for termination', reasonRequired: true,
    confirmLabel: 'Terminate Scholarship', confirmCls: 'bg-danger text-white hover:opacity-90',
    Icon: XCircle, iconCls: 'bg-danger-light text-danger',
  },
}

function RenewalPill({ status }) {
  const cfg = RENEWAL_STATUS[status] ?? RENEWAL_STATUS.pending
  return <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>{cfg.label}</span>
}

// ── GWA ring ──────────────────────────────────────────────────

function GwaRing({ value, passed }) {
  const stroke = passed === false ? 'var(--color-danger)' : 'var(--color-tertiary-dark)'
  const r = 52
  const c = 2 * Math.PI * r
  // Ring is a visual accent for a single value; the number + badge carry the meaning.
  const pct = passed === false ? 0.45 : 0.8
  return (
    <div className="relative w-36 h-36 shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-border)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={stroke} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-content">{value ?? '—'}</span>
        <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wide">Submitted</span>
      </div>
    </div>
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
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="renewal-action-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconCls}`}><Icon size={20} /></div>
            <div className="flex-1">
              <h3 id="renewal-action-title" className="text-base font-bold text-content">{cfg.title}</h3>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">{cfg.description}</p>
            </div>
            <button onClick={onClose} className="text-content-muted hover:text-content shrink-0" aria-label="Close"><X size={18} /></button>
          </div>
          <div className="mt-5">
            <label htmlFor="renewal-reason" className="text-sm font-medium text-content">{cfg.reasonLabel}</label>
            <textarea id="renewal-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Type here…"
              className="mt-1.5 w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary resize-none" />
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canConfirm || isPending} onClick={() => onConfirm(reason.trim())}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${cfg.confirmCls}`}>
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {cfg.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail ────────────────────────────────────────────────────

function Detail({ renewal, policy, onAction, onDoc, busy, onBack }) {
  const passed = gwaPasses(renewal.submitted_gwa, policy)
  const decided = renewal.status === 'approved' || renewal.status === 'rejected'
  const docs = renewal.documents ?? []

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="lg:hidden text-content-muted hover:text-content" aria-label="Back"><ChevronLeft size={20} /></button>
        <div className="w-11 h-11 rounded-full bg-primary-light text-primary text-sm font-bold flex items-center justify-center shrink-0">
          {initials(scholarName(renewal))}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-bold text-content">{scholarName(renewal)}</h2>
            <RenewalPill status={renewal.status} />
          </div>
          <p className="text-xs text-content-muted mt-0.5">
            ID: {renewal.scholar_id ?? renewal.id} · {renewal.program ?? '—'}{renewal.year_level ? `, ${renewal.year_level}` : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-5">
        {/* Academic standing */}
        <section className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-primary-light/30 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-content inline-flex items-center gap-2"><GraduationCap size={16} className="text-primary" /> Academic Standing</h3>
            {passed != null && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${passed ? 'bg-tertiary-light text-tertiary-dark' : 'bg-danger-light text-danger'}`}>
                {passed ? <><BadgeCheck size={13} /> GWA Passed</> : <><AlertTriangle size={13} /> Below Requirement</>}
              </span>
            )}
          </div>
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 flex items-center gap-6 bg-surface-alt rounded-xl p-5">
              <GwaRing value={renewal.submitted_gwa} passed={passed} />
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-content-muted">Submitted GWA</span>
                    <span className="font-bold text-content">{renewal.submitted_gwa ?? '—'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div className={`h-full rounded-full ${passed === false ? 'bg-danger' : 'bg-tertiary-dark'}`} style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-content-muted">Required GWA</span>
                    <span className="font-bold text-content">{policy ? policy.min : '—'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border" />
                </div>
                {policy && (
                  <p className="text-xs text-content-muted">
                    {policy.name} · {policy.direction === 'higher_better' ? 'higher is better' : 'lower is better'}
                  </p>
                )}
                {!policy && <p className="text-xs text-content-muted">No program policy found — set a Min GWA in Maintenance.</p>}
              </div>
            </div>

            <div className="bg-surface-alt rounded-xl p-5 flex flex-col items-center justify-center text-center">
              <p className="text-3xl font-bold text-content">{renewal.back_subjects ?? 0}</p>
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mt-1">Back Subjects</p>
              <span className={`mt-3 text-xs px-3 py-1.5 rounded-full ${(renewal.back_subjects ?? 0) > 0 ? 'bg-secondary-light text-on-secondary' : 'bg-primary-light text-primary'}`}>
                {(renewal.back_subjects ?? 0) > 0 ? 'Needs review' : 'Cleared for current term'}
              </span>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-content pb-3 mb-4 border-b border-border inline-flex items-center gap-2">
            <FileText size={16} className="text-primary" /> Submitted Documents
            <span className="text-xs text-content-muted font-normal">({docs.length})</span>
          </h3>
          {docs.length > 0 ? (
            <div className="space-y-2.5">
              {docs.map((d) => (
                <div key={d.id ?? d.name} className="border border-border rounded-lg p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0"><FileText size={16} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content truncate">{d.name}</p>
                    <p className="text-xs text-content-muted">Uploaded {formatDate(d.uploaded_at)}</p>
                  </div>
                  <StatusPill status={d.status} kind="document" size="sm" />
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-content-muted hover:text-primary shrink-0" aria-label="View document"><Download size={15} /></a>
                  )}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => onDoc(d, 'verified')} disabled={busy || d.status === 'verified'}
                      className="p-1.5 rounded-lg border border-border text-tertiary-dark hover:bg-tertiary-light disabled:opacity-40 transition-colors" aria-label="Verify document"><CheckCircle2 size={15} /></button>
                    <button onClick={() => onDoc(d, 'rejected')} disabled={busy || d.status === 'rejected'}
                      className="p-1.5 rounded-lg border border-border text-danger hover:bg-danger-light disabled:opacity-40 transition-colors" aria-label="Reject document"><XCircle size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-content-muted py-4 text-center">No documents submitted.</p>
          )}
        </section>

        {/* Renewal history */}
        <section className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-bold text-content pb-3 mb-4 border-b border-border inline-flex items-center gap-2">
            <History size={16} className="text-primary" /> Renewal History
          </h3>
          {renewal.history?.length > 0 ? (
            <ol className="space-y-3">
              {renewal.history.map((h, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-content">{h.label ?? h.term}</p>
                    <p className="text-xs text-content-muted">{formatDate(h.date)}{h.gwa ? ` · GWA ${h.gwa}` : ''}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-content-muted">No previous renewals recorded.</p>
          )}
        </section>
      </div>

      {/* Actions */}
      {!decided ? (
        <div className="px-6 py-4 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
          <button onClick={() => onAction('terminated')} disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold border border-danger text-danger px-5 py-2.5 rounded-lg hover:bg-danger-light disabled:opacity-50 transition-colors">
            <XCircle size={15} /> Terminate Scholarship
          </button>
          <button onClick={() => onAction('correction')} disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold border border-border text-content-muted px-5 py-2.5 rounded-lg hover:border-primary hover:text-primary disabled:opacity-50 transition-colors">
            <Flag size={15} /> Request Correction
          </button>
          <button onClick={() => onAction('approved')} disabled={busy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-on-primary px-5 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
            <CheckCircle2 size={15} /> Approve Renewal
          </button>
        </div>
      ) : (
        <div className="px-6 py-4 border-t border-border bg-surface-alt flex items-center gap-2 shrink-0">
          <CheckCircle2 size={15} className="text-content-muted" />
          <p className="text-xs text-content-muted">
            This renewal has been {renewal.status === 'approved' ? 'approved.' : 'closed — the scholarship was terminated.'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function RenewalsPage() {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('scholar')
  const [search, setSearch] = useState('')
  const [needsAction, setNeedsAction] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [bulkType, setBulkType] = useState(null)
  const [checked, setChecked] = useState(() => new Set())

  const renewalsQuery = useQuery({
    queryKey: ['admin', 'renewals'],
    queryFn: () => api.get('/admin/renewals').then((r) => r.data),
    retry: false,
  })
  const policiesQuery = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'policies'],
    queryFn: () => api.get('/admin/maintenance/policies').then((r) => r.data),
    retry: false,
  })

  const renewals = useMemo(() => renewalsQuery.data?.data ?? [], [renewalsQuery.data])
  const policies = useMemo(() => policiesQuery.data?.data ?? [], [policiesQuery.data])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return renewals
      .filter((r) => !needsAction || r.status === 'pending')
      .filter((r) => !q || scholarName(r).toLowerCase().includes(q) || String(r.scholar_id ?? '').toLowerCase().includes(q))
  }, [renewals, search, needsAction])

  const selected = renewals.find((r) => String(r.id) === String(selectedId) || String(r.scholar_id) === String(selectedId)) ?? null
  const selectedPolicy = selected ? resolvePolicy(selected, policies) : null

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'renewals'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'scholars'] })
  }

  const revertMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/renewals/${id}/revert`),
    onSuccess: () => { toast.success('Decision undone.'); invalidate() },
  })

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision, remarks }) => api.post(`/admin/renewals/${id}/decision`, { decision, remarks }),
    onSuccess: (_r, v) => {
      const name = scholarName(renewals.find((r) => String(r.id) === String(v.id)) ?? {})
      if (v.decision === 'correction') toast.success('Correction requested.')
      else undoToast(`Renewal ${v.decision === 'approved' ? 'approved' : 'terminated'} — ${name}.`, () => revertMutation.mutate(v.id))
      invalidate()
      setModalType(null)
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed.'),
  })

  const docMutation = useMutation({
    mutationFn: ({ renewalId, docId, status }) => api.post(`/admin/renewals/${renewalId}/documents/${docId}/review`, { status }),
    onSuccess: () => { toast.success('Document updated.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not update document.'),
  })

  const checkedIds = filtered.filter((r) => checked.has(r.id)).map((r) => r.id)
  const bulkMutation = useMutation({
    mutationFn: ({ ids, decision, remarks }) => api.post('/admin/renewals/bulk-decision', { ids, decision, remarks }),
    onSuccess: (_r, v) => {
      const ids = v.ids
      if (v.decision === 'correction') toast.success(`Correction requested on ${ids.length} renewal${ids.length === 1 ? '' : 's'}.`)
      else undoToast(`${ids.length} renewal${ids.length === 1 ? '' : 's'} ${v.decision === 'approved' ? 'approved' : 'terminated'}.`, () => {
        api.post('/admin/renewals/bulk-revert', { ids }).then(() => { toast.success('Bulk decision undone.'); invalidate() })
      })
      invalidate(); setBulkType(null); setChecked(new Set())
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Bulk action failed.'),
  })

  function toggleCheck(id) {
    setChecked((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const busy = decisionMutation.isPending || docMutation.isPending
  const pendingCount = renewals.filter((r) => r.status === 'pending').length
  const isDecided = (r) => !!r && (r.status === 'approved' || r.status === 'rejected')

  function select(id) {
    setParams(id ? { scholar: String(id) } : {}, { replace: true })
  }

  // Keyboard triage: j/k move through the list; a/r/i decide the selected scholar.
  useEffect(() => {
    function onKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (document.querySelector('[role="dialog"]')) return
      if (!filtered.length) return
      const idx = filtered.findIndex((r) => String(r.id) === String(selectedId))
      if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); select((filtered[Math.min(idx + 1, filtered.length - 1)] ?? filtered[0]).id) }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); select((filtered[Math.max(idx - 1, 0)] ?? filtered[0]).id) }
      else if ((e.key === 'a' || e.key === 'r' || e.key === 'i') && selected && !isDecided(selected)) {
        setModalType({ a: 'approved', r: 'terminated', i: 'correction' }[e.key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtered, selectedId, selected]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface shrink-0 flex items-center justify-between gap-3">
        <div>
          <Link to="/admin/scholars" className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-primary transition-colors mb-1">
            <ChevronLeft size={14} /> Scholar Monitoring
          </Link>
          <h1 className="text-lg font-bold text-content">Renewal Review</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="hidden lg:block text-xs text-content-muted">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">j</kbd>/<kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">k</kbd> move ·{' '}
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">a</kbd>/<kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">r</kbd>/<kbd className="px-1.5 py-0.5 rounded border border-border bg-surface-alt font-mono">i</kbd> decide
          </p>
          <span className="text-xs text-content-muted">{pendingCount} pending</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* List */}
        <aside className={`${selected ? 'hidden lg:flex' : 'flex'} w-full lg:w-95 flex-col border-r border-border bg-surface shrink-0 min-h-0`}>
          <div className="p-4 border-b border-border shrink-0 space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search scholars…"
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary" />
            </div>
            <div className="flex items-center gap-2">
              {[{ k: false, l: 'All' }, { k: true, l: 'Needs Action' }].map((c) => (
                <button key={c.l} onClick={() => setNeedsAction(c.k)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${needsAction === c.k ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'}`}>
                  {c.l}
                </button>
              ))}
            </div>
          </div>

          {checkedIds.length > 0 && (
            <div className="px-4 py-2.5 border-b border-border bg-primary-light flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-primary shrink-0">{checkedIds.length} selected</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <button onClick={() => setBulkType('approved')} className="text-xs font-semibold text-tertiary-dark border border-tertiary/40 bg-surface px-2.5 py-1 rounded-lg hover:bg-tertiary-light transition-colors">Approve</button>
                <button onClick={() => setBulkType('correction')} className="text-xs font-semibold text-on-secondary border border-secondary/40 bg-surface px-2.5 py-1 rounded-lg hover:bg-secondary-light transition-colors">Correction</button>
                <button onClick={() => setBulkType('terminated')} className="text-xs font-semibold text-danger border border-danger/40 bg-surface px-2.5 py-1 rounded-lg hover:bg-danger-light transition-colors">Terminate</button>
                <button onClick={() => setChecked(new Set())} className="text-xs font-medium text-content-muted hover:text-content px-1.5 py-1" aria-label="Clear selection">Clear</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto min-h-0">
            {renewalsQuery.isPending ? (
              <div className="p-4 space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
            ) : filtered.length > 0 ? (
              filtered.map((r) => {
                const policy = resolvePolicy(r, policies)
                const active = String(r.id) === String(selectedId)
                return (
                  <div key={r.id} className={`flex items-stretch border-b border-border transition-colors ${active ? 'bg-primary-light' : checked.has(r.id) ? 'bg-primary-light/40' : 'hover:bg-surface-alt'}`}>
                    <label className="flex items-center pl-3.5 pr-1 cursor-pointer shrink-0">
                      <input type="checkbox" checked={checked.has(r.id)} onChange={() => toggleCheck(r.id)} className="w-4 h-4 accent-primary" aria-label={`Select ${scholarName(r)} for bulk action`} />
                    </label>
                    <button onClick={() => select(r.id)} className="flex-1 text-left pl-2 pr-4 py-4 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-primary' : 'text-content'}`}>{scholarName(r)}</p>
                        <RenewalPill status={r.status} />
                      </div>
                      <p className="text-xs text-content-muted truncate mb-3">{r.program ?? '—'}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-border rounded-lg px-3 py-2 bg-surface">
                          <p className="text-[10px] font-semibold text-content-muted uppercase">Submitted GWA</p>
                          <p className="text-sm font-bold text-content">{r.submitted_gwa ?? '—'}</p>
                        </div>
                        <div className="border border-border rounded-lg px-3 py-2 bg-surface">
                          <p className="text-[10px] font-semibold text-content-muted uppercase">Required GWA</p>
                          <p className="text-sm font-bold text-content">{policy ? policy.min : '—'}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-3 py-20 px-6">
                <Inbox size={32} className="text-content-disabled" />
                <p className="text-sm text-content-muted">No renewals to review.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Detail */}
        <div className={`${selected ? 'flex' : 'hidden lg:flex'} flex-1 bg-surface-alt min-w-0`}>
          {selected ? (
            <Detail
              renewal={selected}
              policy={selectedPolicy}
              busy={busy}
              onBack={() => select(null)}
              onAction={(type) => setModalType(type)}
              onDoc={(doc, status) => docMutation.mutate({ renewalId: selected.id, docId: doc.id, status })}
            />
          ) : (
            <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center gap-3 text-content-muted">
              <Inbox size={40} className="text-content-disabled" />
              <p className="text-sm">Select a scholar to review their renewal.</p>
            </div>
          )}
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
