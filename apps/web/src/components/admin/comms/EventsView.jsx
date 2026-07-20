import { useState, useMemo } from 'react'
import {
  CalendarDays, Clock, MapPin, Users, PencilLine, Trash2, Send, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { Skeleton } from '../../shared/Skeleton'
import { CATEGORY_STYLES, formatDate, startOfToday, isEvent } from './postUtils'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'past', label: 'Past Events' },
]

// ── Event card ────────────────────────────────────────────────

function EventCard({ post, onEdit, onDelete, onPublish, busy }) {
  const isDraft = post.status === 'draft'
  return (
    <article className={`bg-surface border border-border border-l-4 ${isDraft ? 'border-l-tertiary' : 'border-l-secondary'} rounded-xl shadow-card overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES.General}`}>
            {post.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDraft ? 'bg-surface-alt text-content-muted border-border' : 'bg-tertiary-light text-tertiary-dark border-tertiary/30'}`}>
            {isDraft ? 'Draft' : 'Published'}
          </span>
        </div>
        <h3 className="text-base font-bold text-content">{post.title ?? 'Untitled Event'}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 mt-3 text-sm text-content-muted">
          <span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-content-disabled" />{formatDate(post.date)}</span>
          {(post.start_time || post.end_time) && (
            <span className="inline-flex items-center gap-2"><Clock size={14} className="text-content-disabled" />{[post.start_time, post.end_time].filter(Boolean).join(' – ')}</span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 mt-1.5 text-sm text-content-muted">
          {post.location && <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-content-disabled" /> {post.location}</span>}
          {post.target && <span className="inline-flex items-center gap-2"><Users size={14} className="text-content-disabled" /> Target: {post.target}</span>}
        </div>
      </div>
      <div className="px-5 py-3 bg-surface-alt border-t border-border flex items-center gap-3">
        {isDraft && (
          <button onClick={() => onPublish(post)} disabled={busy} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            <Send size={13} /> Publish
          </button>
        )}
        <button onClick={() => onEdit(post)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors">
          <PencilLine size={13} /> Edit Details
        </button>
        <button onClick={() => onDelete(post)} className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-danger transition-colors" aria-label="Delete event"><Trash2 size={14} /></button>
      </div>
    </article>
  )
}

// ── Mini calendar ─────────────────────────────────────────────

function MiniCalendar({ eventDates }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month

  const marked = useMemo(() => {
    const set = new Set()
    eventDates.forEach((iso) => {
      const d = new Date(iso)
      if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate())
    })
    return set
  }, [eventDates, year, month])

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-content">{cursor.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-surface-alt text-content-muted" aria-label="Previous month"><ChevronLeft size={15} /></button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-surface-alt text-content-muted" aria-label="Next month"><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-[11px] font-semibold text-content-muted py-1">{d}</span>)}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />
          const isToday = isThisMonth && day === today.getDate()
          const hasEvent = marked.has(day)
          return (
            <span key={day} className={`text-xs py-1.5 rounded-md relative ${isToday ? 'bg-secondary text-on-secondary font-bold' : hasEvent ? 'bg-primary-light text-primary font-semibold' : 'text-content'}`}>
              {day}
              {hasEvent && !isToday && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
            </span>
          )
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-content-muted">
        <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Scheduled event day
      </div>
    </div>
  )
}

// ── View ──────────────────────────────────────────────────────

export function EventsView({ posts, isPending, onEdit, onDelete, onPublish, busy }) {
  const [tab, setTab] = useState('upcoming')
  const today = startOfToday()

  // Only posts that carry a schedule block are events.
  const events = useMemo(() => posts.filter(isEvent), [posts])

  const shown = useMemo(() => events.filter((e) => {
    const d = new Date(e.date)
    if (tab === 'drafts') return e.status === 'draft'
    if (tab === 'past') return e.status !== 'draft' && d < today
    return e.status !== 'draft' && d >= today
  }), [events, tab, today])

  const upcomingCount = events.filter((e) => e.status !== 'draft' && new Date(e.date) >= today).length
  const draftCount = events.filter((e) => e.status === 'draft').length
  const publishedDates = events.filter((e) => e.status !== 'draft').map((e) => e.date)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-5">
        <div className="flex items-center gap-1 border-b border-border">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`text-sm font-semibold px-4 py-2.5 -mb-px border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content'}`}>
              {t.label}
              {t.key === 'drafts' && draftCount > 0 && <span className="ml-1.5 text-xs bg-surface-alt text-content-muted rounded-full px-1.5 py-0.5">{draftCount}</span>}
            </button>
          ))}
        </div>

        {isPending ? (
          <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}</div>
        ) : shown.length > 0 ? (
          <div className="space-y-4">
            {shown.map((e) => <EventCard key={e.id} post={e} busy={busy} onEdit={onEdit} onDelete={onDelete} onPublish={onPublish} />)}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-3">
            <CalendarDays size={30} className="text-content-disabled" />
            <p className="text-sm font-semibold text-content">
              {tab === 'drafts' ? 'No draft schedules.' : tab === 'past' ? 'No past events.' : 'No upcoming events.'}
            </p>
            <p className="text-xs text-content-muted max-w-xs">
              Create an announcement and tick “This is a scheduled event” to add it here.
            </p>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-6">
        <MiniCalendar eventDates={publishedDates} />
        <div className="relative rounded-xl p-6 text-on-primary overflow-hidden shadow-modal">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
          <div className="relative z-10">
            <p className="text-sm font-semibold text-on-primary/70">Scheduling Overview</p>
            <p className="text-3xl font-bold mt-2">{upcomingCount}</p>
            <p className="text-xs text-on-primary/70">Upcoming Events</p>
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
              <span className="text-on-primary/70">Draft Schedules</span>
              <span className="font-bold">{draftCount}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
