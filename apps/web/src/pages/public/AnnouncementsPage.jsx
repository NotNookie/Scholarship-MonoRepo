import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { AnnouncementCard } from '../../components/shared/AnnouncementCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { EmptyState } from '../../components/shared/EmptyState'

const CATEGORIES = ['All', 'Examination', 'Orientation', 'Payout', 'Requirements']

export function AnnouncementsPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const { data, isPending } = useQuery({
    queryKey: queryKeys.announcements.list({ category: activeCategory }),
    queryFn: () => {
      const params = new URLSearchParams({ sort: 'desc', per_page: '20' })
      if (activeCategory !== 'All') params.set('category', activeCategory)
      return api.get(`/announcements?${params}`).then((r) => r.data)
    },
    retry: false,
  })

  const announcements = data?.data ?? []

  return (
    <>
      {/* ── Page header ────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-on-primary/70 text-sm">
            Stay updated with the latest news from the LYDO scholarship office.
          </p>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-10">

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isPending ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg p-5 shadow-card space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title={
              activeCategory === 'All'
                ? 'No announcements yet'
                : `No ${activeCategory} announcements`
            }
            description="Check back later for updates from the LYDO scholarship office."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} announcement={a} variant="full" />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
