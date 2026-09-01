# Iskolar — Whole-System Build Checklist

Everything left to take Iskolar from a working frontend to a shippable system.

**Where things stand:** the frontend is substantially built (public site, student portal, admin/LYDO portal, operator console), but it runs on mock/sample data and API calls with no server behind them. **The backend does not exist yet** — that's the bulk of the work below. A re-audit also found several **public-page controls that are still placeholders** (dead buttons, no detail views) — see §PUB.

**Status tags** (the checkbox is for tracking your own completion):
- `[In app]` — frontend done / working
- `[Partial]` — some done, more needed
- `[To build]` — not started
- `[Decision]` — waiting on a decision or dependency

> ✅ **Multi-tenant is APPROVED (adviser).** Decisions locked: **subdomain** per tenant (`stacruz.iskolar.ph`), the bare root shows a platform landing (no public directory), and Super Admin gets **full impersonation** into tenants. Backend stack + data-isolation model are deferred (front-end first). The multi-tenant **frontend foundation is built** — see §MT.

---

## A. Decisions to lock first
- [x] `[Decision]` ✅ Scope — **multi-tenant, adviser-approved.**
- [x] `[Decision]` ✅ URL scheme — **subdomain** (`stacruz.iskolar.ph`); bare root = platform landing, no public directory.
- [x] `[Decision]` ✅ Operator access into tenants — **full impersonation.**
- [ ] `[To build]` Decide anti-fraud / duplicate-account approach *(parked for group meeting; leaning verified-mobile + staff review + duplicate flagging; no LRN; facial rec rescopable)*
- [ ] `[To build]` AI writer — choose model/provider and who pays (platform vs. municipality)
- [ ] `[To build]` Pick evaluation method — ISO 25010 vs. acceptance testing *(needed for objectives + defense)*
- [ ] `[Decision]` Backend stack + data-isolation model *(deferred — front-end first; shared DB + tenant_id recommended when you get there)*

## MT. Multi-tenant frontend — *foundation built (2026-08-30), on sample data*
- [x] `[In app]` Tenant resolution — subdomain → tenant via `TenantProvider` / `useTenant()`; `?tenant=` dev fallback; `*.localhost` works in dev
- [x] `[In app]` Tenant-driven branding — name/tagline/office/contact + per-tenant colour palette (overrides `@theme` vars); wired into public chrome, auth screens, and the landing
- [ ] `[Decision]` Bare-host (no subdomain) behavior — currently falls back to the default tenant; the real root page (platform landing/gateway) is a later, deliberate task, not built yet
- [x] `[In app]` **Impersonation (consent-gated)** — the operator can enter a municipality's `/admin` **only when that municipality granted access**. The LYDO Head files a Request Support (`/admin/support`) with a consent checkbox; it lands in the platform Support inbox, where a granted request shows "Enter tenant". Full Head access + tenant reskin + persistent "Impersonating — Exit" banner. The Head sees a persistent "support access is active" banner and can **Revoke** anytime, which resolves the request and **kicks the operator out**. Unilateral entry is removed (disabled without a grant). Files: `store/impersonationStore.js`, `pages/admin/RequestSupportPage.jsx`, `platformStore` support tickets + `tenantHasActiveAccess`, `RequireAuth`.
- [x] `[In app]` Deeper pages now tenant-branded via `useBrand()` — admin portal header ("{office} Management Portal"), student dashboard/announcements/settings/docs/renewal/appeal/scholarship, public forms/announcements, report PDFs. Added a short `officeShort` label per tenant for inline mentions.
- [ ] `[To build]` Improve the admin-side **Request Support** page *(polish/UX — e.g. categories, attachments, request history/threading, clearer access-status, edit/cancel a request)*
- [ ] `[To build]` Swap the sample tenant registry (`tenant/tenants.js`) for the real API once the backend exists

## PUB. Public site — *re-audited; several are frontend-only quick wins*

Dead controls / affordances:
- [x] `[In app]` Requirements downloads — now unified with the `/forms` source (same data); each Download hits the real file when uploaded, honest "Not yet available" until then
- [x] `[In app]` Requirements — "Play" opens a walkthrough-video lightbox; "Read Full Manual" scrolls to the FAQ. **The video is now per-municipality** — driven by tenant config (Pagsanjan has none → the player is hidden entirely) with an on/off + URL toggle in Maintenance → Public Content.
- [x] `[In app]` Scholarship cards — bookmark now saves to localStorage (fills when saved); "View Details" opens a real detail page (`/scholarships/:id`)
- [x] `[In app]` Announcements — rows now open a real detail page (`/announcements/:id`)
- [x] `[In app]` Landing — real OpenStreetMap embed (no API key), **per-municipality**: shown when the tenant sets `mapEmbedUrl`, else the contact column goes full-width. Website / Facebook social links render only when set; empty contact rows (address/phone/email) are hidden. All controlled from Maintenance → Public Content.

Hardcoded content that should be data/config-driven *(needs §H / §B)*:
- [x] `[In app]` Scholarships page — programs, "How to Qualify", and the **deadline** now read from tenant config (`brand.programs`/`qualifications`/`applicationDeadline`) with a shared fallback; Pagsanjan shows a different deadline (Sep 30) to prove it. Deadline is editable in Maintenance → Application &amp; Lifecycle; blank hides the banner.
- [x] `[In app]` Requirements page — forms already unified with `/forms`; **guide steps and FAQ** now read from tenant config (`brand.guideSteps`/`faqs`) with a shared fallback
- [x] `[In app]` Landing — name, tagline, office, and contact are now **tenant-driven** (via `useBrand()`); only the 5 "how it works" steps remain generic (fine — they're the same everywhere)

Structure / redundancy:
- [x] `[In app]` Consolidated the two "Forms" surfaces — both Requirements and `/forms` now read one shared source (`data/forms.js` + the `/forms` API)

Already solid (no action): the `/forms` page, `/announcements` (search, load-more, empty states, markdown), Scholarships sort/search, the FAQ accordion.

## STU. Student portal — *re-audited; mostly solid, a few concrete gaps*
- [x] `[In app]` Renewal form draft now uses `localStorage` — survives closing the browser
- [x] `[In app]` Renewal uploads now have the shared 5MB/type guard + blur soft-flag (extracted to `lib/fileValidation.js`, shared with the apply form)
- [x] `[In app]` "Contact support" on the renewal page now links to the landing's Get-in-Touch section (`/#contact`)
- [ ] `[Partial]` Settings — photo upload and "Reconfigure 2FA" are honest placeholders *("available once accounts sync"; need backend)*

Already solid (no action): dashboard, application form, My Scholarship (3 states), Documents (loading/error/empty), Appeals (real multipart upload), Announcements & schedules, Settings tabs, Renewal blocked/submitted states.

## ADM. Admin portal — *re-audited; the strongest area — no dead controls found*

Everything is API-backed and wired: Verification Queue (search / status / **school-year** filters, document verify/reject, approve/reject/incomplete decisions with grant + remarks modals), Applicant Records (pagination + CSV export + school-year filter), Appeals, Scholar Monitoring, Renewals, Announcements & Events (create/edit with attachments, pin, publish, delete + confirm), Reports (charts + PDF/CSV), Activity Logs (filters + CSV), Users (pagination), and all Maintenance sub-pages (Policies, Cycles, Document Checklist, Eligibility, Org Profile) with real save/delete/toggle mutations.

Honest placeholders only (clearly labeled, not silently dead) — become real with the backend:
- [ ] `[Partial]` Reports — "Financial Disbursement Trends" chart + Payout list note that disbursement tracking isn't available yet
- [ ] `[To build]` Live theme switching — the org-profile theme is stored but not applied to the UI *(= §H4)*
- [ ] `[Partial]` "Draft with AI" button in the composer — gated by the toggle; needs the LLM endpoint *(= §F3)*

## SUP. Super Admin / operator console — *re-audited; a complete-looking prototype on 100% sample data*

> ✅ Confirmed as a real deliverable — multi-tenant is approved (§A). Wire this to the backend when it exists.

- [ ] `[To build]` Whole console runs on `platformStore` sample data with local-only state — nothing persists (resets on reload); no API *(analytics trend, activity feed, health, tickets, users are all hardcoded)*
- [ ] `[To build]` Phase-banner "report an issue" is a dead `#report` anchor *(wire to the support email that Settings already stores)*
- [ ] `[To build]` Settings "Save" only shows a toast — doesn't persist, and the new-municipality defaults (blur/OCR/AI) don't feed the onboard flow
- [ ] `[Partial]` Platform Users page says a Super Admin can "change roles or remove access," but there are no such controls — it's read-only + invite
- [ ] `[Partial]` Overview "Recent activity" feed is hardcoded, not driven by the store

Solid as a prototype (no action): nav, global search (Ctrl+K), notifications, onboard / suspend (with undo) / offboard drawers, the analytics / onboarding / support / broadcasts / health screens, Activity CSV export.

## B. Backend & data — *the biggest chunk; none of this exists yet*
- [ ] `[To build]` Choose backend stack; stand up API server + database
- [ ] `[To build]` Design the database schema *(applicants, applications, documents, scholars, renewals, appeals, announcements/events, users, settings, policies, cycles, eligibility rules)*
- [ ] `[To build]` Build the REST API to match the frontend's existing calls *(axios calls + query keys already define most endpoints)*
- [ ] `[To build]` Replace all mock/sample data with real persistence
- [ ] `[To build]` Tenant scoping — a `municipality_id` on every record *(multi-tenant approved; isolation model TBD — shared DB + tenant_id recommended)*
- [ ] `[To build]` Document storage — multipart upload + bucket/disk *(apply form enforces uploads but can't transfer files without this)*
- [ ] `[To build]` Wire the frontend to the real API; remove the `retry:false` fallbacks

## C. Authentication & security — *login/OTP screens exist; the real security doesn't*
- [ ] `[To build]` Real login — password hashing + sessions or JWT
- [ ] `[To build]` Two-factor auth via an SMS/OTP provider (mandatory) *(verify screen built; needs a real SMS gateway)*
- [ ] `[To build]` Registration + mobile/email verification
- [ ] `[To build]` Forgot / reset password *(link is currently non-functional)*
- [ ] `[Partial]` Enforce role-based access server-side (super_admin / admin / staff / scholar) *(frontend guards done)*
- [ ] `[To build]` Data Privacy Act (RA 10173) — consent, retention, handling
- [ ] `[Partial]` Server-side input validation, rate limiting, audit logging *(activity-log UI exists)*

## D. Application lifecycle
- [ ] `[In app]` Multi-step application form — draft autosave, validation, review step
- [ ] `[To build]` Real document upload + storage *(see §B6)*
- [ ] `[In app]` Verification queue & staff review workflow *(frontend; needs backend)*
- [ ] `[Partial]` Approve / reject and application status transitions
- [ ] `[In app]` Appeals submission & review *(frontend)*
- [x] `[In app]` Scope the queue and records by school year *(both the Verification Queue and Applicant Records have the filter — earlier "TODO" note was stale)*

## E. Scholar lifecycle
- [ ] `[In app]` Scholar monitoring dashboard *(frontend)*
- [ ] `[In app]` Renewals + GWA threshold checks *(frontend)*
- [ ] `[Partial]` GWA rule configurable per program
- [ ] `[In app]` Scholar status vocabulary (active / renewal due / at risk / …)

## F. Assistive features — *three optional tools, each a toggle*
- [x] `[In app]` Blur / image-quality soft-flag on uploads *(done — client-side, free, never blocks)*
- [ ] `[To build]` OCR document reading (Tesseract) *(toggle built; no engine — tesseract.js for a demo, or native server-side)*
- [ ] `[Partial]` AI announcement text generator *(toggle + gated button scaffolded; needs a real LLM endpoint — fails gracefully today)*
- [ ] `[Partial]` Persist the per-municipality feature toggles *(UI done; needs backend)*

## G. Communications & notifications
- [ ] `[In app]` Announcements + events composer & calendar *(frontend)*
- [ ] `[To build]` Publish / schedule announcements to the backend
- [ ] `[Partial]` In-app notifications driven by real events *(bell UI exists)*
- [ ] `[To build]` Email / SMS notifications (status updates, deadline reminders)

## H. Maintenance / configuration — *makes the system generic & configurable*
- [ ] `[In app]` Policies, cycles, eligibility, document checklist, org profile (UI)
- [ ] `[To build]` Persist all configuration to the backend
- [x] `[In app]` Tenant-driven branding (name, tagline, office, contact, colour palette) — done across the shared chrome, landing, and the deeper student/admin/public pages (§MT); real logo upload still needs the backend
- [ ] `[To build]` Live theme switching *(theme is stored but not applied to the UI)*
- [x] `[In app]` Make other per-municipality content optional too (like the walkthrough video). **Done:** landing **map embed**, **website/social links**, downloadable **manual/handbook**, individual **contact fields** (hidden when blank), **essay** requirement in the application (drops the step + review section), **qualifying-exam** & **orientation** journey milestones in My Scholarship, and **payout/disbursement tracking** (payout report + disbursement chart) in admin Reports. All driven by a `features` object on the tenant registry, with on/off toggles in Maintenance → Application &amp; Lifecycle. Pagsanjan runs the lean variant (no essay/exam/orientation/payout) to prove the flags gate.

## I. Reports
- [ ] `[In app]` Report UI with charts
- [ ] `[In app]` PDF / CSV export
- [ ] `[To build]` Feed reports from real aggregate data
- [ ] `[To build]` Print stylesheet *(optional polish)*

## J. Operator console — *confirmed deliverable (multi-tenant approved)*
- [ ] `[In app]` Console UI — analytics, onboarding, support, broadcasts, health *(sample data)*
- [ ] `[To build]` Real API + live tenant management *(currently sample data — see §SUP)*
- [x] `[In app]` Impersonation ("Enter tenant") — built, full impersonation *(see §MT)*

## K. Testing & QA
- [ ] `[To build]` Unit tests
- [ ] `[To build]` Integration / end-to-end tests
- [ ] `[To build]` Acceptance testing / ISO 25010 evaluation *(ties to §A4)*
- [ ] `[To build]` Accessibility audit (keyboard, contrast, labels)
- [ ] `[Partial]` Cross-browser & mobile QA

## L. Deployment & ops
- [ ] `[To build]` Host the frontend, backend, and database
- [ ] `[To build]` Environment config & secrets management
- [ ] `[To build]` Subdomain setup — wildcard DNS + wildcard TLS for `*.iskolar.ph` *(subdomain scheme chosen; `*.localhost` already works in dev)*
- [ ] `[To build]` Backups & recovery
- [ ] `[To build]` CI/CD pipeline *(optional but nice)*

## M. Capstone deliverables — *the academic outputs, not just the software*
- [ ] `[Partial]` Finalize the objectives with your adviser *(drafted; refine wording)*
- [ ] `[To build]` System manuscript / technical documentation
- [ ] `[To build]` User manual
- [ ] `[To build]` Defense demo script & rehearsal
- [ ] `[Partial]` Fold in the Sta. Cruz interview citations *(transparency, anti-bias, Maintenance-Module quotes)*

---

*The frontend being built is real progress — but almost every "To build" item is gated on the backend (§B). Once that exists, many "Partial"/"In app" items finish quickly because the UI is already there.*
