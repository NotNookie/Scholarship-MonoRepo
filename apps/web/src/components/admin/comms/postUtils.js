// A "post" is the single merged entity: an announcement that MAY carry a
// schedule block (date/time/location/target). If it has a date, it's an event.

export const CATEGORIES = ['Examination', 'Orientation', 'Payout', 'Requirements', 'General']

export const CATEGORY_STYLES = {
  Examination:  'bg-warning-light text-warning border-warning/20',
  Orientation:  'bg-info-light text-info border-info/20',
  Payout:       'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-primary-light text-primary border-primary/20',
  General:      'bg-surface-alt text-content-muted border-border',
}

export const inputCls =
  'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

export function isEvent(post) {
  return !!post?.date
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDate(v) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function relative(v) {
  if (!v) return ''
  const diff = (Date.now() - new Date(v)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return 'Yesterday'
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

export function fileSize(bytes) {
  if (bytes == null) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}
