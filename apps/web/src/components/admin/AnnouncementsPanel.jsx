import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import {
  Search, Megaphone, Pin, PinOff, PencilLine, Trash2, Clock, X, Loader2,
  Bold, Italic, List, Link2, UploadCloud, FileText, Download, Send,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../shared/Skeleton'

// ── Config ────────────────────────────────────────────────────

const CATEGORIES = ['Examination', 'Orientation', 'Payout', 'Requirements', 'General']

const CATEGORY_STYLES = {
  Examination:  'bg-warning-light text-warning border-warning/20',
  Orientation:  'bg-info-light text-info border-info/20',
  Payout:       'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-primary-light text-primary border-primary/20',
  General:      'bg-surface-alt text-content-muted border-border',
}

const inputCls = 'w-full text-sm px-3 py-2.5 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary'

function formatDateTime(v) {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function relative(v) {
  if (!v) return ''
  const diff = (Date.now() - new Date(v)) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return 'Yesterday'
  return new Date(v).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
function fileSize(bytes) {
  if (bytes == null) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${CATEGORY_STYLES[category] ?? CATEGORY_STYLES.General}`}>
      {category}
    </span>
  )
}

// ── Markdown toolbar ──────────────────────────────────────────

const MD_ACTIONS = [
  { Icon: Bold, label: 'Bold', wrap: ['**', '**'] },
  { Icon: Italic, label: 'Italic', wrap: ['_', '_'] },
  { Icon: List, label: 'Bulleted list', line: '- ' },
  { Icon: Link2, label: 'Link', wrap: ['[', '](https://)'] },
]

function MarkdownEditor({ value, onChange }) {
  const ref = useRef(null)

  function apply(action) {
    const el = ref.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end)
    let next
    let caret
    if (action.line) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      next = `${value.slice(0, lineStart)}${action.line}${value.slice(lineStart)}`
      caret = end + action.line.length
    } else {
      const [open, close] = action.wrap
      next = `${value.slice(0, start)}${open}${selected}${close}${value.slice(end)}`
      caret = start + open.length + selected.length
    }
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(caret, caret)
    })
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-2 py-1.5 bg-surface-alt border-b border-border">
        {MD_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => apply(a)}
            title={a.label}
            aria-label={a.label}
            className="p-1.5 rounded text-content-muted hover:text-primary hover:bg-primary-light transition-colors"
          >
            <a.Icon size={15} />
          </button>
        ))}
        <span className="ml-auto text-xs text-content-muted pr-1">Markdown</span>
      </div>
      <textarea
        ref={ref}
        rows={9}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your announcement here…"
        className="w-full text-sm px-3 py-2.5 bg-surface focus:outline-none resize-y"
      />
    </div>
  )
}

// ── Compose pane ──────────────────────────────────────────────

function ComposePane({ item, isPending, onClose, onSubmit }) {
  const editing = !!item?.id
  const [form, setForm] = useState({
    category: item?.category ?? 'General',
    title: item?.title ?? '',
    body: item?.body ?? '',
    pinned: item?.pinned ?? false,
  })
  const [files, setFiles] = useState([])
  const canSave = form.title.trim() && form.body.trim()

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 py-4 border-b border-border bg-primary-light/40 flex items-center justify-between shrink-0">
        <h2 className="text-base font-bold text-content">{editing ? 'Edit Announcement' : 'Create New Announcement'}</h2>
        <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="an-cat" className="text-sm font-medium text-content">Category</label>
            <select id="an-cat" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2.5 text-sm text-content cursor-pointer pb-2.5">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
            Pin to top of list
          </label>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="an-title" className="text-sm font-medium text-content">Announcement Heading</label>
          <input id="an-title" type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Qualifying Exam Results" className={inputCls} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-content">Body Content</span>
          <MarkdownEditor value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-content">Attachments</span>
          {files.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="flex items-center gap-3 border border-border rounded-lg px-3 py-2">
                  <FileText size={15} className="text-primary shrink-0" />
                  <span className="text-sm text-content truncate flex-1">{f.name}</span>
                  <span className="text-xs text-content-muted shrink-0">{fileSize(f.size)}</span>
                  <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-content-muted hover:text-danger shrink-0" aria-label="Remove attachment"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
          <label htmlFor="an-files" className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-lg px-4 py-7 cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors">
            <UploadCloud size={22} className="text-content-muted" />
            <span className="text-sm text-content-muted"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</span>
            <span className="text-xs text-content-disabled">PDF, PNG, JPG (max. 10MB)</span>
            <input
              id="an-files"
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
          </label>
        </div>
      </div>

      <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3 shrink-0">
        <button disabled={!canSave || isPending} onClick={() => onSubmit({ ...form, files }, 'draft')} className="text-sm font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
          Save Draft
        </button>
        <button disabled={!canSave || isPending} onClick={() => onSubmit({ ...form, files }, 'published')} className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
          {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publish Announcement
        </button>
      </div>
    </div>
  )
}

// ── Detail pane ───────────────────────────────────────────────

function DetailPane({ item, onEdit, onDelete, onTogglePin, busy }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <CategoryBadge category={item.category} />
            <span className="inline-flex items-center gap-1.5 text-xs text-content-muted"><Clock size={12} /> {formatDateTime(item.published_at ?? item.created_at)}</span>
            {item.status === 'draft' && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-alt text-content-muted border border-border">Draft</span>}
            {item.pinned && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-light text-primary border border-primary/20"><Pin size={11} /> Pinned</span>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onTogglePin(item)} disabled={busy} className="p-2 text-content-muted hover:text-primary transition-colors disabled:opacity-50" aria-label={item.pinned ? 'Unpin' : 'Pin to top'}>
              {item.pinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
            <button onClick={() => onEdit(item)} className="p-2 text-content-muted hover:text-primary transition-colors" aria-label="Edit announcement"><PencilLine size={16} /></button>
            <button onClick={() => onDelete(item)} className="p-2 text-content-muted hover:text-danger transition-colors" aria-label="Delete announcement"><Trash2 size={16} /></button>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-content mt-3 leading-snug">{item.title}</h2>
        <p className="text-sm text-content-muted mt-1">Posted by {item.author ?? 'LYDO Admin'}</p>
      </div>

      <div className="flex-1 overflow-auto p-6 min-h-0">
        <div className="text-sm text-content leading-relaxed flex flex-col gap-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold">
          <ReactMarkdown>{item.body ?? ''}</ReactMarkdown>
        </div>

        {item.attachments?.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {item.attachments.map((f) => (
              <a
                key={f.id ?? f.name}
                href={f.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-border rounded-lg p-3 hover:border-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0"><FileText size={18} className="text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-content truncate">{f.name}</p>
                  <p className="text-xs text-content-muted">{fileSize(f.size)}</p>
                </div>
                <Download size={16} className="text-content-muted group-hover:text-primary transition-colors shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────

export function AnnouncementsPanel({ composing, onCloseCompose }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const { data, isPending } = useQuery({
    queryKey: queryKeys.announcements.all,
    queryFn: () => api.get('/admin/announcements').then((r) => r.data),
    retry: false,
  })

  const items = useMemo(() => data?.data ?? [], [data])
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items
      .filter((i) => (category === 'All' || i.category === category))
      .filter((i) => !q || i.title?.toLowerCase().includes(q) || i.body?.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return new Date(b.published_at ?? b.created_at) - new Date(a.published_at ?? a.created_at)
      })
  }, [items, search, category])

  const selected = filtered.find((i) => i.id === selectedId) ?? null

  const saveMutation = useMutation({
    mutationFn: ({ form, status }) => {
      const fd = new FormData()
      fd.append('category', form.category)
      fd.append('title', form.title)
      fd.append('body', form.body)
      fd.append('pinned', form.pinned ? '1' : '0')
      fd.append('status', status)
      form.files?.forEach((f) => fd.append('attachments[]', f))
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } }
      return editing?.id
        ? api.post(`/admin/announcements/${editing.id}?_method=PUT`, fd, cfg)
        : api.post('/admin/announcements', fd, cfg)
    },
    onSuccess: () => { toast.success('Announcement saved.'); invalidate(); setEditing(null); onCloseCompose() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save.'),
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, patch }) => api.patch(`/admin/announcements/${id}`, patch),
    onSuccess: (_r, v) => { toast.success(v.msg ?? 'Updated.'); invalidate() },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Action failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (item) => api.delete(`/admin/announcements/${item.id}`),
    onSuccess: () => { toast.success('Announcement deleted.'); invalidate(); setDeleting(null); setSelectedId(null) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not delete.'),
  })

  const busy = saveMutation.isPending || patchMutation.isPending || deleteMutation.isPending
  const showCompose = composing || !!editing

  return (
    <div className="flex gap-6 min-h-0 flex-1">
      {/* ── List ─────────────────────────────────────────────── */}
      <aside className={`${showCompose || selected ? 'hidden lg:flex' : 'flex'} w-full lg:w-95 flex-col bg-surface border border-border rounded-xl shadow-card shrink-0 min-h-0 overflow-hidden`}>
        <div className="p-4 border-b border-border shrink-0 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search announcements…" className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {['All', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${category === c ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0 p-3 space-y-2">
          {isPending ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
          ) : filtered.length > 0 ? (
            filtered.map((a) => {
              const active = a.id === selectedId
              return (
                <button
                  key={a.id}
                  onClick={() => { setSelectedId(a.id); setEditing(null); onCloseCompose() }}
                  className={`w-full text-left rounded-lg border p-4 transition-colors ${active ? 'bg-primary-light/50 border-l-4 border-l-primary border-y-border border-r-border' : 'bg-surface border-border hover:bg-surface-alt'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <CategoryBadge category={a.category} />
                    <span className="text-xs text-content-muted">{relative(a.published_at ?? a.created_at)}</span>
                    {a.pinned && <Pin size={13} className="ml-auto text-secondary shrink-0" />}
                  </div>
                  <p className="text-sm font-bold text-content leading-snug">{a.title}</p>
                  <p className="text-xs text-content-muted mt-1 line-clamp-2 leading-relaxed">{a.body}</p>
                </button>
              )
            })
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Megaphone size={26} className="text-content-disabled" />
              <p className="text-sm text-content-muted">{search || category !== 'All' ? 'No announcements match.' : 'No announcements yet.'}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Detail / Compose ─────────────────────────────────── */}
      <section className={`${showCompose || selected ? 'flex' : 'hidden lg:flex'} flex-1 bg-surface border border-border rounded-xl shadow-card min-w-0 min-h-0 overflow-hidden`}>
        {showCompose ? (
          <ComposePane
            item={editing}
            isPending={saveMutation.isPending}
            onClose={() => { setEditing(null); onCloseCompose() }}
            onSubmit={(form, status) => saveMutation.mutate({ form, status })}
          />
        ) : selected ? (
          <DetailPane
            item={selected}
            busy={busy}
            onEdit={(it) => setEditing(it)}
            onDelete={(it) => setDeleting(it)}
            onTogglePin={(it) => patchMutation.mutate({ id: it.id, patch: { pinned: !it.pinned }, msg: it.pinned ? 'Unpinned.' : 'Pinned to top.' })}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8">
            <Megaphone size={38} className="text-content-disabled" />
            <p className="text-sm text-content-muted">Select an announcement to read it, or create a new one.</p>
          </div>
        )}
      </section>

      {/* Delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleting(null)} />
          <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-danger-light text-danger flex items-center justify-center shrink-0"><Trash2 size={20} /></div>
              <div>
                <h3 className="text-base font-bold text-content">Delete announcement?</h3>
                <p className="text-xs text-content-muted mt-1 leading-relaxed">"{deleting.title}" will be permanently removed.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setDeleting(null)} className="text-sm font-medium text-content-muted px-4 py-2 rounded-lg hover:text-content">Cancel</button>
              <button disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleting)} className="inline-flex items-center gap-2 bg-danger text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                {deleteMutation.isPending && <Loader2 size={15} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
