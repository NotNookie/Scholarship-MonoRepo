import { useState } from 'react'
import { CalendarDays, Clock, MapPin, Paperclip } from 'lucide-react'
import { Markdown } from './Markdown'
import { AttachmentList } from './AttachmentList'
import { stripMarkdown } from '../../lib/markdown'

const CATEGORY_STYLES = {
  Examination: 'bg-warning-light text-warning border-warning/20',
  Orientation: 'bg-info-light text-info border-info/20',
  Payout: 'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-primary-light text-primary border-primary/20',
  General: 'bg-surface-alt text-content-muted border-border',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function AnnouncementCard({ announcement, variant = 'compact' }) {
  const { category, title, body, created_at, published_at, attachments, date, start_time, end_time, location } = announcement
  const [expanded, setExpanded] = useState(false)
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.General
  const isFull = variant === 'full' || expanded
  const hasAttachments = attachments?.length > 0

  return (
    <article className="bg-surface rounded-lg shadow-card p-5 flex flex-col gap-3 hover:shadow-modal transition-shadow h-full">
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${style}`}>
          {category}
        </span>
        <span className="text-xs text-content-disabled whitespace-nowrap">
          {formatDate(published_at ?? created_at)}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-content leading-snug">{title}</h3>

        {/* Schedule details when this post is an event */}
        {date && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-content-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={11} />{formatDate(date)}</span>
            {(start_time || end_time) && (
              <span className="inline-flex items-center gap-1.5"><Clock size={11} />{[start_time, end_time].filter(Boolean).join(' – ')}</span>
            )}
            {location && <span className="inline-flex items-center gap-1.5"><MapPin size={11} />{location}</span>}
          </div>
        )}

        {isFull ? (
          <Markdown className="text-xs text-content-muted mt-2 leading-relaxed">{body}</Markdown>
        ) : (
          <p className="text-xs text-content-muted mt-2 leading-relaxed line-clamp-3">{stripMarkdown(body)}</p>
        )}
      </div>

      {isFull && hasAttachments && <AttachmentList files={attachments} />}

      {variant !== 'full' && (
        <div className="flex items-center gap-3">
          {body && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
          {hasAttachments && !expanded && (
            <span className="inline-flex items-center gap-1 text-xs text-content-muted">
              <Paperclip size={11} /> {attachments.length}
            </span>
          )}
        </div>
      )}
    </article>
  )
}
