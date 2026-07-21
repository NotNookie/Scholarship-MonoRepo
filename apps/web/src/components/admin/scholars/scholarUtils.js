// Scholar lifecycle — the post-award side. A scholar is created when an
// application is approved (see [[design-scholar-lifecycle]]).

export const SCHOLAR_STATUS = {
  active:       { label: 'Active',       cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30' },
  renewal_due:  { label: 'Renewal Due',  cls: 'bg-secondary-light text-on-secondary border-secondary/30' },
  renewed:      { label: 'Renewed',      cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30' },
  at_risk:      { label: 'At Risk',      cls: 'bg-danger-light text-danger border-danger/30' },
  terminated:   { label: 'Terminated',   cls: 'bg-surface-alt text-content-muted border-border' },
  graduated:    { label: 'Graduated',    cls: 'bg-primary-light text-primary border-primary/20' },
}

export const RENEWAL_STATUS = {
  pending:    { label: 'Pending',        cls: 'bg-secondary-light text-on-secondary border-secondary/30' },
  correction: { label: 'Needs Correction', cls: 'bg-primary-light text-primary border-primary/20' },
  approved:   { label: 'Approved',       cls: 'bg-tertiary-light text-tertiary-dark border-tertiary/30' },
  rejected:   { label: 'Terminated',     cls: 'bg-danger-light text-danger border-danger/30' },
}

/**
 * Resolve a scholar's required GWA LIVE from their program policy
 * (confirmed decision: policy changes apply to the next renewal, which is a new cycle).
 * Returns { min, direction } or null when no policy matches.
 */
export function resolvePolicy(scholar, policies = []) {
  if (!scholar) return null
  const policy =
    policies.find((p) => p.id != null && p.id === scholar.policy_id) ??
    policies.find((p) => p.name && (p.name === scholar.program || p.name === scholar.scholarship_name))
  if (!policy || policy.min_gwa == null) return null
  return { min: Number(policy.min_gwa), direction: policy.gwa_direction ?? 'lower_better', name: policy.name }
}

/** Lower-is-better (1.00–5.00) vs higher-is-better (percentage) — never hardcode direction. */
export function gwaPasses(value, policy) {
  if (value == null || !policy) return null // unknown
  const v = Number(value)
  if (!Number.isFinite(v)) return null
  return policy.direction === 'higher_better' ? v >= policy.min : v <= policy.min
}

/** At Risk = latest GWA fails the program threshold (confirmed: GWA only). */
export function isAtRisk(scholar, policies) {
  const policy = resolvePolicy(scholar, policies)
  const passed = gwaPasses(scholar?.latest_gwa, policy)
  return passed === false
}

/** Derived status: an explicit terminated/graduated wins, else at-risk, else stored status. */
export function scholarStatus(scholar, policies) {
  if (scholar?.status === 'terminated' || scholar?.status === 'graduated') return scholar.status
  if (isAtRisk(scholar, policies)) return 'at_risk'
  return scholar?.status ?? 'active'
}

export function initials(name) {
  if (!name) return '—'
  const parts = String(name).trim().split(/\s+/)
  return (parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0][0]).toUpperCase()
}

export function scholarName(s) {
  return s?.name ?? ([s?.first_name, s?.last_name].filter(Boolean).join(' ') || 'Unnamed Scholar')
}

export function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}
