import { useState, useMemo } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { startOfToday, isEvent, CATEGORY_STYLES } from './postUtils'

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
    <div>
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
            <span key={day} className={`text-xs py-2 rounded-md relative ${isToday ? 'bg-secondary text-on-secondary font-bold' : hasEvent ? 'bg-primary-light text-primary font-semibold' : 'text-content'}`}>
              {day}
              {hasEvent && !isToday && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ── Pane ──────────────────────────────────────────────────────

export function CalendarPane({ posts, onSelect }) {
  const today = startOfToday()
  const events = useMemo(() => posts.filter(isEvent), [posts])

  const upcoming = useMemo(
    () => events
      .filter((e) => e.status !== 'draft' && new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6),
    [events, today],
  )
  const upcomingCount = events.filter((e) => e.status !== 'draft' && new Date(e.date) >= today).length
  const draftCount = events.filter((e) => e.status === 'draft').length
  const publishedDates = events.filter((e) => e.status !== 'draft').map((e) => e.date)

  return (
    <div className="flex-1 overflow-auto p-6 min-h-0">
      <div className="flex items-center gap-2 mb-5">
        <CalendarDays size={17} className="text-primary" />
        <h2 className="text-base font-bold text-content">Schedule Overview</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-surface-alt border border-border rounded-xl p-5">
          <MiniCalendar eventDates={publishedDates} />
          <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-content-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Scheduled event day
          </div>
        </div>

        {/* Upcoming + counts */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-alt border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-content">{upcomingCount}</p>
              <p className="text-xs text-content-muted mt-0.5">Upcoming events</p>
            </div>
            <div className="bg-surface-alt border border-border rounded-xl p-4">
              <p className="text-2xl font-bold text-content">{draftCount}</p>
              <p className="text-xs text-content-muted mt-0.5">Draft schedules</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">Upcoming Schedules</p>
            {upcoming.length > 0 ? (
              <div className="flex flex-col gap-2">
                {upcoming.map((e) => {
                  const d = new Date(e.date)
                  return (
                    <button key={e.id} onClick={() => onSelect(e.id)}
                      className="flex items-start gap-3 text-left border border-border rounded-lg p-3 hover:border-primary hover:bg-surface-alt transition-colors">
                      <div className="w-11 shrink-0 rounded-lg bg-primary-light text-primary flex flex-col items-center justify-center py-1.5">
                        <span className="text-[10px] font-semibold uppercase leading-none">{d.toLocaleDateString('en-PH', { month: 'short' })}</span>
                        <span className="text-base font-bold leading-tight">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CATEGORY_STYLES[e.category] ?? CATEGORY_STYLES.General}`}>
                            {e.category}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-content truncate">{e.title}</p>
                        <div className="flex items-center gap-x-3 flex-wrap text-xs text-content-muted mt-0.5">
                          {e.start_time && <span className="inline-flex items-center gap-1"><Clock size={11} />{e.start_time}</span>}
                          {e.location && <span className="inline-flex items-center gap-1 truncate"><MapPin size={11} />{e.location}</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="border border-border rounded-lg p-6 text-center">
                <p className="text-sm text-content-muted">No upcoming events.</p>
                <p className="text-xs text-content-muted mt-1">Create a post and tick “This is a scheduled event”.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
