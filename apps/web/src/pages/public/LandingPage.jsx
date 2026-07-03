import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  UserPlus,
  FileText,
  Upload,
  Search,
  Award,
  Megaphone,
  Users,
} from 'lucide-react'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { AnnouncementCard } from '../../components/shared/AnnouncementCard'
import { Skeleton } from '../../components/shared/Skeleton'

const STEPS = [
  { n: 1, Icon: UserPlus,  title: 'Register',            desc: 'Create your free account on the portal.' },
  { n: 2, Icon: FileText,  title: 'Apply Online',         desc: 'Fill in the scholarship application form.' },
  { n: 3, Icon: Upload,    title: 'Upload Documents',     desc: 'Submit your supporting documents digitally.' },
  { n: 4, Icon: Search,    title: 'Track Status',         desc: 'Monitor your application in real time.' },
  { n: 5, Icon: Award,     title: 'Receive Scholarship',  desc: 'Get notified and receive your grant.' },
]

export function LandingPage() {
  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements.list({ per_page: 3 }),
    queryFn: () => api.get('/announcements?per_page=3&sort=desc').then((r) => r.data),
    retry: false,
  })

  const announcements = announcementsQuery.data?.data ?? []

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-primary-dark text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left — headline + CTAs */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
              Applications now open for AY 2026–2027
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Iskolar ng Bayan
            </h1>
            <p className="text-on-primary/80 text-base leading-relaxed mb-8 max-w-lg">
              The official Digital Scholarship Management Platform for the Iskolar ng Bayan program
              of the Municipality of Sta. Cruz, Laguna. Empowering the youth of our municipality
              through accessible education.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Apply Now <ChevronRight size={15} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-on-primary/30 text-on-primary px-6 py-3 rounded font-medium text-sm hover:bg-white/10 transition-colors"
              >
                <Users size={15} />
                Student Login
              </Link>
            </div>
          </div>

          {/* Right — illustration placeholder */}
          <div className="hidden md:flex w-[380px] aspect-[4/3] rounded-2xl bg-white/10 items-center justify-center shrink-0 overflow-hidden border border-white/10">
            <div className="flex flex-col items-center gap-3 text-on-primary/30">
              <Users size={72} strokeWidth={1.2} />
            </div>
          </div>
        </div>
      </section>

      {/* ── About the Program ────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center mb-3">
            <h2 className="text-xl font-semibold text-content">About the Program</h2>
          </div>
          <p className="text-sm text-content-muted text-center max-w-xl mx-auto mb-10 leading-relaxed">
            The Municipal Youth Development Office of Sta. Cruz, Laguna is committed to ensuring
            every deserving student has access to higher education through a streamlined and
            transparent application process.
          </p>

          <div className="relative flex flex-col md:flex-row items-stretch md:items-start gap-6 md:gap-0">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-border z-0" />

            {STEPS.map(({ n, Icon, title, desc }) => (
              <div
                key={n}
                className="flex-1 flex flex-row md:flex-col items-start md:items-center gap-4 md:gap-3 relative z-10 md:px-2"
              >
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
