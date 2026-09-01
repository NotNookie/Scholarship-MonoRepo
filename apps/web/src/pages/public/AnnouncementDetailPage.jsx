import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, Calendar, Megaphone } from 'lucide-react'
import { api } from '../../lib/axios'
import { Skeleton } from '../../components/shared/Skeleton'
import { Markdown } from '../../components/shared/Markdown'
import { AttachmentList } from '../../components/shared/AttachmentList'
import { FALLBACK_ANNOUNCEMENTS, CATEGORY_STYLES } from '../../data/announcements'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function AnnouncementDetailPage() {
  const { id } = useParams()

  const { data, isPending } = useQuery({
    queryKey: ['announcements', 'detail', id],
    queryFn: () => api.get(`/announcements/${id}`).then((r) => r.data?.data ?? r.data),
    retry: false,
  })

  const fallback = FALLBACK_ANNOUNCEMENTS.find((a) => String(a.id) === String(id)) ?? null
  const announcement = data ?? fallback

  if (isPending && !announcement) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center">
          <Megaphone size={26} className="text-content-disabled" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Announcement not found</h1>
          <p className="text-sm text-content-muted mt-1">It may have been removed, or the link is incorrect.</p>
        </div>
        <Link to="/announcements" className="inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary px-5 py-2.5 rounded-lg hover:bg-primary-light transition-colors">
          Back to announcements
        </Link>
      </div>
    )
  }

  const style = CATEGORY_STYLES[announcement.category] ?? CATEGORY_STYLES.General

  return (
    <article className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">
      <Link to="/announcements" className="inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-primary transition-colors w-fit">
        <ChevronLeft size={15} /> Back to announcements
      </Link>

      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${style}`}>
            {announcement.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-content-muted">
            <Calendar size={13} /> {formatDate(announcement.published_at ?? announcement.created_at)}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-content leading-tight">{announcement.title}</h1>
      </header>

      <div className="bg-surface border border-border rounded-xl shadow-card p-6">
        <Markdown className="text-sm text-content leading-relaxed">{announcement.body}</Markdown>
        {announcement.attachments?.length > 0 && <AttachmentList files={announcement.attachments} className="mt-6" />}
      </div>
    </article>
  )
}
