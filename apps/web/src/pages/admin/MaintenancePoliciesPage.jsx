import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Award,
  PencilLine,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

// NOTE: grant amount, slots/quota, and per-program required-document lists are
// intentionally NOT included yet — pending the user's decision on policy fields.

const STATUS_STYLES = {
  active:  { label: 'Active',       cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30', bar: 'bg-primary' },
  draft:   { label: 'Draft Review', cls: 'bg-secondary-light text-on-secondary border-secondary/30', bar: 'bg-secondary' },
}

const GWA_DIRECTIONS = [
  { value: 'lower_better', label: 'Lower is better (1.00–5.00)' },
  { value: 'higher_better', label: 'Higher is better (%, e.g. 85)' },
]

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function parseTags(str) {
  return str.split(',').map((t) => t.trim()).filter(Boolean)
}

// ── Policy card ───────────────────────────────────────────────

function PolicyCard({ policy, onEdit, onDelete }) {
  const st = STATUS_STYLES[policy.status] ?? STATUS_STYLES.draft
  const dir = policy.gwa_direction === 'higher_better' ? '≥' : '≤'
  return (
    <article className="bg-surface border border-border rounded-xl shadow-card overflow-hidden flex flex-col">
      <div className={`h-1 ${st.bar}`} />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center"><Award size={18} className="text-primary" /></div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
        </div>

        <h3 className="text-lg font-bold text-content">{policy.name}</h3>
        <p className="text-sm text-content-muted mt-1.5 leading-relaxed flex-1">{policy.description}</p>

        <div className="bg-surface-alt rounded-lg p-4 mt-5 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-content-muted">Min. GWA</span>
            <span className="font-semibold text-content">{policy.min_gwa != null ? `${dir} ${policy.min_gwa}` : '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-content-muted">Income Cap</span>
            <span className="font-semibold text-content">{policy.income_cap != null ? `₱${Number(policy.income_cap).toLocaleString()}/yr` : '—'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-content-muted">Residency</span>
            <span className="font-semibold text-content">{policy.residency_years != null ? `${policy.residency_years} Years` : '—'}</span>
          </div>
        </div>

        {policy.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {policy.tags.map((t) => (
              <span key={t} className="text-xs font-medium px-2.5 py-1 rounded-md bg-primary-light text-primary">{t}</span>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-surface-alt border-t border-border flex items-center gap-3">
        <button onClick={() => onEdit(policy)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
          <PencilLine size={14} /> Edit Policy
        </button>
        <button onClick={() => onDelete(policy)} className="text-content-muted hover:text-danger transition-colors p-2" aria-label="Delete policy"><Trash2 size={15} /></button>
      </div>
    </article>
  )
}

// ── Policy modal ──────────────────────────────────────────────

function PolicyModal({ policy, isPending, onClose, onSubmit }) {
  const editing = !!policy?.id
  const [form, setForm] = useState({
    name: policy?.name ?? '',
    description: policy?.description ?? '',
    status: policy?.status ?? 'draft',
    min_gwa: policy?.min_gwa ?? '',
    gwa_direction: policy?.gwa_direction ?? 'lower_better',
    income_cap: policy?.income_cap ?? '',
    residency_years: policy?.residency_years ?? '',
    tags: (policy?.tags ?? []).join(', '),
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.name.trim()

  function submit() {
    onSubmit({
      ...form,
      min_gwa: form.min_gwa === '' ? null : Number(form.min_gwa),
      income_cap: form.income_cap === '' ? null : Number(form.income_cap),
      residency_years: form.residency_years === '' ? null : Number(form.residency_years),
      tags: parseTags(form.tags),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-content">{editing ? 'Edit Program Policy' : 'New Program Policy'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-name" className="text-sm font-medium text-content">Program Name</label>
            <input id="p-name" type="text" value={form.name} onChange={set('name')} placeholder="e.g. Academic Excellence" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-desc" className="text-sm font-medium text-content">Description</label>
            <textarea id="p-desc" rows={2} value={form.description} onChange={set('description')} placeholder="Short description of the program…" className={`${inputCls} resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-status" className="text-sm font-medium text-content">Status</label>
              <select id="p-status" value={form.status} onChange={set('status')} className={inputCls}>
                <option value="active">Active</option>
                <option value="draft">Draft Review</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-residency" className="text-sm font-medium text-content">Residency (years)</label>
              <input id="p-residency" type="number" min="0" value={form.residency_years} onChange={set('residency_years')} placeholder="3" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-gwa" className="text-sm font-medium text-content">Min. GWA</label>
              <input id="p-gwa" type="number" step="0.01" value={form.min_gwa} onChange={set('min_gwa')} placeholder="1.75" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="p-dir" className="text-sm font-medium text-content">GWA Direction</label>
              <select id="p-dir" value={form.gwa_direction} onChange={set('gwa_direction')} className={inputCls}>
                {GWA_DIRECTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-income" className="text-sm font-medium text-content">Income Cap (₱ / year)</label>
            <input id="p-income" type="number" min="0" value={form.income_cap} onChange={set('income_cap')} placeholder="250000" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-tags" className="text-sm font-medium text-content flex items-center gap-1.5">
              Eligibility Tags <span className="text-xs text-content-muted font-normal">(comma-separated)</span>
            </label>
            <input id="p-tags" type="text" value={form.tags} onChange={set('tags')} placeholder="STEM Priority, Full Load" className={inputCls} />
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canSave || isPending} onClick={submit} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save Changes' : 'Create Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────

function DeleteModal({ policy, isPending, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
          <div>
            <h3 className="text-base font-bold text-content">Delete policy?</h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">"{policy.name}" will be permanently removed. Existing scholars are not affected.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content">Cancel</button>
          <button disabled={isPending} onClick={onConfirm} className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function MaintenancePoliciesPage() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'policies'],
    queryFn: () => api.get('/admin/maintenance/policies').then((r) => r.data),
    retry: false,
  })

  const policies = useMemo(() => data?.data ?? [], [data])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      payload.id
        ? api.put(`/admin/maintenance/policies/${payload.id}`, payload)
        : api.post('/admin/maintenance/policies', payload),
    onSuccess: () => { toast.success('Policy saved.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save policy.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (policy) => api.delete(`/admin/maintenance/policies/${policy.id}`),
    onSuccess: () => { toast.success('Policy deleted.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + header */}
      <div>
        <Link to="/admin/maintenance" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors mb-3">
          <ChevronLeft size={15} /> Maintenance Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-content">Scholarship Policies &amp; Eligibility</h1>
            <p className="text-sm text-content-muted mt-1">Manage baseline requirements, thresholds, and eligibility tags per program. Changes apply to future cycles.</p>
          </div>
          <button onClick={() => setModal({ mode: 'edit' })} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0">
            <Plus size={15} /> New Program Policy
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
        </div>
      ) : policies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {policies.map((p) => (
            <PolicyCard key={p.id} policy={p} onEdit={(pol) => setModal({ mode: 'edit', policy: pol })} onDelete={(pol) => setModal({ mode: 'delete', policy: pol })} />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-3">
          <Award size={30} className="text-content-disabled" />
          <p className="text-sm font-semibold text-content">No scholarship policies yet.</p>
          <button onClick={() => setModal({ mode: 'edit' })} className="text-sm text-primary hover:underline">Create your first program policy</button>
        </div>
      )}

      {(modal?.mode === 'edit') && (
        <PolicyModal
          policy={modal.policy}
          isPending={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSubmit={(form) => saveMutation.mutate(modal.policy ? { ...modal.policy, ...form } : form)}
        />
      )}
      {modal?.mode === 'delete' && (
        <DeleteModal policy={modal.policy} isPending={deleteMutation.isPending} onClose={() => setModal(null)} onConfirm={() => deleteMutation.mutate(modal.policy)} />
      )}
    </div>
  )
}
