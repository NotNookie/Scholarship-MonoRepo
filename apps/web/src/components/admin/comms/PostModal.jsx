import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  X, Loader2, Send, Bold, Italic, List, Link2, UploadCloud, FileText, CalendarDays, Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../../lib/axios'
import { queryKeys } from '../../../lib/queryKeys'
import { CATEGORIES, inputCls, fileSize } from './postUtils'

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
          <button key={a.label} type="button" onClick={() => apply(a)} title={a.label} aria-label={a.label}
            className="p-1.5 rounded text-content-muted hover:text-primary hover:bg-primary-light transition-colors">
            <a.Icon size={15} />
          </button>
        ))}
        <span className="ml-auto text-xs text-content-muted pr-1">Markdown</span>
      </div>
      <textarea
        ref={ref}
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your announcement here…"
        className="w-full text-sm px-3 py-2.5 bg-surface focus:outline-none resize-y"
      />
    </div>
  )
}

// ── Post modal ────────────────────────────────────────────────

export function PostModal({ post, isPending, onClose, onSubmit }) {
  const editing = !!post?.id
  const [form, setForm] = useState({
    category: post?.category ?? 'General',
    title: post?.title ?? '',
    body: post?.body ?? '',
    pinned: post?.pinned ?? false,
    scheduled: !!post?.date,
    date: post?.date ? String(post.date).slice(0, 10) : '',
    start_time: post?.start_time ?? '',
    end_time: post?.end_time ?? '',
    location: post?.location ?? '',
    target: post?.target ?? '',
  })
  const [files, setFiles] = useState([])
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const canSave = form.title.trim() && form.body.trim() && (!form.scheduled || form.date)

  // The AI writer is an optional, per-municipality feature (Maintenance →
  // Assistive Features). Only surface the button when the Head has enabled it.
  const { data: settings } = useQuery({
    queryKey: queryKeys.maintenance.settings(),
    queryFn: () => api.get('/admin/maintenance/settings').then((r) => r.data?.data ?? r.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
  const aiEnabled = !!settings?.feature_ai_text

  const aiDraft = useMutation({
    mutationFn: (payload) => api.post('/admin/announcements/ai-draft', payload).then((r) => r.data),
    onSuccess: (data) => {
      const text = data?.text ?? data?.draft
      if (text) setForm((f) => ({ ...f, body: f.body ? `${f.body}\n\n${text}` : text }))
      else toast('No draft was returned.', { icon: '✨' })
    },
    // No AI endpoint yet — fail gracefully rather than pretending.
    onError: () => toast('AI drafting isn’t connected yet — coming soon.', { icon: '✨' }),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-content">{editing ? 'Edit Post' : 'Create New Announcement'}</h2>
          <button onClick={onClose} className="text-content-muted hover:text-content" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-auto p-6 flex flex-col gap-5 min-h-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="p-cat" className="text-sm font-medium text-content">Category</label>
              <select id="p-cat" value={form.category} onChange={set('category')} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2.5 text-sm text-content cursor-pointer pb-2.5">
              <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
              Pin to top of list
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="p-title" className="text-sm font-medium text-content">Heading</label>
            <input id="p-title" type="text" value={form.title} onChange={set('title')} placeholder="e.g. Qualifying Exam Results" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-content">Body Content</span>
              {aiEnabled && (
                <button
                  type="button"
                  onClick={() => aiDraft.mutate({ title: form.title, category: form.category })}
                  disabled={aiDraft.isPending}
                  title="Draft the announcement text with AI. You can edit it before publishing."
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/40 px-2.5 py-1 rounded-md hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                  {aiDraft.isPending ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} Draft with AI
                </button>
              )}
            </div>
            <MarkdownEditor value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
          </div>

          {/* ── Optional schedule block ─────────────────────── */}
          <div className={`rounded-lg border transition-colors ${form.scheduled ? 'border-primary/30 bg-primary-light/20' : 'border-border'}`}>
            <label className="flex items-center gap-2.5 text-sm font-medium text-content cursor-pointer p-4">
              <input
                type="checkbox"
                checked={form.scheduled}
                onChange={(e) => setForm((f) => ({ ...f, scheduled: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <CalendarDays size={15} className="text-primary" />
              This is a scheduled event
              <span className="text-xs text-content-muted font-normal">— adds it to the calendar &amp; upcoming schedules</span>
            </label>

            {form.scheduled && (
              <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="p-date" className="text-sm font-medium text-content">Date</label>
                    <input id="p-date" type="date" value={form.date} onChange={set('date')} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="p-start" className="text-sm font-medium text-content">Start</label>
                    <input id="p-start" type="time" value={form.start_time} onChange={set('start_time')} className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="p-end" className="text-sm font-medium text-content">End</label>
                    <input id="p-end" type="time" value={form.end_time} onChange={set('end_time')} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="p-loc" className="text-sm font-medium text-content">Location</label>
                    <input id="p-loc" type="text" value={form.location} onChange={set('location')} placeholder="e.g. Sta. Cruz Municipal Hall" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="p-target" className="text-sm font-medium text-content flex items-center gap-1.5">
                      Target Audience <span className="text-xs text-content-muted font-normal">(Optional)</span>
                    </label>
                    <input id="p-target" type="text" value={form.target} onChange={set('target')} placeholder="e.g. Incoming College Freshmen" className={inputCls} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attachments */}
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
            <label htmlFor="p-files" className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-border rounded-lg px-4 py-6 cursor-pointer hover:border-primary hover:bg-primary-light/30 transition-colors">
              <UploadCloud size={22} className="text-content-muted" />
              <span className="text-sm text-content-muted"><span className="text-primary font-semibold">Click to upload</span> or drag and drop</span>
              <span className="text-xs text-content-disabled">PDF, PNG, JPG (max. 10MB)</span>
              <input id="p-files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden"
                onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])} />
            </label>
          </div>
        </div>

        <div className="px-6 py-4 bg-surface-alt border-t border-border flex items-center justify-end gap-3 shrink-0">
          <button disabled={!canSave || isPending} onClick={() => onSubmit({ ...form, files }, 'draft')}
            className="text-sm font-semibold text-content-muted border border-border px-4 py-2 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
            Save Draft
          </button>
          <button disabled={!canSave || isPending} onClick={() => onSubmit({ ...form, files }, 'published')}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publish
          </button>
        </div>
      </div>
    </div>
  )
}
