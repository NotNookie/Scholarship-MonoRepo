import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  CheckCircle2,
  CalendarCheck,
  Clock,
  Lock,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Banknote,
  GraduationCap,
  Megaphone,
} from 'lucide-react'

const QUALIFICATIONS = [
  {
    label: 'Residency',
    text: 'Must be a bonafide resident of the municipality for at least 3 years.',
  },
  {
    label: 'Good Moral Character',
    text: 'Must not have been convicted of any crime involving moral turpitude.',
  },
  {
    label: 'Voter Registration',
    text: 'Applicant or parents must be registered voters of the municipality.',
  },
  {
    label: 'No Other Scholarships',
    text: 'Must not be a recipient of any other major government scholarship.',
  },
]

const SCHOLARSHIPS = [
  {
    id: 1,
    name: "Mayor's Academic Excellence Award",
    category: 'Academic Merit',
    filter: 'Academic Excellence',
    status: 'open',
    eligibility: 'College students with a GWA of 1.50 or better, no failing grades.',
    benefit: '₱10,000 / semester',
  },
  {
    id: 2,
    name: 'Tulong Dunong Financial Assistance',
    category: 'Financial Need',
    filter: 'Financial Assistance',
    status: 'closing_soon',
    daysLeft: 5,
    eligibility: "Indigent college students; parents' combined income below poverty threshold.",
    benefit: '₱5,000 / semester',
  },
  {
    id: 3,
    name: 'Iskolar ng Bayan – TVET Grant',
    category: 'Skills Training',
    filter: 'TVET / Skills',
    status: 'open',
    eligibility: 'High school graduates or ALS passers enrolling in TESDA accredited courses.',
    benefit: 'Full Tuition + ₱2,000 Allowance',
  },
  {
    id: 4,
    name: 'Senior High School Subsidy',
    category: 'Senior High',
    filter: 'Senior High School',
    status: 'closed',
    eligibility: 'Incoming Grade 11 students enrolled in public high schools within the municipality.',
    benefit: '₱3,000 / year',
  },
]

const FILTERS = ['All Programs', 'Academic Excellence', 'Financial Assistance', 'TVET / Skills', 'Senior High School']

const SORT_OPTIONS = ['Deadline (Soonest)', 'Name (A-Z)', 'Grant Amount']

function StatusBadge({ status, daysLeft }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-tertiary-light text-tertiary-dark text-xs font-semibold px-2.5 py-1 rounded-md border border-tertiary/30">
        <CalendarCheck size={12} />
        Accepting Applications
      </span>
    )
  }
  if (status === 'closing_soon') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-secondary-light text-on-secondary text-xs font-semibold px-2.5 py-1 rounded-md border border-secondary/30">
        <Clock size={12} />
        Closes in {daysLeft} Days
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-surface-alt text-content-muted text-xs font-semibold px-2.5 py-1 rounded-md border border-border">
      <Lock size={12} />
      Closed
    </span>
  )
}

function ScholarshipCard({ scholarship }) {
  const { name, category, status, daysLeft, eligibility, benefit } = scholarship
  const isClosed = status === 'closed'

  return (
    <article
      className={`bg-surface border border-border rounded-xl p-6 shadow-card hover:shadow-modal transition-shadow flex flex-col h-full relative overflow-hidden ${isClosed ? 'opacity-75' : ''}`}
    >
      <div className="absolute top-0 right-0 w-14 h-14 bg-primary/5 rounded-bl-full pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <StatusBadge status={status} daysLeft={daysLeft} />
        <Bookmark size={16} className="text-border hover:text-primary transition-colors cursor-pointer" />
      </div>

      <h3 className={`text-base font-bold leading-snug mb-1 ${isClosed ? 'text-content' : 'text-primary'}`}>
        {name}
      </h3>
      <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-4">
        {category}
      </p>

      <div className="flex-1 flex flex-col gap-3 mb-5">
        <div className="flex items-start gap-2">
          <GraduationCap size={16} className="text-content-disabled shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-content-muted uppercase tracking-wide mb-0.5">Eligibility</p>
            <p className="text-xs text-content leading-snug line-clamp-2">{eligibility}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Banknote size={16} className="text-content-disabled shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-content-muted uppercase tracking-wide mb-0.5">Benefits</p>
            <p className={`text-sm font-bold ${isClosed ? 'text-content-muted' : 'text-tertiary-dark'}`}>
              {benefit}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        {isClosed ? (
          <button
            disabled
            className="w-full bg-surface-alt text-content-muted text-xs font-semibold py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-1"
          >
            Opens Next Year
          </button>
        ) : (
          <Link
            to="/register"
            className="w-full bg-surface text-primary border border-primary hover:bg-primary hover:text-on-primary text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            View Details <ChevronRight size={13} />
          </Link>
        )}
      </div>
    </article>
  )
}

export function ScholarshipsPage() {
  const [activeFilter, setActiveFilter] = useState('All Programs')
  const [sort, setSort] = useState('Deadline (Soonest)')
  const [search, setSearch] = useState('')

  const filtered = SCHOLARSHIPS.filter((s) => {
    const matchFilter = activeFilter === 'All Programs' || s.filter === activeFilter
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      {/* ── Search hero ──────────────────────────────────────── */}
      <section className="bg-primary-light border-b border-border py-12 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Discover Available Scholarships
          </h1>
          <p className="text-sm text-content-muted mb-8 leading-relaxed">
            Browse and apply for financial assistance programs offered by the Municipality.
            Find the right program to support your educational journey.
          </p>

          <div className="relative max-w-2xl mx-auto flex items-center bg-surface border border-border rounded-xl shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search size={16} className="absolute left-4 text-content-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or keyword…"
              className="flex-1 bg-transparent border-none text-sm py-3.5 pl-11 pr-4 focus:outline-none text-content placeholder:text-content-muted"
            />
            <button className="bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg m-1 hover:bg-primary-dark transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Layout ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 order-2 lg:order-1 lg:sticky lg:top-20 lg:self-start">

          {/* How to Qualify */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-primary" />
              </div>
              <h2 className="text-base font-bold text-content">How to Qualify</h2>
            </div>
            <p className="text-xs text-content-muted mb-5 leading-relaxed">
              General eligibility requirements for most municipal scholarship programs.
            </p>
            <ul className="space-y-4">
              {QUALIFICATIONS.map(({ label, text }) => (
                <li key={label} className="flex items-start gap-3">
                  <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-content">{label}</p>
                    <p className="text-xs text-content-muted mt-0.5 leading-snug">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-5 border-t border-border">
              <Link
                to="/requirements"
                className="flex items-center justify-between text-sm text-primary hover:underline font-medium"
              >
                View Full Requirements <ChevronRight size={15} />
              </Link>
            </div>
          </div>

          {/* Application Period CTA */}
          <div className="hidden lg:block relative bg-primary rounded-xl p-6 text-on-primary overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark opacity-80" />
            <div className="relative z-10">
              <Megaphone size={32} className="mb-3" />
              <h3 className="text-base font-bold mb-2">Application Period Open</h3>
              <p className="text-xs text-on-primary/70 mb-4 leading-relaxed">
                Submit your requirements for the upcoming academic semester before the deadline.
              </p>
              <span className="inline-block bg-secondary text-on-secondary text-xs font-bold px-3 py-1 rounded-full">
                Deadline: Aug 15, 2026
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 order-1 lg:order-2">

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  activeFilter === f
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-content-muted border-border hover:border-primary hover:text-primary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Count + sort */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-content-muted">
              Showing <span className="font-semibold text-content">{filtered.length}</span> available programs
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-content-muted">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs border border-border rounded-lg px-3 py-1.5 bg-surface text-content focus:outline-none focus:border-primary"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Search size={32} className="text-content-disabled" />
              <p className="text-sm text-content-muted">No scholarships match your search.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              disabled
              className="p-2 border border-border rounded-lg text-content-muted disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-on-primary text-xs font-semibold">
              1
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-content-muted text-xs hover:bg-surface-alt">
              2
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-content-muted text-xs hover:bg-surface-alt">
              3
            </button>
            <span className="text-content-muted text-sm">…</span>
            <button className="p-2 border border-border rounded-lg text-content-muted hover:bg-surface-alt">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
