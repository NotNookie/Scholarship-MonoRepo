import { useState } from 'react'
import { Plus, ChevronDown, Megaphone, CalendarDays } from 'lucide-react'
import { AnnouncementsPanel } from '../../components/admin/AnnouncementsPanel'
import { EventsPanel } from '../../components/admin/EventsPanel'

const TABS = [
  { key: 'announcements', label: 'Announcements' },
  { key: 'events', label: 'Events/Schedules' },
]

export function CommunicationsPage() {
  const [tab, setTab] = useState('announcements')
  const [menuOpen, setMenuOpen] = useState(false)
  const [composingAnnouncement, setComposingAnnouncement] = useState(false)
  const [creatingEvent, setCreatingEvent] = useState(false)

  function startAnnouncement() {
    setMenuOpen(false)
    setTab('announcements')
    setComposingAnnouncement(true)
  }
  function startEvent() {
    setMenuOpen(false)
    setTab('events')
    setCreatingEvent(true)
  }

  return (
    <div className="flex flex-col gap-6 min-h-0">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Announcements &amp; Events</h1>
          <p className="text-sm text-content-muted mt-1">Manage announcements and organize upcoming events for scholars.</p>
        </div>

        {/* Create dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={15} /> Create <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div role="menu" className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-dropdown z-20 overflow-hidden">
                <button role="menuitem" onClick={startAnnouncement} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-content hover:bg-surface-alt transition-colors">
                  <Megaphone size={15} className="text-primary" /> New Announcement
                </button>
                <button role="menuitem" onClick={startEvent} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-content hover:bg-surface-alt transition-colors border-t border-border">
                  <CalendarDays size={15} className="text-primary" /> New Event
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
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
          </button>
        ))}
      </div>

      {/* ── Panels ─────────────────────────────────────────────── */}
      {tab === 'announcements' ? (
        <div className="flex flex-col min-h-0 h-[calc(100vh-16rem)]">
          <AnnouncementsPanel
            composing={composingAnnouncement}
            onCloseCompose={() => setComposingAnnouncement(false)}
          />
        </div>
      ) : (
        <EventsPanel creating={creatingEvent} onCloseCreate={() => setCreatingEvent(false)} />
      )}
    </div>
  )
}
