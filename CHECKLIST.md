# Iskolar — Whole-System Build Checklist

Everything left to take Iskolar from a working frontend to a shippable system.

**Where things stand:** the frontend is substantially built (public site, student portal, admin/LYDO portal, operator console), but it runs on mock/sample data and API calls with no server behind them. **The backend does not exist yet** — that's the bulk of the work below.

**Status tags** (the checkbox is for tracking your own completion):
- `[In app]` — frontend done / working
- `[Partial]` — some done, more needed
- `[To build]` — not started
- `[Decision]` — waiting on a decision or dependency

> ⚠️ **Blocking decision:** single configurable app vs. multi-tenant platform is still with your adviser. It gates §J (operator console), §B5 (tenant scoping), and §L3 (URLs). Lock §A first.

---

## A. Decisions to lock first
- [ ] `[Decision]` Confirm scope with adviser — single configurable app vs. multi-tenant platform *(video sent; gates §J, §B5, §L3)*
- [ ] `[To build]` Decide anti-fraud / duplicate-account approach *(parked for group meeting; leaning verified-mobile + staff review + duplicate flagging; no LRN; facial rec rescopable)*
- [ ] `[To build]` AI writer — choose model/provider and who pays (platform vs. municipality)
- [ ] `[To build]` Pick evaluation method — ISO 25010 vs. acceptance testing *(needed for objectives + defense)*
- [ ] `[Decision]` Discovery / URL scheme — subdomain vs. dropdown vs. path *(only if multi-tenant)*

## B. Backend & data — *the biggest chunk; none of this exists yet*
- [ ] `[To build]` Choose backend stack; stand up API server + database
- [ ] `[To build]` Design the database schema *(applicants, applications, documents, scholars, renewals, appeals, announcements/events, users, settings, policies, cycles, eligibility rules)*
- [ ] `[To build]` Build the REST API to match the frontend's existing calls *(axios calls + query keys already define most endpoints)*
- [ ] `[To build]` Replace all mock/sample data with real persistence
- [ ] `[Decision]` Tenant scoping — a `municipality_id` on every record *(depends on §A)*
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
- [ ] `[Partial]` Scope the queue and records by school year *(filter is a known TODO)*

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
- [ ] `[Partial]` Tenant-driven branding replacing the hardcoded name/logo
- [ ] `[To build]` Live theme switching *(theme is stored but not applied to the UI)*

## I. Reports
- [ ] `[In app]` Report UI with charts
- [ ] `[In app]` PDF / CSV export
- [ ] `[To build]` Feed reports from real aggregate data
- [ ] `[To build]` Print stylesheet *(optional polish)*

## J. Operator console — *scope-dependent (only if multi-tenant)*
- [ ] `[In app]` Console UI — analytics, onboarding, support, broadcasts, health *(sample data)*
- [ ] `[Decision]` Real API + live tenant management *(depends on §A)*
- [ ] `[Decision]` If single-app: descope to a thin add-municipality flow, or drop *(depends on §A)*

## K. Testing & QA
- [ ] `[To build]` Unit tests
- [ ] `[To build]` Integration / end-to-end tests
- [ ] `[To build]` Acceptance testing / ISO 25010 evaluation *(ties to §A4)*
- [ ] `[To build]` Accessibility audit (keyboard, contrast, labels)
- [ ] `[Partial]` Cross-browser & mobile QA

## L. Deployment & ops
- [ ] `[To build]` Host the frontend, backend, and database
- [ ] `[To build]` Environment config & secrets management
- [ ] `[Decision]` Domain / subdomain setup *(depends on §A)*
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
