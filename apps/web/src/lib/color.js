// Small dependency-free colour helpers for the custom-theme picker.
// Everything works on #rrggbb hex (what <input type="color"> speaks).

export function isHex(v) {
  return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)
}

export function hexToRgb(hex) {
  const h = (hex || '').replace('#', '')
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
}

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))
export function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')
}

// Linear blend of two hex colours (t = 0 → a, 1 → b).
export function mix(a, b, t) {
  const c1 = hexToRgb(a)
  const c2 = hexToRgb(b)
  return rgbToHex({
    r: c1.r + (c2.r - c1.r) * t,
    g: c1.g + (c2.g - c1.g) * t,
    b: c1.b + (c2.b - c1.b) * t,
  })
}

// WCAG relative luminance (0 = black, 1 = white).
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  const lin = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

// Pick readable text (near-black or white) for a given background.
export function contrastText(hex) {
  return luminance(hex) > 0.42 ? '#0f172a' : '#ffffff'
}

// rgba() string at a given alpha — used for the translucent "-muted" token.
export function hexToRgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
