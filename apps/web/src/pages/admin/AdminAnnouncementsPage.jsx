import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Megaphone,
  Pin,
  PinOff,
  PencilLine,
  Trash2,
  Send,
  X,
  Loader2,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'

// ── Category config ───────────────────────────────────────────

const CATEGORIES = ['Examination', 'Orientation', 'Payout', 'Requirements', 'General']

const CATEGORY_STYLES = {
  Examination:  'bg-warning-light text-warning border-warning/20',
  Orientation:  'bg-info-light text-info border-info/20',
  Payout:       'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-primary-light text-primary border-primary/20',
  General:      'bg-surface-alt text-content-muted border-border',
}

const TABS = [
  { key: 'published', label: 'Published' },
  { key: 'drafts', label: 'Drafts' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CategoryBadge({ category }) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.General
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${style}`}>
      {category}
    </span>
  )
}

// ── Announcement card ─────────────────────────────────────────

function AnnouncementRow({ item, onEdit, onDelete, onPublish, onTogglePin, busy }) {
  const isDraft = item.status === 'draft'
  return (
    <article className={`bg-surface border rounded-xl shadow-card overflow-hidden ${item.pinned ? 'border-primary/40' : 'border-border'}`}>
      <div className="p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <CategoryBadge category={item.category} />
          {isDraft && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-alt text-content-muted border border-border">Draft</span>
          )}
          {item.pinned && !isDraft && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-light text-primary border border-primary/20">
              <Pin size={11} /> Pinned
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-content-disabled">
            <Calendar size={12} /> {formatDate(item.published_at ?? item.created_at)}
          </span>
        </div>

        <h3 className="text-base font-bold text-content leading-snug">{item.title ?? 'Untitled'}</h3>
        <p className="text-sm text-content-muted mt-1.5 leading-relaxed line-clamp-2">{item.body}</p>
      </div>

      <div className="px-5 py-3 bg-surface-alt border-t border-border flex items-center gap-3 flex-wrap">
        {isDraft ? (
          <button
            onClick={() => onPublish(item)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Send size={13} /> Publish
          </button>
        ) : (
          <button
            onClick={() => onTogglePin(item)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            {item.pinned ? <><PinOff size={13} /> Unpin</> : <><Pin size={13} /> Pin to top</>}
          </button>
        )}
        <button
          onClick={() => onEdit(item)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors"
        >
          <PencilLine size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(item)}
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-medium text-content-muted hover:text-danger transition-colors"
          aria-label="Delete announcement"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  )
}

// ── Compose / edit modal ──────────────────────────────────────

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function ComposeModal({ item, isPending, onClose, onSubmit }) {
  const editing = !!item?.id
  const [form, setForm] = useState({
    category: item?.category ?? 'General',
    title: item?.title ?? '',
    body: item?.body ?? '',
    pinned: item?.pinned ?? false,
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const canSave = form.title.trim() && form.body.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold text-content">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="an-cat" className="text-sm font-medium text-content">Category</label>
            <select id="an-cat" value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="an-title" className="text-sm font-medium text-content">Title</label>
            <input id="an-title" type="text" value={form.title} onChange={set('title')} placeholder="e.g. Qualifying Exam Schedule Posted" className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="an-body" className="text-sm font-medium text-content">Body</label>
            <textarea id="an-body" rows={6} value={form.body} onChange={set('body')} placeholder="Write the announcement details…" className={`${inputCls} resize-none`} />
          </div>
          <label className="flex items-center gap-2.5 text-sm text-content cursor-pointer">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            Pin to top of the announcements list
          </label>
        </div>

        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content transition-colors">Cancel</button>
          <button
            disabled={!canSave || isPending}
            onClick={() => onSubmit(form, 'draft')}
            className="text-sm font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            disabled={!canSave || isPending}
            onClick={() => onSubmit(form, 'published')}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            <Send size={15} /> Publish
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm ────────────────────────────────────────────

function DeleteModal({ item, isPending, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
          <div>
            <h3 className="text-base font-bold text-content">Delete announcement?</h3>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">"{item.title}" will be permanently removed. This cannot be undone.</p>
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

export function AdminAnnouncementsPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('published')
  const [modal, setModal] = useState(null) // { mode:'compose'|'delete', item? }

  const { data, isPending } = useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: () => api.get('/admin/announcements').then((r) => r.data),
    retry: false,
  })

  const items = useMemo(() => data?.data ?? [], [data])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      payload.id
        ? api.put(`/admin/announcements/${payload.id}`, payload)
        : api.post('/admin/announcements', payload),
    onSuccess: () => { toast.success('Announcement saved.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save.'),
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, patch }) => api.patch(`/admin/announcements/${id}`, patch),
    onSuccess: (_r, vars) => { toast.success(vars.msg ?? 'Updated.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (item) => api.delete(`/admin/announcements/${item.id}`),
    onSuccess: () => { toast.success('Announcement deleted.'); invalidate(); setModal(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })

  const publishedCount = items.filter((i) => i.status !== 'draft').length
  const draftCount = items.filter((i) => i.status === 'draft').length

  const shown = useMemo(() => {
    const list = items.filter((i) => (tab === 'drafts' ? i.status === 'draft' : i.status !== 'draft'))
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return new Date(b.published_at ?? b.created_at) - new Date(a.published_at ?? a.created_at)
    })
  }, [items, tab])

  const busy = saveMutation.isPending || patchMutation.isPending || deleteMutation.isPending

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-content">Announcement Management</h1>
          <p className="text-sm text-content-muted mt-1">Compose and publish updates for applicants and scholars.</p>
        </div>
        <button
          onClick={() => setModal({ mode: 'compose' })}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors shrink-0"
        >
          <Plus size={15} /> New Announcement
        </button>
      </div>

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
            <span className="ml-1.5 text-xs bg-surface-alt text-content-muted rounded-full px-1.5 py-0.5">
              {t.key === 'drafts' ? draftCount : publishedCount}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {isPending ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      ) : shown.length > 0 ? (
        <div className="space-y-4">
          {shown.map((item) => (
            <AnnouncementRow
              key={item.id}
              item={item}
              busy={busy}
              onEdit={(it) => setModal({ mode: 'compose', item: it })}
              onDelete={(it) => setModal({ mode: 'delete', item: it })}
              onPublish={(it) => patchMutation.mutate({ id: it.id, patch: { status: 'published' }, msg: 'Announcement published.' })}
              onTogglePin={(it) => patchMutation.mutate({ id: it.id, patch: { pinned: !it.pinned }, msg: it.pinned ? 'Unpinned.' : 'Pinned to top.' })}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card p-12 flex flex-col items-center text-center gap-3">
          <Megaphone size={30} className="text-content-disabled" />
          <p className="text-sm font-semibold text-content">
            {tab === 'drafts' ? 'No drafts saved.' : 'No published announcements yet.'}
          </p>
          <button onClick={() => setModal({ mode: 'compose' })} className="text-sm text-primary hover:underline">Create one</button>
        </div>
      )}

      {/* Modals */}
      {modal?.mode === 'compose' && (
        <ComposeModal
          item={modal.item}
          isPending={saveMutation.isPending}
          onClose={() => setModal(null)}
          onSubmit={(form, status) => saveMutation.mutate(modal.item ? { ...modal.item, ...form, status } : { ...form, status })}
        />
      )}
      {modal?.mode === 'delete' && (
        <DeleteModal
          item={modal.item}
          isPending={deleteMutation.isPending}
          onClose={() => setModal(null)}
          onConfirm={() => deleteMutation.mutate(modal.item)}
        />
      )}
    </div>
  )
}
