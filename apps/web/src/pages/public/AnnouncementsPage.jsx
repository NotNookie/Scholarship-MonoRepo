import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, Search, ChevronRight, Calendar } from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { Markdown } from '../../components/shared/Markdown'
import { AttachmentList } from '../../components/shared/AttachmentList'
import { useBrand } from '../../tenant/TenantContext'

const FALLBACK_ANNOUNCEMENTS = [
  {
    id: 1,
    category: 'Requirements',
    title: 'Scholarship Applications Now Open for AY 2026–2027',
    body: 'The Municipal Youth Development Office is pleased to announce that scholarship applications for Academic Year 2026–2027 are now open. Qualified residents of Sta. Cruz, Laguna are encouraged to apply through the Iskolar ng Bayan portal. Complete all required documents and submit before the deadline.',
    created_at: '2026-06-20T08:00:00Z',
  },
  {
    id: 2,
    category: 'Examination',
    title: 'Qualifying Examination Schedule Posted',
    body: 'Examination batches for new applicants have been finalized. Please check your portal to view your assigned testing center, date, and time.',
    created_at: '2026-06-15T10:00:00Z',
  },
  {
    id: 3,
    category: 'Orientation',
    title: 'Orientation Venue Change for Batch 1',
    body: 'Please be informed that the venue for Batch 1 orientation has been updated. Check your portal inbox for the new location details.',
    created_at: '2026-06-10T09:00:00Z',
  },
  {
    id: 4,
    category: 'Requirements',
    title: 'Updated List of Valid Proof of Residency Documents',
    body: 'The LYDO office has updated the list of accepted residency documents. Please review the Requirements page for the latest information.',
    created_at: '2026-06-05T14:00:00Z',
  },
  {
    id: 5,
    category: 'Payout',
    title: 'First Semester Allowances Released for Continuing Scholars',
    body: 'First semester stipends for continuing scholars have been processed. Please coordinate with the LYDO office for disbursement details.',
    created_at: '2026-05-28T11:00:00Z',
  },
]

const CATEGORY_STYLES = {
  Examination: 'bg-warning-light text-warning border-warning/20',
  Orientation: 'bg-info-light text-info border-info/20',
  Payout:      'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-primary-light text-primary border-primary/20',
}

const ITEMS_INITIAL = 4

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

function CategoryBadge({ category }) {
  const style = CATEGORY_STYLES[category] ?? 'bg-border text-content-muted border-border'
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border shrink-0 ${style}`}>
      {category}
    </span>
  )
}

export function AnnouncementsPage() {
  const [search, setSearch] = useState('')
  const brand = useBrand()
  const [showAll, setShowAll] = useState(false)

  const { data, isPending } = useQuery({
    queryKey: queryKeys.announcements.list({ all: true }),
    queryFn: () => api.get('/announcements?sort=desc&per_page=50').then((r) => r.data),
    placeholderData: { data: FALLBACK_ANNOUNCEMENTS },
    retry: false,
  })

  const allAnnouncements = data?.data?.length ? data.data : FALLBACK_ANNOUNCEMENTS

  const filtered = useMemo(() => {
    if (!search.trim()) return allAnnouncements
    const q = search.toLowerCase()
    return allAnnouncements.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q)
    )
  }, [allAnnouncements, search])

  const featured = filtered[0] ?? null
  const rest = filtered.slice(1)
  const visibleRest = showAll ? rest : rest.slice(0, ITEMS_INITIAL - 1)
  const hasMore = rest.length > ITEMS_INITIAL - 1 && !showAll

  return (
    <>
      {/* ── Page header ────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Public Announcements</h1>
            <p className="text-on-primary/70 text-sm">
              Official updates and notices from {brand.program} of {brand.municipality}.
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface text-content text-sm pl-9 pr-4 py-2.5 rounded border border-border focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10">

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title={search ? 'No results found' : 'No announcements yet'}
            description={
              search
                ? `No announcements match "${search}". Try a different search term.`
                : `Check back later for updates from the ${brand.officeShort} scholarship office.`
            }
          />
        ) : (
          <>
            {/* Featured announcement */}
            {featured && (
              <div className="bg-surface rounded-xl shadow-card p-6 mb-8 border border-border">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <CategoryBadge category={featured.category} />
                  <div className="flex items-center gap-1.5 text-xs text-content-disabled shrink-0">
                    <Calendar size={12} />
                    {formatDate(featured.created_at)}
                  </div>
                </div>
                <h2 className="text-lg font-bold text-content leading-snug mb-3">
                  {featured.title}
                </h2>
                <Markdown className="text-sm text-content-muted leading-relaxed">
                  {featured.body}
                </Markdown>
                {featured.attachments?.length > 0 && (
                  <AttachmentList files={featured.attachments} className="mt-5" />
                )}
              </div>
            )}

            {/* Previous updates */}
            {visibleRest.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">
                  Previous Updates
                </p>
                <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-surface">
                  {visibleRest.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-surface-alt transition-colors cursor-pointer group"
                    >
                      <CategoryBadge category={a.category} />
                      <div className="flex items-center gap-1.5 text-xs text-content-disabled shrink-0">
                        <Calendar size={11} />
                        {formatDate(a.created_at)}
                      </div>
                      <p className="flex-1 min-w-0 text-sm font-medium text-content truncate">
                        {a.title}
                      </p>
                      <ChevronRight size={16} className="text-content-disabled shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Load more */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="border border-border text-content-muted text-sm px-6 py-2.5 rounded hover:border-primary hover:text-primary transition-colors"
                >
                  Load More Announcements
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
