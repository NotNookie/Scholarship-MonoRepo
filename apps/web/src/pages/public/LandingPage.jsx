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
  MapPin,
  Phone,
  Mail,
  Globe,
} from 'lucide-react'

// Facebook glyph (lucide dropped brand icons)
function FacebookIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 9H15V6.5h-1.5c-1.66 0-3 1.34-3 3V11H9v2.5h1.5V19H13v-5.5h1.7l.3-2.5H13V9.5c0-.28.22-.5.5-.5z" />
    </svg>
  )
}
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../store/authStore'
import { useBrand } from '../../tenant/TenantContext'
import { AnnouncementCard } from '../../components/shared/AnnouncementCard'
import { Skeleton } from '../../components/shared/Skeleton'

const STEPS = [
  { n: 1, Icon: UserPlus,  title: 'Register',           desc: 'Create your free account on the portal.' },
  { n: 2, Icon: FileText,  title: 'Apply Online',        desc: 'Fill in the scholarship application form.' },
  { n: 3, Icon: Upload,    title: 'Upload Documents',    desc: 'Submit your supporting documents digitally.' },
  { n: 4, Icon: Search,    title: 'Track Status',        desc: 'Monitor your application in real time.' },
  { n: 5, Icon: Award,     title: 'Receive Scholarship', desc: 'Get notified and receive your grant.' },
]

export function LandingPage() {
  const isScholar = useAuthStore((s) => s.user?.role === 'scholar')
  const brand = useBrand()

  // Only show contact rows the municipality actually provides.
  const CONTACT = [
    brand.contact.addressLines?.length && { Icon: MapPin, label: 'Office Address', lines: brand.contact.addressLines },
    brand.contact.phone && { Icon: Phone, label: 'Phone', lines: [brand.contact.phone] },
    brand.contact.email && { Icon: Mail, label: 'Email', lines: [brand.contact.email] },
  ].filter(Boolean)
  const hasMap = !!brand.mapEmbedUrl

  const announcementsQuery = useQuery({
    queryKey: queryKeys.announcements.list({ per_page: 3 }),
    queryFn: () => api.get('/announcements?per_page=3&sort=desc').then((r) => r.data),
    retry: false,
  })

  const announcements = announcementsQuery.data?.data ?? []

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-primary text-on-primary">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10 md:gap-16">

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/10 text-secondary text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-secondary rounded-full shrink-0" />
              Applications now open for AY 2026–2027
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
              {brand.program}
            </h1>
            <p className="text-on-primary/80 text-base leading-relaxed mb-8 max-w-lg">
              {brand.blurb}
            </p>

            <div className="flex flex-wrap gap-3">
              {isScholar ? (
                <>
                  <Link
                    to="/scholarship"
                    className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Apply Now <ChevronRight size={15} />
                  </Link>
                  <Link
                    to="/scholarship"
                    className="inline-flex items-center gap-2 border border-on-primary/30 text-on-primary px-6 py-3 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
                  >
                    <Users size={15} />
                    My Scholarship
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Apply Now <ChevronRight size={15} />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 border border-on-primary/30 text-on-primary px-6 py-3 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
                  >
                    <Users size={15} />
                    Student Login
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex w-[380px] aspect-[4/3] rounded-2xl bg-white/5 items-center justify-center shrink-0 border border-white/10">
            <Users size={80} strokeWidth={1.2} className="text-white/20" />
          </div>
        </div>
      </section>

      {/* ── About the Program ────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-primary">About the Program</h2>
          </div>
          <p className="text-sm text-content-muted text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            The {brand.office} of {brand.municipality} is committed to ensuring
            every deserving student has access to higher education through a streamlined and
            transparent application process.
          </p>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-px bg-border z-0" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {STEPS.map(({ n, Icon, title, desc }) => (
                <div key={n} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-light border-2 border-primary flex items-center justify-center mb-4 relative bg-surface">
                    <Icon size={22} className="text-primary" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-on-primary text-xs font-bold rounded-full flex items-center justify-center">
                      {n}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-content mb-1">{title}</p>
                  <p className="text-xs text-content-muted leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Announcements ─────────────────────────────── */}
      <section className="bg-surface-alt border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-content">Latest Announcements</h2>
              <p className="text-sm text-content-muted mt-0.5">Stay updated from the {brand.officeShort} office</p>
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

      {/* ── Get in Touch ─────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-20 bg-surface-alt">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className={`grid grid-cols-1 ${hasMap ? 'lg:grid-cols-2' : ''} gap-12`}>

            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-primary mb-3">Get in Touch</h2>
              <p className="text-sm text-content-muted mb-8 leading-relaxed">
                Have questions about the application process or need assistance with your {brand.program}{' '}
                account? Our office is ready to help.
              </p>

              <div className="space-y-6">
                {CONTACT.map(({ Icon, label, lines }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0 text-primary">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-content">{label}</p>
                      {lines.map((l, i) => (
                        <p key={i} className="text-sm text-content-muted mt-0.5">{l}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border flex gap-3">
                {brand.contact.email && (
                  <a href={`mailto:${brand.contact.email}`} aria-label={`Email the ${brand.office}`}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-content-muted hover:text-primary hover:border-primary transition-colors">
                    <Mail size={16} />
                  </a>
                )}
                {brand.contact.phoneHref && brand.contact.phone && (
                  <a href={brand.contact.phoneHref} aria-label={`Call the ${brand.office}`}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-content-muted hover:text-primary hover:border-primary transition-colors">
                    <Phone size={16} />
                  </a>
                )}
                {brand.website && (
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" aria-label={`${brand.office} website`}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-content-muted hover:text-primary hover:border-primary transition-colors">
                    <Globe size={16} />
                  </a>
                )}
                {brand.facebook && (
                  <a href={brand.facebook} target="_blank" rel="noopener noreferrer" aria-label={`${brand.office} Facebook page`}
                    className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center text-content-muted hover:text-primary hover:border-primary transition-colors">
                    <FacebookIcon size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Map — only when the municipality provides one */}
            {hasMap && (
              <div className="bg-surface rounded-xl border border-border shadow-card p-2">
                <iframe
                  title={`Map of ${brand.municipality}`}
                  src={brand.mapEmbedUrl}
                  loading="lazy"
                  className="w-full h-[360px] rounded-lg border-0"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
