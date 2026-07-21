import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FilePlus,
  FileText,
  Megaphone,
  ChevronRight,
  CheckCircle2,
  CalendarCheck,
  Banknote,
  BookOpen,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { AnnouncementCard } from '../../components/shared/AnnouncementCard'
import { Skeleton } from '../../components/shared/Skeleton'
import { StatusPill } from '../../components/shared/StatusPill'
import { APPLICATION_STATUS } from '../../components/shared/statusConfig'

// ── Helpers ───────────────────────────────────────────────────

const APPLICATION_STEPS = ['Draft', 'Submitted', 'Under Review', 'Decision', 'Awarded']

function StatCard({ Icon, label, value, sub, accent }) {
  return (
    <div className={`bg-surface border rounded-xl p-5 shadow-card flex items-start gap-4 ${accent ?? 'border-border'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-primary text-on-primary' : 'bg-primary-light'}`}>
        <Icon size={18} className={accent ? 'text-on-primary' : 'text-primary'} />
      </div>
      <div>
        <p className="text-xs text-content-muted">{label}</p>
        <p className="text-base font-bold text-content mt-0.5">{value}</p>
        {sub && <p className="text-xs text-content-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Application tracker ───────────────────────────────────────

function ApplicationTracker({ application }) {
  if (!application) {
    return (
      <div className="bg-surface border border-border rounded-xl shadow-card p-8 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center">
          <FilePlus size={24} className="text-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-content">No Application Yet</p>
          <p className="text-sm text-content-muted mt-1 max-w-sm">
            You haven't submitted a scholarship application for this academic year.
            Start your application to get your scholarship grant.
          </p>
        </div>
        <Link
          to="/apply"
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Apply Now <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  const statusIndex = {
    draft: 0, submitted: 2, incomplete: 2, approved: 3, rejected: 3,
  }[application.status] ?? 0

  const currentStep = statusIndex

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-content">
            {application.scholarship_name ?? 'Scholarship Application'}
          </p>
          <p className="text-xs text-content-muted mt-0.5">
            AY {application.academic_year ?? '2026–2027'}
          </p>
        </div>
        <StatusPill status={application.status} />
      </div>

      {/* Progress stepper */}
      <div className="px-6 py-6">
        <div className="relative flex items-center">
          {/* Track */}
          <div className="absolute top-4 left-0 right-0 h-px bg-border z-0" />
          <div
            className="absolute top-4 left-0 h-px bg-primary z-0 transition-all duration-700"
            style={{ width: `${(currentStep / (APPLICATION_STEPS.length - 1)) * 100}%` }}
          />
          {/* Steps */}
          <div className="relative z-10 flex justify-between w-full">
            {APPLICATION_STEPS.map((label, i) => {
              const done = i < currentStep
              const active = i === currentStep
              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors ${
                      done
                        ? 'bg-primary border-primary text-on-primary'
                        : active
                        ? 'bg-surface border-primary text-primary'
                        : 'bg-surface border-border text-content-muted'
                    }`}
                  >
                    {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight ${active ? 'text-primary' : done ? 'text-content' : 'text-content-muted'}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-6 pb-5 flex flex-wrap gap-3">
        <Link
          to={`/applications/${application.id}`}
          className="text-xs font-semibold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors"
        >
          View Application
        </Link>
        {application.status === 'draft' && (
          <Link
            to="/apply"
            className="text-xs font-semibold bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Continue Application
          </Link>
        )}
      </div>
    </div>
  )
}

// ── Main ─────────────────────────────────────────────────────

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.first_name ?? user?.name?.split(' ')[0] ?? 'Scholar'

  const applicationQuery = useQuery({
    queryKey: queryKeys.applications?.list?.({ per_page: 1 }) ?? ['applications', 'latest'],
    queryFn: () => api.get('/applications?per_page=1&sort=desc').then((r) => r.data?.data?.[0] ?? null),
    retry: false,
  })

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements.list({ per_page: 3 }),
    queryFn: () => api.get('/announcements?per_page=3&sort=desc').then((r) => r.data),
    retry: false,
  })

  const application = applicationQuery.data
  const announcements = announcementsQuery.data?.data ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">

      {/* ── Welcome banner ────────────────────────────────────── */}
      <section className="bg-primary rounded-2xl px-8 py-8 text-on-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-modal">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-80 pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold text-on-primary/70 uppercase tracking-widest mb-1">
            Student Portal
          </p>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}!</h1>
          <p className="text-on-primary/70 text-sm mt-1">
            Track your application and stay updated with the latest announcements.
          </p>
        </div>
        <Link
          to="/apply"
          className="relative z-10 inline-flex items-center gap-2 bg-secondary text-on-secondary text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0 shadow-sm"
        >
          <FilePlus size={15} /> Apply Now
        </Link>
      </section>

      {/* ── Stat cards ────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {applicationQuery.isPending ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5 shadow-card">
              <Skeleton className="h-10 w-10 rounded-lg mb-3" />
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              Icon={FileText}
              label="Application Status"
              value={APPLICATION_STATUS[application?.status]?.label ?? 'No Application'}
              sub={application ? `AY ${application.academic_year ?? '2026–2027'}` : 'Start your application today'}
            />
            <StatCard
              Icon={Banknote}
              label="Scholarship Grant"
              value={application?.grant_amount ? `₱${Number(application.grant_amount).toLocaleString()}` : '—'}
              sub={application?.grant_amount ? 'Per semester' : 'Pending approval'}
            />
            <StatCard
              Icon={CalendarCheck}
              label="Application Deadline"
              value="Aug 15, 2026"
              sub="AY 2026–2027 applications"
              accent="border-primary/20"
            />
          </>
        )}
      </section>

      {/* ── Main content grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Application tracker */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-content">My Application</h2>
            <Link to="/scholarship" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight size={13} />
            </Link>
          </div>

          {applicationQuery.isPending ? (
            <div className="bg-surface border border-border rounded-xl shadow-card p-6 space-y-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ) : (
            <ApplicationTracker application={application} />
          )}

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/scholarship"
              className="bg-surface border border-border rounded-xl p-5 shadow-card flex items-center gap-4 hover:border-primary group transition-colors"
            >
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <FileText size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content group-hover:text-primary transition-colors">My Scholarship</p>
                <p className="text-xs text-content-muted mt-0.5">View history & documents</p>
              </div>
              <ChevronRight size={15} className="text-content-muted group-hover:text-primary transition-colors" />
            </Link>
            <Link
              to="/student/announcements"
              className="bg-surface border border-border rounded-xl p-5 shadow-card flex items-center gap-4 hover:border-primary group transition-colors"
            >
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <Megaphone size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-content group-hover:text-primary transition-colors">Announcements</p>
                <p className="text-xs text-content-muted mt-0.5">Latest news from LYDO</p>
              </div>
              <ChevronRight size={15} className="text-content-muted group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>

        {/* Sidebar — announcements */}
        <aside className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-content">Latest Updates</h2>
            <Link to="/student/announcements" className="text-xs text-primary hover:underline flex items-center gap-1">
              See all <ChevronRight size={13} />
            </Link>
          </div>

          {announcementsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-4 shadow-card space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl p-8 flex flex-col items-center text-center gap-3 shadow-card">
              <Megaphone size={28} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No announcements yet.</p>
            </div>
          )}

          {/* Resources card */}
          <div className="bg-surface-alt border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={16} className="text-primary" />
              <p className="text-sm font-bold text-content">Resources</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/requirements" className="text-xs text-primary hover:underline">Applicant Requirements</Link>
              <Link to="/scholarships" className="text-xs text-primary hover:underline">Browse Scholarships</Link>
              <Link to="/requirements" className="text-xs text-primary hover:underline">Download Forms</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
