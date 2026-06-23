# Iskolar Link — Design System

Brand identity: **Corporate Modern** — Trust · Transparency · Efficiency.
The platform serves municipal government offices and student applicants.

---

## Color Palette

### Primary — Municipal Blue
| Token | Hex | Usage |
|---|---|---|
| `primary-dark` | `#002576` | Headers, pressed states |
| `primary` | `#0038a8` | Buttons, active nav, links |
| `primary-light` | `#e8effe` | Tinted backgrounds, chips |
| `on-primary` | `#ffffff` | Text on primary surfaces |

### Secondary — Honor Gold
| Token | Hex | Usage |
|---|---|---|
| `secondary-dark` | `#735c00` | Text on gold surfaces |
| `secondary` | `#fecc00` | Register CTA, highlights |
| `secondary-light` | `#fff9e0` | Tinted backgrounds |
| `on-secondary` | `#735c00` | Text on secondary surfaces |

### Tertiary — Progress Green
| Token | Hex | Usage |
|---|---|---|
| `tertiary-dark` | `#004f1e` | Approved/success dark |
| `tertiary` | `#61c574` | Approved badge, success state |
| `tertiary-light` | `#eaf7ed` | Success background tint |

### Status Colors
| Token | Hex | Usage |
|---|---|---|
| `success` | `#61c574` | Approved, complete |
| `success-dark` | `#004f1e` | — |
| `success-light` | `#eaf7ed` | — |
| `warning` | `#f59e0b` | Pending, under review |
| `warning-light` | `#fffbeb` | — |
| `danger` | `#ef4444` | Rejected, errors |
| `danger-light` | `#fef2f2` | — |
| `info` | `#3b82f6` | Informational |
| `info-light` | `#eff6ff` | — |

### Surface & Neutral
| Token | Hex | Usage |
|---|---|---|
| `surface` | `#ffffff` | Cards, modals |
| `surface-alt` | `#f8f9fc` | Page background |
| `border` | `#e2e8f0` | Dividers, input borders |
| `border-muted` | `#f1f5f9` | Subtle dividers |

### Content (Text)
| Token | Hex | Usage |
|---|---|---|
| `content` | `#0f172a` | Primary body text |
| `content-muted` | `#64748b` | Secondary text, captions |
| `content-disabled` | `#94a3b8` | Placeholder, disabled |

---

## Typography

Font family: **Inter** (Google Fonts) — used exclusively throughout the UI.

| Scale | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | 32px | 700 | 1.2 | Hero headlines |
| Heading 1 | 24px | 600 | 1.3 | Page titles |
| Heading 2 | 20px | 600 | 1.35 | Section headings |
| Heading 3 | 16px | 600 | 1.4 | Card titles |
| Body | 14px | 400 | 1.6 | Default body text |
| Small | 12px | 400 | 1.5 | Captions, labels |
| Micro | 11px | 500 | 1.4 | Badges, tags |

---

## Spacing

Base unit: **8px**. All padding and margin values are multiples of 8px.

| Step | Value | Tailwind |
|---|---|---|
| 1 | 8px | `p-2` |
| 2 | 16px | `p-4` |
| 3 | 24px | `p-6` |
| 4 | 32px | `p-8` |
| 5 | 40px | `p-10` |
| 6 | 48px | `p-12` |

---

## Elevation (Shadows)

| Name | Value | Usage |
|---|---|---|
| `shadow-card` | `0px 4px 12px rgba(0, 56, 168, 0.05)` | Cards, dropdowns |
| `shadow-modal` | `0px 12px 32px rgba(0, 0, 0, 0.10)` | Modals, drawers |
| `shadow-dropdown` | `0px 4px 16px rgba(0, 0, 0, 0.08)` | Select menus, popovers |

---

## Border Radius

| Name | Value | Usage |
|---|---|---|
| `rounded` (sm) | `4px` | Buttons, inputs, badges |
| `rounded-md` | `8px` | Cards, panels |
| `rounded-lg` | `12px` | Modals, large cards |
| `rounded-full` | `9999px` | Status pills, avatars |

---

## Component Patterns

### Status Badges
Always pill-shaped (`rounded-full`). Use tonal coloring (light background + dark text in the same hue).

| Status | Background | Text |
|---|---|---|
| Pending | `warning-light` | `warning` |
| Under Review | `info-light` | `info` |
| Approved | `success-light` | `success-dark` |
| Rejected | `danger-light` | `danger` |
| Incomplete | `warning-light` | `warning` |
| Re-upload Required | `danger-light` | `danger` |

### Announcement Category Badges
| Category | Color |
|---|---|
| Examination | Amber |
| Orientation | Blue |
| Payout | Green |
| Requirements | Slate |

### Grid System
- Mobile (< 768px): 4-column grid, 16px gutters
- Tablet (768–1280px): 8-column grid, 24px gutters
- Desktop (≥ 1280px): 12-column grid, 32px gutters

---

## Interactive States

All interactive elements must show:
- **Default**: base styles
- **Hover**: subtle background shift (opacity or tint)
- **Focus-visible**: `ring-2 ring-primary ring-offset-2`
- **Active**: darker shade
- **Disabled**: `opacity-50 cursor-not-allowed`

---

## Accessibility Rules

- All form inputs must have visible labels (never placeholder-only)
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- All interactive elements must be keyboard-navigable
- Use `aria-*` attributes for dynamic state (loading, expanded, selected)
- Error messages must be associated with inputs via `aria-describedby`
