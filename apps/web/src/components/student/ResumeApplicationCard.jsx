import { Link } from 'react-router-dom'
import { FilePlus, ArrowRight } from 'lucide-react'
import { useBrand } from '../../tenant/TenantContext'
import { readDraft, draftProgress, hasDraftInProgress } from '../../lib/applicationDraft'

// Prompts a scholar to resume a saved-but-unsubmitted application. Self-hides when
// no draft is in progress, so parents can render it unconditionally in their
// "not applied yet" branch (never shown once an application has been submitted).
export function ResumeApplicationCard({ className = '' }) {
  const brand = useBrand()
  const draft = readDraft()
  if (!hasDraftInProgress(draft)) return null
  const pct = draftProgress(draft, { hasEssay: brand.features?.essay !== false })

  return (
    <div className={`bg-surface border border-primary/30 rounded-xl shadow-card p-5 flex flex-col gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
          <FilePlus size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-content">Continue your application</p>
          <p className="text-xs text-content-muted mt-0.5">You have an unfinished application saved on this device.</p>
        </div>
        <span className="text-sm font-bold text-primary tabular-nums shrink-0">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-alt overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Application progress">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <Link
        to="/apply"
        className="inline-flex items-center justify-center gap-1.5 bg-primary text-on-primary text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors mt-1"
      >
        Continue application <ArrowRight size={15} />
      </Link>
    </div>
  )
}
