import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, BadgeCheck, FileText, Megaphone, CalendarClock, Gavel, Check } from 'lucide-react'
import { api } from '../../lib/axios'

// Icon per notification type (events that create student notifications).
const TYPE_ICON = {
  status:       { Icon: BadgeCheck,   cls: 'bg-tertiary-light text-tertiary-dark' },
  document:     { Icon: FileText,     cls: 'bg-primary-light text-primary' },
  announcement: { Icon: Megaphone,    cls: 'bg-secondary-light text-secondary-dark' },
  renewal:      { Icon: CalendarClock, cls: 'bg-primary-light text-primary' },
  appeal:       { Icon: Gavel,        cls: 'bg-danger-light text-danger' },
}

function relative(v) {
  if (!v) return ''
  const diff = (Date.now() - new Date(v)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}

function isUnread(n) {
  return !(n.read ?? n.read_at)
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data } = useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: () => api.get('/student/notifications').then((r) => r.data),
    retry: false,
  })

  const items = data?.data ?? []
  const unread = items.filter(isUnread).length
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] })

  const markOne = useMutation({
    mutationFn: (id) => api.post(`/student/notifications/${id}/read`),
    onSuccess: invalidate,
  })
  const markAll = useMutation({
    mutationFn: () => api.post('/student/notifications/read-all'),
    onSuccess: invalidate,
  })

  function openItem(n) {
    if (isUnread(n)) markOne.mutate(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        className="relative p-2 rounded-full text-content-muted hover:bg-surface-alt hover:text-content transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-dropdown z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-bold text-content">Notifications</p>
              {unread > 0 && (
                <button onClick={() => markAll.mutate()} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-auto">
              {items.length > 0 ? (
                items.map((n) => {
                  const cfg = TYPE_ICON[n.type] ?? { Icon: Bell, cls: 'bg-surface-alt text-content-muted' }
                  const unreadItem = isUnread(n)
                  return (
                    <button
                      key={n.id}
                      onClick={() => openItem(n)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-surface-alt transition-colors ${unreadItem ? 'bg-primary-light/30' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.cls}`}>
                        <cfg.Icon size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${unreadItem ? 'font-bold text-content' : 'font-medium text-content'}`}>{n.title}</p>
                        {n.body && <p className="text-xs text-content-muted line-clamp-2 leading-snug mt-0.5">{n.body}</p>}
                        <p className="text-xs text-content-disabled mt-1">{relative(n.created_at)}</p>
                      </div>
                      {unreadItem && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </button>
                  )
                })
              ) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                  <Bell size={26} className="text-content-disabled" />
                  <p className="text-sm text-content-muted">You're all caught up.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
