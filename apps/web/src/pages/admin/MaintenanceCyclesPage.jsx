import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  CalendarRange,
  FolderOpen,
  FileText,
  Trash2,
  PencilLine,
  X,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useDialog } from '../../lib/useDialog'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

const CYCLE_STATUS = {
  active:   { label: 'Active',   cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30', accent: 'border-l-tertiary' },
  upcoming: { label: 'Upcoming', cls: 'bg-secondary-light text-on-secondary border-secondary/30', accent: 'border-l-secondary' },
  past:     { label: 'Past',     cls: 'bg-surface-alt text-content-muted border-border',          accent: 'border-l-border' },
}

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Cycle modal ───────────────────────────────────────────────

function CycleModal({ cycle, isPending, onClose, onSubmit }) {
  const dialogRef = useDialog(onClose)
  const editing = !!cycle?.id
  const [form, setForm] = useState({
    name: cycle?.name ?? '',
    academic_year: cycle?.academic_year ?? '',
    status: cycle?.status ?? 'upcoming',
    starts_at: cycle?.starts_at ? String(cycle.starts_at).slice(0, 10) : '',
    ends_at: cycle?.ends_at ? String(cycle.ends_at).slice(0, 10) : '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.name.trim() && form.starts_at && form.ends_at

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cycle-modal-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 id="cycle-modal-title" className="text-base font-bold text-content">{editing ? 'Edit Cycle' : 'New Application Cycle'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-name" className="text-sm font-medium text-content">Cycle Name</label>
            <input id="c-name" type="text" value={form.name} onChange={set('name')} placeholder="e.g. 1st Semester Intake" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-ay" className="text-sm font-medium text-content">Academic Year</label>
              <input id="c-ay" type="text" value={form.academic_year} onChange={set('academic_year')} placeholder="2026–2027" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-status" className="text-sm font-medium text-content">Status</label>
              <select id="c-status" value={form.status} onChange={set('status')} className={inputCls}>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-start" className="text-sm font-medium text-content">Starts</label>
              <input id="c-start" type="date" value={form.starts_at} onChange={set('starts_at')} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="c-end" className="text-sm font-medium text-content">Ends</label>
              <input id="c-end" type="date" value={form.ends_at} onChange={set('ends_at')} className={inputCls} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canSave || isPending} onClick={() => onSubmit(form)} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save Changes' : 'Create Cycle'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Document modal ────────────────────────────────────────────

function DocModal({ doc, isPending, onClose, onSubmit }) {
  const dialogRef = useDialog(onClose)
  const editing = !!doc?.id
  const [form, setForm] = useState({
    name: doc?.name ?? '',
    note: doc?.note ?? '',
    requirement: doc?.requirement ?? 'required',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.name.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="doc-modal-title" className="relative bg-surface rounded-xl shadow-modal w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 id="doc-modal-title" className="text-base font-bold text-content">{editing ? 'Edit Document' : 'Add Required Document'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="d-name" className="text-sm font-medium text-content">Document Type</label>
            <input id="d-name" type="text" value={form.name} onChange={set('name')} placeholder="e.g. Certificate of Enrollment" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="d-note" className="text-sm font-medium text-content flex items-center gap-1.5">Note <span className="text-xs text-content-muted font-normal">(Optional)</span></label>
            <input id="d-note" type="text" value={form.note} onChange={set('note')} placeholder="e.g. Current semester" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="d-req" className="text-sm font-medium text-content">Requirement</label>
            <select id="d-req" value={form.requirement} onChange={set('requirement')} className={inputCls}>
              <option value="required">Required</option>
              <option value="optional">Optional</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canSave || isPending} onClick={() => onSubmit(form)} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save' : 'Add Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function MaintenanceCyclesPage() {
  const queryClient = useQueryClient()
  const [cycleModal, setCycleModal] = useState(null)
  const [docModal, setDocModal] = useState(null)

  const cyclesQuery = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'cycles'],
    queryFn: () => api.get('/admin/maintenance/cycles').then((r) => r.data),
    retry: false,
  })
  const docsQuery = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'documents'],
    queryFn: () => api.get('/admin/maintenance/documents').then((r) => r.data),
    retry: false,
  })

  const cycles = useMemo(() => cyclesQuery.data?.data ?? [], [cyclesQuery.data])
  const docs = useMemo(() => docsQuery.data?.data ?? [], [docsQuery.data])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all })

  const cycleSave = useMutation({
    mutationFn: (p) => (p.id ? api.put(`/admin/maintenance/cycles/${p.id}`, p) : api.post('/admin/maintenance/cycles', p)),
    onSuccess: () => { toast.success('Cycle saved.'); invalidate(); setCycleModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save cycle.'),
  })
  const cycleDelete = useMutation({
    mutationFn: (c) => api.delete(`/admin/maintenance/cycles/${c.id}`),
    onSuccess: () => { toast.success('Cycle deleted.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })
  const docSave = useMutation({
    mutationFn: (p) => (p.id ? api.put(`/admin/maintenance/documents/${p.id}`, p) : api.post('/admin/maintenance/documents', p)),
    onSuccess: () => { toast.success('Document saved.'); invalidate(); setDocModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save document.'),
  })
  const docDelete = useMutation({
    mutationFn: (d) => api.delete(`/admin/maintenance/documents/${d.id}`),
    onSuccess: () => { toast.success('Document removed.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not remove.'),
  })

  function updateRequirement(doc, requirement) {
    docSave.mutate({ ...doc, requirement })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link to="/admin/maintenance" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors mb-3">
          <ChevronLeft size={15} /> Maintenance Hub
        </Link>
        <h1 className="text-2xl font-bold text-content">Application Cycles &amp; Documents</h1>
        <p className="text-sm text-content-muted mt-1">Manage the timing of application periods and define the required paperwork for applicants.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Application Cycles ──────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2"><CalendarRange size={17} className="text-primary" /> Application Cycles</h2>
            <button onClick={() => setCycleModal({})} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Plus size={14} /> New Cycle</button>
          </div>

          {cyclesQuery.isPending ? (
            <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
          ) : cycles.length > 0 ? (
            <div className="space-y-3">
              {cycles.map((c) => {
                const st = CYCLE_STATUS[c.status] ?? CYCLE_STATUS.upcoming
                return (
                  <div key={c.id} className={`bg-surface border border-border border-l-4 ${st.accent} rounded-xl shadow-card p-5`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                        {c.academic_year && <span className="text-xs text-content-muted">A.Y. {c.academic_year}</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => setCycleModal(c)} className="p-1.5 text-content-muted hover:text-primary" aria-label="Edit cycle"><PencilLine size={14} /></button>
                        <button onClick={() => cycleDelete.mutate(c)} className="p-1.5 text-content-muted hover:text-danger" aria-label="Delete cycle"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p className="text-base font-bold text-content mt-2">{c.name}</p>
                    <div className="grid grid-cols-2 gap-4 mt-3 bg-surface-alt rounded-lg p-3">
                      <div><p className="text-xs text-content-muted">Starts</p><p className="text-sm font-medium text-content">{formatDate(c.starts_at)}</p></div>
                      <div><p className="text-xs text-content-muted">Ends</p><p className="text-sm font-medium text-content">{formatDate(c.ends_at)}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-card p-8 flex flex-col items-center text-center gap-2">
              <CalendarRange size={26} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No application cycles yet.</p>
            </div>
          )}
        </section>

        {/* ── Required Documents ──────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-content inline-flex items-center gap-2"><FolderOpen size={17} className="text-primary" /> Required Documents</h2>
            <button onClick={() => setDocModal({})} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><Plus size={14} /> Add Doc</button>
          </div>

          {docsQuery.isPending ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : docs.length > 0 ? (
            <div className="bg-surface border border-border rounded-xl shadow-card divide-y divide-border">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 rounded-lg bg-primary-light flex items-center justify-center shrink-0"><FileText size={16} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-content truncate">{d.name}</p>
                    {d.note && <p className="text-xs text-content-muted truncate">{d.note}</p>}
                  </div>
                  <select
                    value={d.requirement ?? 'required'}
                    onChange={(e) => updateRequirement(d, e.target.value)}
                    className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-content focus:outline-none focus:border-primary"
                  >
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>
                  <button onClick={() => setDocModal(d)} className="p-1.5 text-content-muted hover:text-primary" aria-label="Edit document"><PencilLine size={14} /></button>
                  <button onClick={() => docDelete.mutate(d)} className="p-1.5 text-content-muted hover:text-danger" aria-label="Remove document"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-card p-8 flex flex-col items-center text-center gap-2">
              <FileText size={26} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No required documents defined yet.</p>
            </div>
          )}
        </section>
      </div>

      {cycleModal && (
        <CycleModal cycle={cycleModal.id ? cycleModal : null} isPending={cycleSave.isPending} onClose={() => setCycleModal(null)} onSubmit={(form) => cycleSave.mutate(cycleModal.id ? { ...cycleModal, ...form } : form)} />
      )}
      {docModal && (
        <DocModal doc={docModal.id ? docModal : null} isPending={docSave.isPending} onClose={() => setDocModal(null)} onSubmit={(form) => docSave.mutate(docModal.id ? { ...docModal, ...form } : form)} />
      )}
    </div>
  )
}
