// Tenant registry — the source of truth for "which municipality am I?" while
// there's no backend yet. Each tenant is reached at <subdomain>.iskolar.ph and
// carries its own branding, contact info, and colour palette. Later this list
// is replaced by an API lookup; components read it through the TenantContext,
// so only this data shape matters.
// NOTE: Pagsanjan is illustrative sample data (invented branding) so we can
// demonstrate the same app rendering as a different municipality.

export const TENANTS = [
  {
    id: 'sta-cruz',
    subdomain: 'stacruz',
    municipality: 'Sta. Cruz, Laguna',
    office: 'Municipal Youth Development Office',
    officeShort: 'LYDO',                    // short label for inline mentions
    program: 'Iskolar ng Bayan',           // the tenant's program brand (wordmark)
    tagline: 'Empowering Youth Through Education',
    blurb:
      'The official Digital Scholarship Management Platform for the Iskolar ng Bayan program ' +
      'of the Municipality of Sta. Cruz, Laguna. Empowering the youth of our municipality through accessible education.',
    contact: {
      addressLines: ['Local Youth Development Office (LYDO)', '2nd Floor, Municipal Hall Building,', 'Sta. Cruz, Laguna 4009'],
      phone: '(049) 123-4567',
      phoneHref: 'tel:+63491234567',
      email: 'lydo@stacruzlaguna.gov.ph',
    },
    // Optional per-municipality content. null = the municipality doesn't have it.
    walkthroughVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    // Matches the app defaults (globals.css @theme) — applying it is a no-op.
    theme: {
      '--color-primary-dark': '#002576',
      '--color-primary': '#0038a8',
      '--color-primary-light': '#e8effe',
      '--color-on-primary': '#ffffff',
      '--color-secondary-dark': '#735c00',
      '--color-secondary': '#fecc00',
      '--color-secondary-light': '#fff9e0',
      '--color-on-secondary': '#735c00',
    },
  },
  {
    id: 'pagsanjan',
    subdomain: 'pagsanjan',
    municipality: 'Pagsanjan, Laguna',
    office: 'Municipal Scholarship Office',
    officeShort: 'MSO',
    program: 'Pag-asa Scholars Program',    // invented placeholder brand
    tagline: 'Investing in Every Pagsanjeño Scholar',
    blurb:
      'The official scholarship portal of the Municipality of Pagsanjan, Laguna. ' +
      'Supporting local students through an accessible, transparent application process.',
    contact: {
      addressLines: ['Municipal Scholarship Office', 'Pagsanjan Municipal Hall', 'Pagsanjan, Laguna 4008'],
      phone: '(049) 000-0000',
      phoneHref: 'tel:+63490000000',
      email: 'scholarship@pagsanjan.gov.ph',
    },
    walkthroughVideoUrl: null, // Pagsanjan has no walkthrough video
    // A visibly different palette (teal + warm orange) to prove the reskin.
    theme: {
      '--color-primary-dark': '#0a5654',
      '--color-primary': '#0e7c7b',
      '--color-primary-light': '#e3f4f3',
      '--color-on-primary': '#ffffff',
      '--color-secondary-dark': '#7a3d16',
      '--color-secondary': '#f4914e',
      '--color-secondary-light': '#fdeee1',
      '--color-on-secondary': '#7a3d16',
    },
  },
]

// Until there's a decision on what the bare host (no subdomain) should show,
// it falls back to the primary tenant so the app renders normally in dev.
export const DEFAULT_TENANT = TENANTS[0] // Sta. Cruz

// Labels the browser treats as "no tenant" (the platform root, not a municipality).
const ROOT_LABELS = new Set(['', 'www', 'iskolar', 'localhost', '127'])

/**
 * Work out the tenant subdomain from the current host.
 * - stacruz.iskolar.ph   -> "stacruz"
 * - stacruz.localhost:5178 -> "stacruz"   (Chrome/Edge resolve *.localhost locally)
 * - iskolar.ph / localhost -> null        (bare root)
 * - ?tenant=stacruz        -> "stacruz"   (dev fallback for hosts without a subdomain)
 */
export function resolveSubdomain(hostname = '', search = '') {
  const forced = new URLSearchParams(search).get('tenant')
  if (forced) return forced.toLowerCase()

  const host = hostname.split(':')[0]           // strip any :port
  const label = host.split('.')[0].toLowerCase() // first label

  // A single-label host (localhost, iskolar) or a known root label => no tenant.
  if (host.split('.').length < 2) return null
  if (ROOT_LABELS.has(label)) return null
  return label
}

export function findTenant(subdomain) {
  if (!subdomain) return null
  return TENANTS.find((t) => t.subdomain === subdomain) ?? null
}
