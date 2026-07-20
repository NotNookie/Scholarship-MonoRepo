import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { PostModal } from '../../components/admin/comms/PostModal'
import { AnnouncementsView } from '../../components/admin/comms/AnnouncementsView'
import { EventsView } from '../../components/admin/comms/EventsView'
import { isEvent } from '../../components/admin/comms/postUtils'

const TABS = [
  { key: 'announcements', label: 'Announcements' },
  { key: 'events', label: 'Events/Schedules' },
]

export function CommunicationsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('announcements')
  const [selectedId, setSelectedId] = useState(null)
  const [composing, setComposing] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: () => api.get('/admin/announcements').then((r) => r.data),
    retry: false,
  })

  const posts = useMemo(() => data?.data ?? [], [data])
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })
    queryClient.invalidateQueries({ queryKey: queryKeys.schedules.all })
  }

  const saveMutation = useMutation({
    mutationFn: ({ form, status }) => {
      const fd = new FormData()
      fd.append('category', form.category)
      fd.append('title', form.title)
      fd.append('body', form.body)
      fd.append('pinned', form.pinned ? '1' : '0')
      fd.append('status', status)
      // Schedule block — only sent when the post is marked as an event
      if (form.scheduled) {
        fd.append('date', form.date)
        fd.append('start_time', form.start_time ?? '')
        fd.append('end_time', form.end_time ?? '')
        fd.append('location', form.location ?? '')
        fd.append('target', form.target ?? '')
      } else {
        fd.append('date', '')
      }
      form.files?.forEach((f) => fd.append('attachments[]', f))
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      return editing?.id
        ? api.post(`/admin/announcements/${editing.id}?_method=PUT`, fd, cfg)
        : api.post('/admin/announcements', fd, cfg)
    },
    onSuccess: () => { toast.success('Saved.'); invalidate(); setEditing(null); setComposing(false) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save.'),
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, patch }) => api.patch(`/admin/announcements/${id}`, patch),
    onSuccess: (_r, v) => { toast.success(v.msg ?? 'Updated.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (post) => api.delete(`/admin/announcements/${post.id}`),
    onSuccess: () => { toast.success('Deleted.'); invalidate(); setDeleting(null); setSelectedId(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })

  const busy = saveMutation.isPending || patchMutation.isPending || deleteMutation.isPending
  const eventCount = posts.filter(isEvent).length

  const handlers = {
    onEdit: (p) => setEditing(p),
    onDelete: (p) => setDeleting(p),
    onTogglePin: (p) => patchMutation.mutate({ id: p.id, patch: { pinned: !p.pinned }, msg: p.pinned ? 'Unpinned.' : 'Pinned to top.' }),
    onPublish: (p) => patchMutation.mutate({ id: p.id, patch: { status: 'published' }, msg: 'Published.' }),
  }

  return (
    <div className="flex flex-col gap-6 min-h-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Announcements &amp; Events</h1>
          <p className="text-sm text-content-muted mt-1">
            Post announcements for scholars — tick “scheduled event” to add one to the calendar.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setComposing(true) }}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0"
        >
          <Plus size={15} /> Create
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`text-sm font-semibold px-4 py-2.5 -mb-px border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-content-muted hover:text-content'}`}>
            {t.label}
            {t.key === 'events' && eventCount > 0 && (
              <span className="ml-1.5 text-xs bg-surface-alt text-content-muted rounded-full px-1.5 py-0.5">{eventCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Views — both read the same posts */}
      {tab === 'announcements' ? (
        <div className="flex flex-col min-h-0 h-[calc(100vh-16rem)]">
          <AnnouncementsView
            posts={posts}
            isPending={isPending}
            busy={busy}
            selectedId={selectedId}
            onSelect={setSelectedId}
            {...handlers}
          />
        </div>
      ) : (
        <EventsView posts={posts} isPending={isPending} busy={busy} {...handlers} />
      )}

      {/* Single create/edit modal */}
      {(composing || editing) && (
        <PostModal
          post={editing}
          isPending={saveMutation.isPending}
          onClose={() => { setEditing(null); setComposing(false) }}
          onSubmit={(form, status) => saveMutation.mutate({ form, status })}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleting(null)} />
          <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
              <div>
                <h3 className="text-base font-bold text-content">Delete this post?</h3>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">“{deleting.title}” will be permanently removed.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setDeleting(null)} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content">Cancel</button>
              <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleting)}
                className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                {deleteMutation.isPending && <Loader2 size={15} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
