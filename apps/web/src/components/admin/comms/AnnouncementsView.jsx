import { useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  Search, Megaphone, Pin, PinOff, PencilLine, Trash2, Clock, FileText, Download,
  CalendarDays, MapPin, Users, Send,
} from 'lucide-react'
import { Skeleton } from '../../shared/Skeleton'
import { CalendarPane } from './CalendarPane'
import { CATEGORIES, CATEGORY_STYLES, formatDate, formatDateTime, relative, fileSize, isEvent } from './postUtils'

function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${CATEGORY_STYLES[category] ?? CATEGORY_STYLES.General}`}>
      {category}
    </span>
  )
}

// ── Detail ────────────────────────────────────────────────────

function Detail({ post, onEdit, onDelete, onTogglePin, onPublish, busy }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <CategoryBadge category={post.category} />
            <span className="inline-flex items-center gap-1.5 text-xs text-content-muted"><Clock size={12} /> {formatDateTime(post.published_at ?? post.created_at)}</span>
            {post.status === 'draft' && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-alt text-content-muted border border-border">Draft</span>}
            {post.pinned && <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-light text-primary border border-primary/20"><Pin size={11} /> Pinned</span>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {post.status === 'draft' && (
              <button onClick={() => onPublish(post)} disabled={busy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 mr-1">
                <Send size={13} /> Publish
              </button>
            )}
            <button onClick={() => onTogglePin(post)} disabled={busy} className="p-2 text-content-muted hover:text-primary transition-colors disabled:opacity-50" aria-label={post.pinned ? 'Unpin' : 'Pin to top'}>
              {post.pinned ? <PinOff size={16} /> : <Pin size={16} />}
            </button>
            <button onClick={() => onEdit(post)} className="p-2 text-content-muted hover:text-primary transition-colors" aria-label="Edit"><PencilLine size={16} /></button>
            <button onClick={() => onDelete(post)} className="p-2 text-content-muted hover:text-danger transition-colors" aria-label="Delete"><Trash2 size={16} /></button>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-content mt-3 leading-snug">{post.title}</h2>
        <p className="text-sm text-content-muted mt-1">Posted by {post.author ?? 'LYDO Admin'}</p>
      </div>

      <div className="flex-1 overflow-auto p-6 min-h-0">
        {/* Schedule block, when this post is an event */}
        {isEvent(post) && (
          <div className="mb-5 rounded-lg border border-primary/20 bg-primary-light/30 p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Event Details</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-content">
              <span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-content-muted" />{formatDate(post.date)}</span>
              {(post.start_time || post.end_time) && (
                <span className="inline-flex items-center gap-2"><Clock size={14} className="text-content-muted" />{[post.start_time, post.end_time].filter(Boolean).join(' – ')}</span>
              )}
              {post.location && <span className="inline-flex items-center gap-2"><MapPin size={14} className="text-content-muted" />{post.location}</span>}
              {post.target && <span className="inline-flex items-center gap-2"><Users size={14} className="text-content-muted" />{post.target}</span>}
            </div>
          </div>
        )}

        <div className="text-sm text-content leading-relaxed flex flex-col gap-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold">
          <ReactMarkdown>{post.body ?? ''}</ReactMarkdown>
        </div>

        {post.attachments?.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {post.attachments.map((f) => (
              <a key={f.id ?? f.name} href={f.url ?? '#'} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 border border-border rounded-lg p-3 hover:border-primary transition-colors group">
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

// ── View ──────────────────────────────────────────────────────

export function AnnouncementsView({ posts, isPending, selectedId, onSelect, onEdit, onDelete, onTogglePin, onPublish, busy }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [eventsOnly, setEventsOnly] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return posts
      .filter((p) => (category === 'All' || p.category === category))
      .filter((p) => !eventsOnly || isEvent(p))
      .filter((p) => !q || p.title?.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return new Date(b.published_at ?? b.created_at) - new Date(a.published_at ?? a.created_at)
      })
  }, [posts, search, category, eventsOnly])

  const selected = filtered.find((p) => p.id === selectedId) ?? null

  return (
    <div className="flex gap-6 min-h-0 flex-1">
      <aside className={`${selected ? 'hidden lg:flex' : 'flex'} w-full lg:w-95 flex-col bg-surface border border-border rounded-xl shadow-card shrink-0 min-h-0 overflow-hidden`}>
        <div className="p-4 border-b border-border shrink-0 space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search announcements…"
              className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-border bg-surface-alt focus:outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setEventsOnly((v) => !v)}
              className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${eventsOnly ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'}`}
            >
              <CalendarDays size={12} /> Events
            </button>
            <span className="w-px h-4 bg-border shrink-0" />
            {['All', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${category === c ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto min-h-0 p-3 space-y-2">
          {isPending ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)
          ) : filtered.length > 0 ? (
            filtered.map((p) => {
              const active = p.id === selectedId
              return (
                <button key={p.id} onClick={() => onSelect(p.id)}
                  className={`w-full text-left rounded-lg border p-4 transition-colors ${active ? 'bg-primary-light/50 border-l-4 border-l-primary border-y-border border-r-border' : 'bg-surface border-border hover:bg-surface-alt'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <CategoryBadge category={p.category} />
                    {isEvent(p) && <CalendarDays size={12} className="text-primary shrink-0" />}
                    <span className="text-xs text-content-muted">{relative(p.published_at ?? p.created_at)}</span>
                    {p.pinned && <Pin size={13} className="ml-auto text-secondary shrink-0" />}
                  </div>
                  <p className="text-sm font-bold text-content leading-snug">{p.title}</p>
                  <p className="text-xs text-content-muted mt-1 line-clamp-2 leading-relaxed">{p.body}</p>
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

      <section className={`${selected ? 'flex' : 'hidden lg:flex'} flex-1 bg-surface border border-border rounded-xl shadow-card min-w-0 min-h-0 overflow-hidden`}>
        {selected ? (
          <Detail post={selected} busy={busy} onEdit={onEdit} onDelete={onDelete} onTogglePin={onTogglePin} onPublish={onPublish} />
        ) : (
          <CalendarPane posts={posts} onSelect={onSelect} />
        )}
      </section>
    </div>
  )
}
