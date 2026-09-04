import { useState } from 'react'
import {
  Palette, ChevronDown, Pipette, RotateCcw, Bell, Search, ShieldAlert,
  CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight, Lock,
} from 'lucide-react'
import { useUiTheme } from '../../store/uiThemeStore'
import { DEFAULT_TOKENS, ADVANCED_TOKEN_GROUPS, buildThemeTokens, THEME_PRESET_LIST } from '../../tenant/themePresets'
import { isHex } from '../../lib/color'

const EMPTY_CUSTOM = { primary: DEFAULT_TOKENS['--color-primary'], secondary: DEFAULT_TOKENS['--color-secondary'], overrides: {} }

// A colour swatch (opens the OS colour wheel) paired with a hex field.
function ColorField({ label, value, onChange }) {
  const hex = isHex(value) ? value : '#000000'
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative shrink-0 group" title="Click to open the colour picker">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} colour — click to open the colour picker`}
          className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent p-0.5 transition-all group-hover:border-primary group-hover:ring-2 group-hover:ring-primary/25"
        />
        <span className="pointer-events-none absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-surface border border-border shadow-sm flex items-center justify-center">
          <Pipette size={10} className="text-content-muted group-hover:text-primary transition-colors" />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-content-muted leading-tight">{label}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} hex`}
          className="w-full text-xs font-mono px-2 py-1 mt-0.5 rounded border border-border bg-surface focus:outline-none focus:border-primary uppercase"
        />
      </div>
    </div>
  )
}

// ── Live preview gallery ──────────────────────────────────────
function PreviewBlock({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-content-muted uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  )
}

function Pill({ cls, Icon, children }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {Icon && <Icon size={12} />} {children}
    </span>
  )
}

function ThemePreview({ portalName, tagline }) {
  return (
    <section className="rounded-xl border-2 border-dashed border-border bg-surface-alt shadow-card overflow-hidden">
      {/* Browser chrome — signals this is a mock, not the real UI */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-surface border-b border-border">
        <span className="flex gap-1.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-danger/60" />
          <span className="w-3 h-3 rounded-full bg-secondary/70" />
          <span className="w-3 h-3 rounded-full bg-tertiary/60" />
        </span>
        <span className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-content-muted bg-surface-alt rounded-md py-1 px-3 truncate">
          <Lock size={11} /> iskolar.ph
        </span>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-primary bg-primary-light px-2 py-0.5 rounded">Preview</span>
      </div>

      <p className="px-4 pt-3 -mb-1 text-xs text-content-muted">A mock of the applicant-facing app — edit a colour and watch every element change. It doesn&rsquo;t affect your data.</p>

      {/* The mini app, inset like a screen */}
      <div className="p-3">
        <div className="rounded-lg border border-border bg-surface overflow-hidden shadow-sm">

      {/* Mini app chrome */}
      <div className="bg-primary text-on-primary px-5 py-3 flex items-center justify-between">
        <span className="text-sm font-bold">{portalName || 'Iskolar ng Bayan'}</span>
        <span className="flex items-center gap-3">
          <Bell size={16} />
          <span className="w-7 h-7 rounded-full bg-white/15 text-on-primary text-xs font-bold flex items-center justify-center">MS</span>
        </span>
      </div>

      <div className="p-5 space-y-6">
        {/* Buttons */}
        <PreviewBlock title="Buttons">
          <div className="flex flex-wrap items-center gap-2">
            <button className="bg-primary text-on-primary text-sm font-semibold px-4 py-2 rounded-lg">Primary</button>
            <button className="bg-secondary text-on-secondary text-sm font-semibold px-4 py-2 rounded-lg">Secondary</button>
            <button className="border border-primary text-primary text-sm font-semibold px-4 py-2 rounded-lg">Outline</button>
            <button className="bg-danger text-white text-sm font-semibold px-4 py-2 rounded-lg">Danger</button>
          </div>
        </PreviewBlock>

        {/* Status pills */}
        <PreviewBlock title="Status">
          <div className="flex flex-wrap items-center gap-2">
            <Pill cls="bg-tertiary-light text-tertiary-dark" Icon={CheckCircle2}>Approved</Pill>
            <Pill cls="bg-secondary-light text-secondary-dark" Icon={AlertTriangle}>Pending</Pill>
            <Pill cls="bg-danger-light text-danger" Icon={XCircle}>Rejected</Pill>
            <Pill cls="bg-primary-light text-primary" Icon={Info}>Under Review</Pill>
          </div>
        </PreviewBlock>

        {/* Form field */}
        <PreviewBlock title="Form field">
          <label className="text-sm font-medium text-content">Email address</label>
          <div className="relative mt-1.5">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
            <input readOnly value="scholar@example.com" className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border-2 border-primary bg-surface outline-none" />
          </div>
        </PreviewBlock>

        {/* Alert */}
        <PreviewBlock title="Banner">
          <div className="flex items-start gap-3 bg-primary-light border border-primary/20 rounded-lg p-3">
            <ShieldAlert size={18} className="text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-content leading-relaxed">
              <span className="font-semibold">Applications now open.</span> The theme drives every accent, badge and button across the whole app.
            </p>
          </div>
        </PreviewBlock>

        {/* Stat tiles */}
        <PreviewBlock title="Stat cards">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
              <div className="p-3">
                <p className="text-xs text-content-muted">Pending Review</p>
                <p className="text-2xl font-bold text-content mt-1">17</p>
              </div>
              <div className="h-1 bg-secondary" />
            </div>
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
              <div className="p-3">
                <p className="text-xs text-content-muted">Approved</p>
                <p className="text-2xl font-bold text-content mt-1">14</p>
              </div>
              <div className="h-1 bg-tertiary" />
            </div>
          </div>
        </PreviewBlock>

        {/* Card + link */}
        <PreviewBlock title="Card">
          <div className="bg-surface border border-border rounded-xl shadow-card p-4">
            <p className="text-sm font-bold text-content">{portalName || 'Iskolar ng Bayan'}</p>
            <p className="text-xs text-content-muted mt-1 leading-relaxed">{tagline || 'Empowering youth through education.'}</p>
            <a className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-3 cursor-default">
              View details <ArrowRight size={14} />
            </a>
          </div>
        </PreviewBlock>
      </div>
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────
export function MaintenanceThemePage() {
  const activePreset = useUiTheme((s) => s.preset)
  const setPreset = useUiTheme((s) => s.setPreset)
  const storedCustom = useUiTheme((s) => s.customConfig)
  const setCustomStore = useUiTheme((s) => s.setCustom)

  const [custom, setCustomLocal] = useState(() => storedCustom ?? EMPTY_CUSTOM)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const isCustom = activePreset === 'custom'

  function applyCustom(next) {
    setCustomLocal(next)
    setCustomStore(next)
  }
  const setBase = (key) => (val) => applyCustom({ ...custom, [key]: val })
  const setOverride = (token) => (val) => {
    const overrides = { ...(custom.overrides || {}) }
    overrides[token] = val
    applyCustom({ ...custom, overrides })
  }
  const derived = buildThemeTokens({ primary: custom.primary, secondary: custom.secondary })
  const tokenValue = (token) => custom.overrides?.[token] ?? derived[token] ?? DEFAULT_TOKENS[token]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-content">Appearance</h1>
        <p className="text-sm text-content-muted mt-1">
          Choose a preset or set your own colours. Changes apply live across the whole interface and are remembered on this device.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Controls */}
        <section className="bg-surface border border-border rounded-xl shadow-card p-6">
          <h2 className="text-base font-bold text-content inline-flex items-center gap-2 mb-4">
            <Palette size={17} className="text-primary" /> Theme
          </h2>
          <div className="flex flex-col gap-2.5">
            {THEME_PRESET_LIST.map((t) => {
              const active = activePreset === t.value
              return (
                <button
                  key={t.value}
                  onClick={() => setPreset(t.value)}
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg border transition-colors text-left ${active ? 'border-primary bg-primary-light/40 ring-1 ring-primary/20' : 'border-border hover:border-primary'}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-primary' : 'border-border'}`}>
                      {active && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </span>
                    <span className="text-sm font-medium text-content truncate">{t.label}</span>
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    {t.swatch.map((hex, i) => (
                      <span key={i} className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: hex }} />
                    ))}
                  </span>
                </button>
              )
            })}

            <button
              onClick={() => setCustomStore(custom)}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors text-left ${isCustom ? 'border-primary bg-primary-light/40' : 'border-border hover:border-primary'}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isCustom ? 'border-primary' : 'border-border'}`}>
                  {isCustom && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                <span className="text-sm font-medium text-content">Custom colours</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: custom.primary }} />
                <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: custom.secondary }} />
                <Pipette size={14} className="text-content-muted" />
              </span>
            </button>
          </div>

          {isCustom && (
            <div className="mt-4 pt-4 border-t border-border flex flex-col gap-4">
              <p className="text-xs text-content-muted -mb-1 inline-flex items-center gap-1.5">
                <Pipette size={12} className="text-primary" /> Click a swatch to open the colour wheel, or type a hex code.
              </p>
              <ColorField label="Primary (brand)" value={custom.primary} onChange={setBase('primary')} />
              <ColorField label="Secondary (accent)" value={custom.secondary} onChange={setBase('secondary')} />

              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary self-start"
                aria-expanded={advancedOpen}
              >
                <ChevronDown size={14} className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                Advanced — full palette &amp; shades
              </button>

              {advancedOpen && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-content-muted">
                    Shades auto-derive from your primary/secondary. Override any of them here — surfaces, text and status colours too.
                  </p>
                  {ADVANCED_TOKEN_GROUPS.map((group) => (
                    <div key={group.label} className="flex flex-col gap-2.5">
                      <p className="text-xs font-semibold text-content-muted uppercase tracking-wide">{group.label}</p>
                      {group.tokens.map((t) => (
                        <ColorField key={t.key} label={t.label} value={tokenValue(t.key)} onChange={setOverride(t.key)} />
                      ))}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => applyCustom({ ...custom, overrides: {} })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary self-start"
                  >
                    <RotateCcw size={13} /> Reset overrides to auto
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => applyCustom(EMPTY_CUSTOM)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-danger self-start pt-1"
              >
                <RotateCcw size={13} /> Reset custom colours to defaults
              </button>
            </div>
          )}
        </section>

        {/* Live preview (sticky on desktop) */}
        <div className="lg:sticky lg:top-6">
          <ThemePreview portalName="Iskolar ng Bayan" tagline="Empowering youth through education." />
        </div>
      </div>
    </div>
  )
}
