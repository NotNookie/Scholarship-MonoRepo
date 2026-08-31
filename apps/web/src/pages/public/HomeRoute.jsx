import { Link } from 'react-router-dom'
import { GraduationCap, Building2, ArrowRight } from 'lucide-react'
import { useTenant } from '../../tenant/TenantContext'
import { PLATFORM_BRAND } from '../../tenant/tenants'
import { LandingPage } from './LandingPage'

// The bare platform host (iskolar.ph) — the front door, not a municipality's
// site and not a public directory. Municipalities hand out their own
// <town>.iskolar.ph address.
function RootLandingPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
          <GraduationCap size={30} className="text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-content">{PLATFORM_BRAND.program}</h1>
          <p className="text-base text-content-muted mt-2 leading-relaxed">{PLATFORM_BRAND.tagline}</p>
        </div>

        <div className="w-full bg-surface border border-border rounded-xl shadow-card p-6 text-left flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-content">Looking for your municipality's scholarship portal?</p>
            <p className="text-sm text-content-muted mt-1 leading-relaxed">
              Each municipality has its own address — for example{' '}
              <span className="font-mono text-content">yourtown.iskolar.ph</span>. Your Local Youth
              Development Office shares the link with eligible residents.
            </p>
          </div>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Staff or platform operator? Sign in <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}

// A subdomain that doesn't match any municipality.
function TenantNotFound({ subdomain }) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center">
          <Building2 size={26} className="text-content-disabled" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Municipality not found</h1>
          <p className="text-sm text-content-muted mt-2 leading-relaxed">
            {subdomain ? (
              <>There's no scholarship portal at <span className="font-mono text-content">{subdomain}.iskolar.ph</span>. </>
            ) : null}
            Please check the address your municipality gave you.
          </p>
        </div>
      </div>
    </div>
  )
}

// The `/` route: pick the right home for the current host.
export function HomeRoute() {
  const { status, subdomain } = useTenant()
  if (status === 'root') return <RootLandingPage />
  if (status === 'notfound') return <TenantNotFound subdomain={subdomain} />
  return <LandingPage />
}
