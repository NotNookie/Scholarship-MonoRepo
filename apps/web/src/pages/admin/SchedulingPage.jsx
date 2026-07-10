import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  PencilLine,
  Trash2,
  Send,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

// ── Event type config ─────────────────────────────────────────

const EVENT_TYPES = {
  examination: { label: 'Examination', color: 'text-on-secondary',  bg: 'bg-secondary-light', dot: 'bg-secondary',    Icon: PencilLine },
  orientation: { label: 'Orientation', color: 'text-tertiary-dark', bg: 'bg-tertiary-light',  dot: 'bg-tertiary',     Icon: Users },
  payout:      { label: 'Payout',      color: 'text-primary',       bg: 'bg-primary-light',   dot: 'bg-primary',      Icon: CalendarClock },
}

const TYPE_OPTIONS = Object.entries(EVENT_TYPES).map(([value, cfg]) => ({ value, label: cfg.label }))

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'past', label: 'Past Events' },
]

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Event card ────────────────────────────────────────────────

function EventCard({ event, onEdit, onDelete, onPublish, busy }) {
  const type = EVENT_TYPES[event.type] ?? EVENT_TYPES.examination
  const isDraft = event.status === 'draft'
  const { Icon } = type

  return (
    <article className={`bg-surface border rounded-xl shadow-card overflow-hidden ${isDraft ? 'border-l-4 border-l-tertiary border-y-border border-r-border' : 'border-l-4 border-l-secondary border-y-border border-r-border'}`}>
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${type.bg} ${type.color}`}>
            <Icon size={12} /> {type.label}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isDraft ? 'bg-surface-alt text-content-muted border-border' : 'bg-tertiary-light text-tertiary-dark border-tertiary/30'}`}>
            {isDraft ? 'Draft' : 'Published'}
          </span>
        </div>

        <h3 className="text-base font-bold text-content">{event.title ?? 'Untitled Event'}</h3>

        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 mt-3 text-sm text-content-muted">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} className="text-content-disabled" />
            {formatDate(event.date)}
          </span>
          {(event.start_time || event.end_time) && (
            <span className="inline-flex items-center gap-2">
              <Clock size={14} className="text-content-disabled" />
              {[event.start_time, event.end_time].filter(Boolean).join(' – ')}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-1.5 mt-1.5 text-sm text-content-muted">
          {event.location && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} className="text-content-disabled" /> {event.location}
            </span>
          )}
          {event.target && (
            <span className="inline-flex items-center gap-2">
              <Users size={14} className="text-content-disabled" /> Target: {event.target}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-surface-alt border-t border-border flex items-center gap-3">
        {isDraft && (
          <button
            onClick={() => onPublish(event)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Send size={13} /> Publish Schedule
          </button>
        )}
        <button
          onClick={() => onEdit(event)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          <PencilLine size={13} /> Edit Details
        </button>
        <button
          onClick={() => onDelete(event)}
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-danger transition-colors"
          aria-label="Delete event"
        >
          <Trash2 size={14} />
        </button>
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
        <p className="text-sm font-bold text-content">
          {cursor.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-1 rounded hover:bg-surface-alt text-content-muted" aria-label="Previous month"><ChevronLeft size={15} /></button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-1 rounded hover:bg-surface-alt text-content-muted" aria-label="Next month"><ChevronRight size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[11px] font-semibold text-content-muted py-1">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />
          const isToday = isThisMonth && day === today.getDate()
          const hasEvent = marked.has(day)
          return (
            <span
              key={day}
              className={`text-xs py-1.5 rounded-md relative ${
                isToday ? 'bg-secondary text-on-secondary font-bold' : hasEvent ? 'bg-primary-light text-primary font-semibold' : 'text-content'
              }`}
            >
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

// ── Event form modal ──────────────────────────────────────────

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function EventModal({ event, isPending, onClose, onSubmit }) {
  const editing = !!event?.id
  const [form, setForm] = useState({
    type: event?.type ?? 'examination',
    title: event?.title ?? '',
    date: event?.date ? String(event.date).slice(0, 10) : '',
    start_time: event?.start_time ?? '',
    end_time: event?.end_time ?? '',
    location: event?.location ?? '',
    target: event?.target ?? '',
    status: event?.status ?? 'draft',
  })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.title.trim() && form.date

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-content">{editing ? 'Edit Event' : 'Create New Event'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-type" className="text-sm font-medium text-content">Event Type</label>
            <select id="ev-type" value={form.type} onChange={set('type')} className={inputCls}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-title" className="text-sm font-medium text-content">Title</label>
            <input id="ev-title" type="text" value={form.title} onChange={set('title')} placeholder="e.g. Batch 2027 Qualifying Examination" className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ev-date" className="text-sm font-medium text-content">Date</label>
              <input id="ev-date" type="date" value={form.date} onChange={set('date')} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ev-start" className="text-sm font-medium text-content">Start</label>
              <input id="ev-start" type="time" value={form.start_time} onChange={set('start_time')} className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ev-end" className="text-sm font-medium text-content">End</label>
              <input id="ev-end" type="time" value={form.end_time} onChange={set('end_time')} className={inputCls} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-loc" className="text-sm font-medium text-content">Location</label>
            <input id="ev-loc" type="text" value={form.location} onChange={set('location')} placeholder="e.g. Sta. Cruz Municipal Hall" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="ev-target" className="text-sm font-medium text-content flex items-center gap-1.5">
              Target Audience <span className="text-xs text-content-muted font-normal">(Optional)</span>
            </label>
            <input id="ev-target" type="text" value={form.target} onChange={set('target')} placeholder="e.g. Incoming College Freshmen" className={inputCls} />
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button
            disabled={!canSave || isPending}
            onClick={() => onSubmit(form)}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {editing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────

function DeleteModal({ event, isPending, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
          <div>
            <h3 className="text-base font-bold text-content">Delete event?</h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">
              "{event.title}" will be permanently removed. This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content">Cancel</button>
          <button
            disabled={isPending}
            onClick={onConfirm}
            className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />} Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function SchedulingPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('upcoming')
  const [modal, setModal] = useState(null) // { mode:'create'|'edit'|'delete', event? }

  const { data, isPending } = useQuery({
    queryKey: queryKeys.schedules.list(),
    queryFn: () => api.get('/admin/schedules').then((r) => r.data),
    retry: false,
  })

  const events = useMemo(() => data?.data ?? [], [data])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      payload.id
        ? api.put(`/admin/schedules/${payload.id}`, payload)
        : api.post('/admin/schedules', payload),
    onSuccess: () => { toast.success('Event saved.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save event.'),
  })

  const publishMutation = useMutation({
    mutationFn: (event) => api.patch(`/admin/schedules/${event.id}`, { status: 'published' }),
    onSuccess: () => { toast.success('Schedule published.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not publish.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (event) => api.delete(`/admin/schedules/${event.id}`),
    onSuccess: () => { toast.success('Event deleted.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })

  const today = startOfToday()
  const shown = useMemo(() => {
    return events.filter((e) => {
      const d = e.date ? new Date(e.date) : null
      if (tab === 'drafts') return e.status === 'draft'
      if (tab === 'past') return e.status !== 'draft' && d && d < today
      return e.status !== 'draft' && (!d || d >= today) // upcoming
    })
  }, [events, tab, today])

  const upcomingCount = events.filter((e) => e.status !== 'draft' && (!e.date || new Date(e.date) >= today)).length
  const draftCount = events.filter((e) => e.status === 'draft').length
  const publishedDates = events.filter((e) => e.status !== 'draft' && e.date).map((e) => e.date)
  const busy = saveMutation.isPending || publishMutation.isPending || deleteMutation.isPending

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Schedule Management</h1>
          <p className="text-sm text-content-muted mt-1">Organize and publish upcoming events for scholars.</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0"
        >
          <Plus size={15} /> Create New Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-sm font-semibold px-4 py-2.5 -mb-px border-b-2 transition-colors ${
                  tab === t.key ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content'
                }`}
              >
                {t.label}
                {t.key === 'drafts' && draftCount > 0 && (
                  <span className="ml-1.5 text-xs bg-surface-alt text-content-muted rounded-full px-1.5 py-0.5">{draftCount}</span>
                )}
              </button>
            ))}
          </div>

          {isPending ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
            </div>
          ) : shown.length > 0 ? (
            <div className="space-y-4">
              {shown.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  busy={busy}
                  onEdit={(ev) => setModal({ mode: 'edit', event: ev })}
                  onDelete={(ev) => setModal({ mode: 'delete', event: ev })}
                  onPublish={(ev) => publishMutation.mutate(ev)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-3">
              <CalendarDays size={30} className="text-content-disabled" />
              <p className="text-sm font-semibold text-content">
                {tab === 'drafts' ? 'No draft schedules.' : tab === 'past' ? 'No past events.' : 'No upcoming events.'}
              </p>
              <button onClick={() => setModal({ mode: 'create' })} className="text-sm text-primary hover:underline">Create an event</button>
            </div>
          )}
        </div>

        {/* Right rail */}
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

      {/* Modals */}
      {(modal?.mode === 'create' || modal?.mode === 'edit') && (
        <EventModal
          event={modal.event}
          isPending={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSubmit={(form) => saveMutation.mutate(modal.event ? { ...modal.event, ...form } : form)}
        />
      )}
      {modal?.mode === 'delete' && (
        <DeleteModal
          event={modal.event}
          isPending={deleteMutation.isPending}
          onClose={() => setModal(null)}
          onConfirm={() => deleteMutation.mutate(modal.event)}
        />
      )}
    </div>
  )
}
