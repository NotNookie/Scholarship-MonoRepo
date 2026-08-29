import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ChevronRight } from 'lucide-react'
import { usePlatformStore } from '../../store/platformStore'
import { StatusTag, Sigil } from '../../components/platform/PlatformBits'
import { OnboardDrawer } from '../../components/platform/OnboardDrawer'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'suspended', label: 'Suspended' },
]

export function PlatformMunicipalitiesPage() {
  const navigate = useNavigate()
  const municipalities = usePlatformStore((s) => s.municipalities)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [onboardOpen, setOnboardOpen] = useState(false)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return municipalities.filter((m) => {
      if (filter !== 'all' && m.status !== filter) return false
      if (q && !`${m.name} ${m.subdomain}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [municipalities, filter, query])

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Municipalities</h1>
          <p className="pf-note">Every municipality (tenant) chartered on the platform.</p>
        </div>
        <button className="pf-btn" type="button" onClick={() => setOnboardOpen(true)}>
          <Plus size={18} strokeWidth={2.4} />
          Onboard municipality
        </button>
      </div>
      <hr className="pf-rule" />

      <div className="pf-toolbar">
        <div className="pf-search">
          <Search size={17} strokeWidth={2} />
          <input
            type="search"
            placeholder="Search name or subdomain…"
            aria-label="Search municipalities"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="pf-seg" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="pf-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'municipality' : 'municipalities'}
        </span>
      </div>

      <div className="pf-tscroll">
        <table className="pf-reg">
          <thead>
            <tr>
              <th>Municipality</th>
              <th>Subdomain</th>
              <th>Status</th>
              <th className="num">Scholars</th>
              <th className="num">Staff</th>
              <th>Onboarded</th>
              <th><span className="pf-sr">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr className="norows">
                <td colSpan={7}>
                  {filter !== 'all' || query.trim()
                    ? 'No municipalities match this search.'
                    : 'No municipalities onboarded yet — use “Onboard municipality” to charter the first one.'}
                </td>
              </tr>
            ) : (
              shown.map((m) => (
                <tr key={m.id} onClick={() => navigate(`/platform/municipalities/${m.id}`)}>
                  <td>
                    <div className="pf-ten">
                      <Sigil name={m.name} />
                      <div>
                        <div className="pf-ten-name">
                          {m.name}
                          {m.main && <span className="pf-main-tag">MAIN</span>}
                        </div>
                        <div className="pf-ten-prov">{m.province}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="pf-mono">{m.subdomain}.iskolar.ph</span></td>
                  <td><StatusTag status={m.status} /></td>
                  <td className="num tnum">{m.scholars.toLocaleString('en-US')}</td>
                  <td className="num tnum" style={{ color: 'var(--pf-ink-2)' }}>{m.staff}</td>
                  <td style={{ color: 'var(--pf-ink-2)' }}>{m.onboarded}</td>
                  <td className="num"><ChevronRight className="pf-chev" /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <OnboardDrawer open={onboardOpen} onClose={() => setOnboardOpen(false)} />
    </>
  )
}
