# Cross-browser & mobile QA checklist

Chromium engines (Chrome / Edge) are verified in-repo via the headless
screenshot harness. Firefox (Gecko) and Safari (WebKit) can't be automated in
the current dev environment, so run this short manual pass on a real Firefox and
a real Safari (macOS / iOS) before a release.

## How to run
1. `npm run dev` in `apps/web`, open the printed URL.
2. For tenant/theme checks, append `?tenant=stacruz` or `?tenant=pagsanjan`.
3. Use each browser's responsive/device mode for the mobile widths (≤414px).

## Per-browser checklist (Firefox + Safari)

### Layout & responsiveness
- [ ] Public landing, Scholarships, Requirements, Announcements — no horizontal
      overflow at 375 / 414 / 768 / 1280px; text wraps, nothing clipped.
- [ ] Student dashboard, application form (all steps), My Scholarship — sidebar
      collapses on mobile; the stepper and cards stay within the viewport.
- [ ] Admin portal + platform console — tables scroll inside their own container
      (`overflow-x`), the page body never scrolls sideways.

### Theming (CSS custom properties)
- [ ] Tenant palette applies (Sta. Cruz blue vs Pagsanjan teal).
- [ ] Live theme switch: Maintenance → UI Theme Preset → Civic Green reskins the
      app instantly and survives a reload (localStorage).

### Forms & inputs
- [ ] `type="date"` and `type="number"` inputs behave (Safari date UI differs —
      confirm it's usable).
- [ ] File pickers open; the 5MB/type guard + blur hint fire on upload.
- [ ] Draft autosave (application + renewal) persists across a reload.

### Modals & keyboard (a11y)
- [ ] Every modal/lightbox/drawer: **Escape** closes it.
- [ ] **Tab** stays trapped inside the open dialog; focus returns to the trigger
      on close.
- [ ] The backdrop click closes; the dialog is announced (role="dialog").

### Motion & misc
- [ ] Drawer slide-in, stepper progress, and `auth-slide` transitions render
      without jank.
- [ ] `prefers-reduced-motion` (Safari/Firefox setting) doesn't break layout.
- [ ] No console errors on load of each major route.

## Known engine notes
- Safari: `<input type="date">` shows a native control rather than the
  Chromium calendar — expected, still functional.
- Safari < 16: check `:has()`-based styles if any are added later (none today).
- Firefox: scrollbar width differs; confirm no content is hidden behind it.
