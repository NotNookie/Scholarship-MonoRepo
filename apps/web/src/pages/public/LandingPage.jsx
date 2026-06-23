import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  UserPlus,
  FileText,
  Upload,
  Search,
  Award,
  Users,
  TrendingUp,
  Clock,
  Megaphone,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { AnnouncementCard } from '../../components/shared/AnnouncementCard'
import { Skeleton } from '../../components/shared/Skeleton'

const STEPS = [
  { n: 1, Icon: UserPlus, title: 'Register', desc: 'Create your free account on the portal.' },
  { n: 2, Icon: FileText, title: 'Apply Online', desc: 'Fill in the scholarship application form.' },
  { n: 3, Icon: Upload, title: 'Upload Documents', desc: 'Submit your supporting documents digitally.' },
  { n: 4, Icon: Search, title: 'Track Status', desc: 'Monitor your application in real time.' },
  { n: 5, Icon: Award, title: 'Receive Scholarship', desc: 'Get notified and receive your grant.' },
]

const STAT_TILES = [
  { key: 'active_scholars', label: 'Active Scholars', Icon: Users, colorClass: 'text-primary' },
  { key: 'new_applicants', label: 'New Applicants', Icon: TrendingUp, colorClass: 'text-secondary-dark' },
  { key: 'doc_accuracy', label: 'Doc. Accuracy', Icon: FileText, colorClass: 'text-success-dark', suffix: '%' },
  { key: 'availability', label: 'Online Support', Icon: Clock, colorClass: 'text-primary', fallback: '24/7' },
]

export function LandingPage() {
  const statsQuery = useQuery({
    queryKey: queryKeys.stats.public(),
    queryFn: () => api.get('/stats/public').then((r) => r.data),
    retry: false,
  })

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements.list({ per_page: 3 }),
    queryFn: () => api.get('/announcements?per_page=3&sort=desc').then((r) => r.data),
    retry: false,
  })

  const stats = statsQuery.data
  const announcements = announcementsQuery.data?.data ?? []

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-16">

          {/* Left — headline + CTAs */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
              Iskolar ng Bayan Scholarship Program
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Iskolar ng Bayan
            </h1>
            <p className="text-on-primary/80 text-base md:text-lg leading-relaxed mb-2">
              Digital scholarship management for the municipalities of{' '}
              <span className="text-secondary font-medium">
                Sta. Cruz, Laguna
              </span>
            </p>
            <p className="text-on-primary/60 text-sm mb-8">
              Apply online, upload your requirements, and track your application — all in one place.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded font-semibold text-sm hover:bg-secondary-light transition-colors"
              >
                Apply Now
                <ChevronRight size={15} />
              </Link>
              <Link
                to="/requirements"
                className="inline-flex items-center gap-2 border border-on-primary/30 text-on-primary px-6 py-3 rounded font-medium text-sm hover:bg-primary transition-colors"
              >
                View Requirements
              </Link>
            </div>
          </div>

          {/* Right — stats card */}
          <div className="w-full md:w-64 bg-surface rounded-xl shadow-modal p-6 text-content shrink-0">
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-5">
              Program Overview
            </p>
            <div className="grid grid-cols-2 gap-5">
              {STAT_TILES.map(({ key, label, Icon, colorClass, suffix, fallback }) => (
                <div key={key} className="text-center">
                  <Icon size={18} className={`${colorClass} mx-auto mb-1.5`} />
                  {statsQuery.isPending ? (
                    <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  ) : (
                    <p className={`text-2xl font-bold leading-none mb-1 ${colorClass}`}>
                      {stats?.[key] != null
                        ? `${stats[key]}${suffix ?? ''}`
                        : (fallback ?? '—')}
                    </p>
                  )}
                  <p className="text-xs text-content-muted leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How to Apply ─────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold text-content">How to Apply</h2>
            <p className="text-sm text-content-muted mt-1">Five simple steps to get your scholarship</p>
          </div>

          <div className="relative flex flex-col md:flex-row items-stretch md:items-start gap-6 md:gap-0">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-border z-0" />

            {STEPS.map(({ n, Icon, title, desc }) => (
              <div key={n} className="flex-1 flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-3 relative z-10 md:px-2">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-on-primary text-xs font-bold rounded-full flex items-center justify-center">
                    {n}
                  </span>
                </div>
                <div className="md:text-center">
                  <p className="text-sm font-semibold text-content">{title}</p>
                  <p className="text-xs text-content-muted mt-0.5 md:max-w-[120px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Announcements ─────────────────────────────── */}
      <section className="bg-surface-alt">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-content">Latest Announcements</h2>
              <p className="text-sm text-content-muted mt-0.5">Stay updated from the LYDO office</p>
            </div>
            <Link
              to="/announcements"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {announcementsQuery.isPending ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface rounded-lg p-5 shadow-card space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Megaphone size={32} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No announcements yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
