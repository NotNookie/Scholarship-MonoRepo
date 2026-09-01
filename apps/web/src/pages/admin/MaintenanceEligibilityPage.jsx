import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, ChevronLeft, MapPin, CheckSquare, Banknote, ShieldCheck, ListPlus,
  PencilLine, Trash2, X, Loader2, SlidersHorizontal,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { useEscapeToClose } from '../../lib/useEscapeToClose'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

// Baseline eligibility requirements — apply to ALL programs, drive the public
// "How to Qualify" list + the staff verification checklist. Passive (no auto-decision).

const RULE_TYPES = {
  residency:   { label: 'Residency',          Icon: MapPin,      cls: 'bg-primary-light text-primary',       value: 'years',  valueLabel: 'Minimum years of residency', unit: 'years' },
  voter:       { label: 'Voter Registration', Icon: CheckSquare, cls: 'bg-tertiary-light text-tertiary-dark', value: null },
  income:      { label: 'Income Threshold',   Icon: Banknote,    cls: 'bg-secondary-light text-on-secondary', value: 'amount', valueLabel: 'Maximum household income (₱ / year)' },
  attestation: { label: 'Attestation',        Icon: ShieldCheck, cls: 'bg-primary-light text-primary',       value: null },
  custom:      { label: 'Custom',             Icon: ListPlus,    cls: 'bg-surface-alt text-content-muted',    value: null },
}
const TYPE_OPTIONS = Object.entries(RULE_TYPES).map(([v, cfg]) => ({ value: v, label: cfg.label }))
const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function ruleValueText(rule) {
  const cfg = RULE_TYPES[rule.type]
  if (!cfg?.value || rule.value == null || rule.value === '') return null
  if (cfg.value === 'years') return `${rule.value} ${Number(rule.value) === 1 ? 'year' : 'years'}`
  if (cfg.value === 'amount') return `₱${Number(rule.value).toLocaleString()} / yr`
  return String(rule.value)
}

// ── Rule modal ────────────────────────────────────────────────

function RuleModal({ rule, isPending, onClose, onSubmit }) {
  useEscapeToClose(onClose)
  const editing = !!rule?.id
  const [form, setForm] = useState({
    type: rule?.type ?? 'attestation',
    label: rule?.label ?? '',
    description: rule?.description ?? '',
    value: rule?.value ?? '',
    active: rule?.active ?? true,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const cfg = RULE_TYPES[form.type]
  const canSave = form.label.trim() && (!cfg.value || String(form.value).trim() !== '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-content">{editing ? 'Edit Requirement' : 'New Requirement'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="r-type" className="text-sm font-medium text-content">Requirement Type</label>
            <select id="r-type" value={form.type} onChange={set('type')} className={inputCls}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="r-label" className="text-sm font-medium text-content">Label</label>
            <input id="r-label" value={form.label} onChange={set('label')} placeholder="e.g. Bonafide Resident" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="r-desc" className="text-sm font-medium text-content">Description</label>
            <textarea id="r-desc" rows={2} value={form.description} onChange={set('description')} placeholder="Shown on the public 'How to Qualify' list and the staff verification checklist." className={`${inputCls} resize-none`} />
          </div>
          {cfg.value && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="r-value" className="text-sm font-medium text-content">{cfg.valueLabel}</label>
              <input id="r-value" type="number" min="0" value={form.value} onChange={set('value')} placeholder={cfg.value === 'years' ? '3' : '250000'} className={inputCls} />
            </div>
          )}
          <label className="flex items-center gap-2.5 text-sm text-content cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            Active — show on public requirements &amp; verification checklist
          </label>
        </div>
        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button disabled={!canSave || isPending} onClick={() => onSubmit({ ...form, value: cfg.value ? form.value : null })}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save Changes' : 'Add Requirement'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteModal({ rule, isPending, onClose, onConfirm }) {
  useEscapeToClose(onClose)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
          <div>
            <h3 className="text-base font-bold text-content">Remove requirement?</h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">"{rule.label}" will be removed from the public list and verification checklist.</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content">Cancel</button>
          <button disabled={isPending} onClick={onConfirm} className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
            {isPending && <Loader2 size={15} className="animate-spin" />} Remove
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function MaintenanceEligibilityPage() {
  const queryClient = useQueryClient()
  const [modal, setModal] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: [...queryKeys.maintenance.all, 'eligibility'],
    queryFn: () => api.get('/admin/maintenance/eligibility-rules').then((r) => r.data),
    retry: false,
  })

  const rules = useMemo(() => data?.data ?? [], [data])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.all })

  const saveMutation = useMutation({
    mutationFn: (p) => (p.id ? api.put(`/admin/maintenance/eligibility-rules/${p.id}`, p) : api.post('/admin/maintenance/eligibility-rules', p)),
    onSuccess: () => { toast.success('Requirement saved.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save.'),
  })
  const toggleMutation = useMutation({
    mutationFn: (r) => api.patch(`/admin/maintenance/eligibility-rules/${r.id}`, { active: !r.active }),
    onSuccess: () => invalidate(),
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed.'),
  })
  const deleteMutation = useMutation({
    mutationFn: (r) => api.delete(`/admin/maintenance/eligibility-rules/${r.id}`),
    onSuccess: () => { toast.success('Requirement removed.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not remove.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/admin/maintenance" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors mb-3">
          <ChevronLeft size={15} /> Maintenance Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-content">Eligibility Rules</h1>
            <p className="text-sm text-content-muted mt-1 max-w-2xl">
              Baseline requirements that apply to <span className="font-semibold text-content">all</span> scholarship programs.
              These drive the public "How to Qualify" list and the staff verification checklist.
            </p>
          </div>
          <button onClick={() => setModal({ mode: 'edit' })} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0">
            <Plus size={15} /> Add Requirement
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : rules.length > 0 ? (
        <div className="bg-surface border border-border rounded-xl shadow-card divide-y divide-border">
          {rules.map((rule) => {
            const cfg = RULE_TYPES[rule.type] ?? RULE_TYPES.custom
            const valueText = ruleValueText(rule)
            return (
              <div key={rule.id} className={`flex items-center gap-4 p-5 ${rule.active ? '' : 'opacity-60'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cfg.cls}`}><cfg.Icon size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-content">{rule.label}</p>
                    <span className="text-xs font-semibold text-content-muted bg-surface-alt border border-border px-2 py-0.5 rounded-full">{cfg.label}</span>
                    {valueText && <span className="text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">{valueText}</span>}
                  </div>
                  {rule.description && <p className="text-xs text-content-muted mt-1 leading-relaxed">{rule.description}</p>}
                </div>
                <button onClick={() => toggleMutation.mutate(rule)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${rule.active ? 'bg-primary' : 'bg-border'}`}
                  role="switch" aria-checked={rule.active} aria-label={`${rule.active ? 'Deactivate' : 'Activate'} ${rule.label}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${rule.active ? 'translate-x-5' : ''}`} />
                </button>
                <button onClick={() => setModal({ mode: 'edit', rule })} className="p-1.5 text-content-muted hover:text-primary transition-colors shrink-0" aria-label="Edit requirement"><PencilLine size={15} /></button>
                <button onClick={() => setModal({ mode: 'delete', rule })} className="p-1.5 text-content-muted hover:text-danger transition-colors shrink-0" aria-label="Remove requirement"><Trash2 size={15} /></button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-3">
          <SlidersHorizontal size={30} className="text-content-disabled" />
          <p className="text-sm font-semibold text-content">No eligibility rules yet.</p>
          <p className="text-xs text-content-muted max-w-sm">Add baseline requirements like residency, voter registration, income limits, or custom attestations.</p>
          <button onClick={() => setModal({ mode: 'edit' })} className="text-sm text-primary hover:underline">Add your first requirement</button>
        </div>
      )}

      {modal?.mode === 'edit' && (
        <RuleModal rule={modal.rule} isPending={saveMutation.isPending} onClose={() => setModal(null)}
          onSubmit={(form) => saveMutation.mutate(modal.rule ? { ...modal.rule, ...form } : form)} />
      )}
      {modal?.mode === 'delete' && (
        <DeleteModal rule={modal.rule} isPending={deleteMutation.isPending} onClose={() => setModal(null)} onConfirm={() => deleteMutation.mutate(modal.rule)} />
      )}
    </div>
  )
}
