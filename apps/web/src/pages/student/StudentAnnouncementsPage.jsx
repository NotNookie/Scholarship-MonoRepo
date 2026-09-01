import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Megaphone,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  PencilLine,
  CalendarClock,
  ChevronDown,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { AnnouncementCard } from '../../components/shared/AnnouncementCard'
import { useBrand } from '../../tenant/TenantContext'

// ── Event type config (matches admin scheduling) ──────────────

const EVENT_TYPES = {
  examination: { label: 'Examination', color: 'text-on-secondary',  bg: 'bg-secondary-light', Icon: PencilLine },
  orientation: { label: 'Orientation', color: 'text-tertiary-dark', bg: 'bg-tertiary-light',  Icon: Users },
  payout:      { label: 'Payout',      color: 'text-primary',       bg: 'bg-primary-light',   Icon: CalendarClock },
}

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}

// ── Schedule card ─────────────────────────────────────────────

function ScheduleCard({ event, muted }) {
  const type = EVENT_TYPES[event.type] ?? EVENT_TYPES.examination
  const { Icon } = type
  const date = event.date ? new Date(event.date) : null

  return (
    <article className={`bg-surface border border-border rounded-xl shadow-card p-5 flex gap-4 ${muted ? 'opacity-75' : ''}`}>
      <div className={`w-14 shrink-0 rounded-lg ${type.bg} ${type.color} flex flex-col items-center justify-center py-2`}>
        <span className="text-[10px] font-semibold uppercase leading-none">{date ? date.toLocaleDateString('en-PH', { month: 'short' }) : '—'}</span>
        <span className="text-xl font-bold leading-tight">{date ? date.getDate() : '—'}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${type.bg} ${type.color} mb-2`}>
          <Icon size={12} /> {type.label}
        </span>
        <h3 className="text-sm font-bold text-content leading-snug">{event.title ?? 'Scheduled Event'}</h3>
        <div className="flex flex-col gap-1 mt-2 text-xs text-content-muted">
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} className="text-content-disabled" />{formatDate(event.date)}</span>
          {(event.start_time || event.end_time) && (
            <span className="inline-flex items-center gap-1.5"><Clock size={12} className="text-content-disabled" />{[event.start_time, event.end_time].filter(Boolean).join(' – ')}</span>
          )}
          {event.location && (
            <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-content-disabled" />{event.location}</span>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function StudentAnnouncementsPage() {
  const [showPast, setShowPast] = useState(false)
  const brand = useBrand()

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements.list({ student: true }),
    queryFn: () => api.get('/announcements?sort=desc&per_page=50').then((r) => r.data),
    retry: false,
  })

  const schedulesQuery = useQuery({
    queryKey: queryKeys.schedules.list(),
    queryFn: () => api.get('/schedules').then((r) => r.data),
    retry: false,
  })

  const announcements = announcementsQuery.data?.data ?? []
  const events = useMemo(() => schedulesQuery.data?.data ?? [], [schedulesQuery.data])

  const today = startOfToday()
  const { upcoming, past } = useMemo(() => {
    const up = []
    const pa = []
    events.forEach((e) => {
      const d = e.date ? new Date(e.date) : null
      if (d && d < today) pa.push(e)
      else up.push(e)
    })
    up.sort((a, b) => new Date(a.date) - new Date(b.date))
    pa.sort((a, b) => new Date(b.date) - new Date(a.date))
    return { upcoming: up, past: pa }
  }, [events, today])

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Announcements &amp; Schedules</h1>
          <p className="text-on-primary/70 text-sm">
            Latest updates and upcoming events from {brand.program}.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-12">

        {/* ── Schedules ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-content">Upcoming Schedules</h2>
          </div>

          {schedulesQuery.isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((e) => <ScheduleCard key={e.id} event={e} />)}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-card p-8 flex flex-col items-center text-center gap-2">
              <CalendarDays size={26} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No upcoming events scheduled yet.</p>
            </div>
          )}

          {/* Past events (collapsible) */}
          {past.length > 0 && (
            <div className="mt-5">
              <button
                onClick={() => setShowPast((v) => !v)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-content-muted hover:text-primary transition-colors"
              >
                <ChevronDown size={15} className={`transition-transform ${showPast ? 'rotate-180' : ''}`} />
                {showPast ? 'Hide' : 'Show'} past events ({past.length})
              </button>
              {showPast && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {past.map((e) => <ScheduleCard key={e.id} event={e} muted />)}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Announcements ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Megaphone size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-content">Announcements</h2>
          </div>

          {announcementsQuery.isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} variant="compact" />)}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-card p-8 flex flex-col items-center text-center gap-2">
              <Megaphone size={26} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No announcements yet. Check back later for updates from the {brand.officeShort} office.</p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
