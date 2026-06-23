const CATEGORY_STYLES = {
  Examination: 'bg-warning-light text-warning border-warning/20',
  Orientation: 'bg-info-light text-info border-info/20',
  Payout: 'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-border-muted text-content-muted border-border',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AnnouncementCard({ announcement, variant = 'compact' }) {
  const { category, title, body, created_at } = announcement
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Requirements
  const isFull = variant === 'full'

  return (
    <article className="bg-surface rounded-lg shadow-card p-5 flex flex-col gap-3 hover:shadow-modal transition-shadow h-full">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${style}`}
        >
          {category}
        </span>
        <span className="text-xs text-content-disabled whitespace-nowrap">
          {formatDate(created_at)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-content leading-snug">
          {title}
        </h3>
        <p
          className={`text-xs text-content-muted mt-2 leading-relaxed ${
            isFull ? '' : 'line-clamp-3'
          }`}
        >
          {body}
        </p>
      </div>
    </article>
  )
}
