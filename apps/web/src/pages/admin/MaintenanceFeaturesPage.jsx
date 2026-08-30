import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft, ScanText, Sparkles, Check, Loader2, Zap, Coins, Info, ShieldCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

// OCR is free/local so it defaults on; the AI writer can carry usage cost so it
// stays opt-in. Both live in the shared maintenance settings blob.
const DEFAULTS = { feature_ocr: true, feature_ai_text: false }

const FEATURES = [
  {
    key: 'feature_ocr',
    Icon: ScanText,
    name: 'Document OCR Validation',
    recommended: true,
    desc: 'Reads text from uploaded documents (report cards, certificates, IDs) to help staff verify details faster during review.',
    note: 'Decision-support only — it never approves or rejects an application on its own. Staff always make the final call.',
    cost: { Icon: Zap, label: 'Free · runs locally', cls: 'text-success' },
  },
  {
    key: 'feature_ai_text',
    Icon: Sparkles,
    name: 'AI Announcement Assistant',
    desc: 'Helps staff draft the wording of announcements. Generated text can be reviewed and edited before it is published.',
    note: 'Optional. Staff stay in full control of the final wording — nothing is posted automatically.',
    cost: { Icon: Coins, label: 'Uses an AI service · may incur cost', cls: 'text-content-muted' },
  },
]

function Toggle({ id, checked, onChange, label }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        checked ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export function MaintenanceFeaturesPage() {
  const queryClient = useQueryClient()
  const [edits, setEdits] = useState({})

  const { data, isPending } = useQuery({
    queryKey: queryKeys.maintenance.settings(),
    queryFn: () => api.get('/admin/maintenance/settings').then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  // Merge onto the existing settings blob so we preserve fields other
  // maintenance pages own (branding, contact, theme…) when we save.
  const form = { ...DEFAULTS, ...(data ?? {}), ...edits }
  const setFlag = (k) => setEdits((prev) => ({ ...prev, [k]: !form[k] }))
  const dirty = Object.keys(edits).length > 0

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put('/admin/maintenance/settings', payload),
    onSuccess: () => {
      toast.success('Feature settings saved.')
      queryClient.invalidateQueries({ queryKey: queryKeys.maintenance.settings() })
      setEdits({})
    },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save settings.'),
  })

  if (isPending) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Link to="/admin/maintenance" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors mb-3">
            <ChevronLeft size={15} /> Maintenance Hub
          </Link>
          <h1 className="text-2xl font-bold text-content">Assistive Features</h1>
          <p className="text-sm text-content-muted mt-1">
            Turn optional tools on or off. These assist your staff — they never make decisions automatically.
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending || !dirty}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Changes
        </button>
      </div>

      {/* Feature toggles */}
      <div className="flex flex-col gap-4">
        {FEATURES.map((f) => {
          const on = form[f.key]
          return (
            <section
              key={f.key}
              className={`bg-surface border rounded-xl shadow-card p-6 transition-colors ${on ? 'border-primary/30' : 'border-border'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${on ? 'bg-primary-light text-primary' : 'bg-surface-alt text-content-muted'}`}>
                  <f.Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-bold text-content">{f.name}</h2>
                    {f.recommended && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-tertiary-light text-tertiary-dark">
                        Recommended
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${f.cost.cls}`}>
                      <f.cost.Icon size={12} /> {f.cost.label}
                    </span>
                  </div>
                  <p className="text-sm text-content-muted mt-1.5 leading-relaxed">{f.desc}</p>
                </div>

                <Toggle id={f.key} checked={on} onChange={() => setFlag(f.key)} label={`Enable ${f.name}`} />
              </div>

              <div className="mt-4 flex items-start gap-2 bg-surface-alt border border-border rounded-lg px-3.5 py-2.5">
                <ShieldCheck size={15} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-content-muted leading-relaxed">{f.note}</p>
              </div>
            </section>
          )
        })}
      </div>

      {/* Footnote */}
      <div className="flex items-start gap-2 text-xs text-content-muted">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Changes apply to your municipality only. OCR runs on the server at no per-use cost; the AI assistant
          calls an external service, so leave it off if you'd rather not use it.
        </p>
      </div>
    </div>
  )
}
