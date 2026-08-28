# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two-sided — the product is optimized for both equally:

- **Scholars (students).** Youth in a municipality applying for or holding a local-government scholarship. Mostly on phones. They register, apply, upload supporting documents, track status, file appeals, renew each cycle, and read announcements.
- **LGU staff (LYDO employees).** Process the work day-to-day: verification queue, applicant records, appeals, scholar monitoring, renewals, announcements, and reports. Their success is throughput and confident, auditable decisions.

Also present, above those two:

- **Municipal Admin (LYDO Head).** Configures the municipality's programs, eligibility rules, application cycles, and branding, and manages its own staff accounts; plus oversight/reporting.
- **Super Admin (the developers).** Operate the platform and onboard municipalities. (Their console is not built yet.)

## Product Purpose

Iskolar is a scholarship-management platform for Philippine local government units (LGUs). It runs the full scholarship lifecycle — application, document verification, appeals, renewal, and scholar monitoring — alongside announcements and reporting, replacing paper, spreadsheet, and Google-Forms processes. Success: a municipality can run its entire scholarship program end to end in one system, and a student can go from registration to grant (and on to renewal) without leaving the portal.

## Positioning

Four claims that no single neighboring product (paper forms, Google Forms, a generic gov portal) can truthfully copy together:

- **Configurable multi-tenant.** Any LGU self-configures its own programs, eligibility rules, application cycles, and branding — one generic system, not a bespoke build per town.
- **Full lifecycle in one.** Apply → verify → appeal → renew → monitor, end to end, not just an intake form.
- **Centralized SaaS we operate.** Municipalities are tenants on one hosted platform, not self-hosted repo clones each town maintains — this directly answers the "what about 100 repositories?" problem the original design had.
- **Local assistive tools.** Optional OCR, blur-detection, and AI announcement drafting that stay decision-support for staff and never auto-approve or auto-reject.

## Operating Context

- **Role tiers:** Super Admin (platform / developers) › Admin (municipal Head / LYDO) › Staff (LGU employees) › Scholar (student, tied to exactly one municipality).
- **Two brand layers:** the platform (ours — working name "Iskolar") and per-tenant municipal branding (name, logo, office info; e.g. Sta. Cruz's program brand "Iskolar ng Bayan"). Hardcoded tenant branding is being made tenant-driven.
- **Access:** one centralized login with role-based redirect and a two-factor verification step. Legacy separate admin login has been removed.
- **Cycle-scoped work:** scholarship processing is scoped to a School Year / application cycle (the verification queue and applicant records filter by School Year).
- **Discovery:** leaning toward per-tenant subdomains (e.g. `stacruz.iskolar.ph`); not finalized.
- **Build state:** the frontend is built; there is no backend yet. Every screen renders real loading / empty / error states against placeholder data.

## Capabilities and Constraints

**Confirmed capabilities**

- **Public site:** landing, scholarships catalog, requirements / "How to Qualify", announcements, downloadable forms.
- **Scholar portal:** dashboard, "My Scholarship" hub (application journey + documents + available scholarships + history), apply, per-application documents, appeal, renewal (incl. GWA/grades), targeted announcements, a notification bell with unread count, profile/settings.
- **Municipal admin portal (Admin + Staff):** dashboard, verification queue (School-Year filtered), applicant records (searchable/filterable), appeals, scholar monitoring, renewals, announcements & events (merged), reports (charts + PDF/CSV export), activity logs, sidebar pending-count badges.
- **Head-only:** user management (municipality's own staff) and the Maintenance configuration hub (organization profile/branding, scholarships, policies, application cycles, eligibility rules).
- **Optional per-municipality assistive toggles:** Tesseract OCR document validation (local, free, decision-support only), client-side blur / image-quality soft-flag (never hard-blocks), AI announcement text generator.

**Constraints / explicitly undecided**

- Multi-tenant backend and tenant-scoping of records: not built.
- Platform (Super Admin) console: not built.
- Municipality URL / discovery scheme: undecided (subdomain leaning).
- AI announcement generator model/provider and who-pays: undecided.
- Platform-into-tenant impersonation: parked.

## Brand Commitments

- **Platform name:** "Iskolar" (working). "Iskolar ng Bayan" is the Sta. Cruz **tenant's** program brand — not the platform name.
- **Role vocabulary:** Scholar (not "student"), Municipality / Tenant, Cycle / School Year, Verification Queue, Applicant Records.
- Platform chrome is ours and fixed; per-tenant identity (logo, name, office info) is configured in Maintenance and must drive the currently-hardcoded branding over time.

## Evidence on Hand

- **Real primary client:** Sta. Cruz, Laguna LYDO. Real office contact currently appears in the app (Local Youth Development Office, Municipal Hall, Sta. Cruz, Laguna 4009; email `lydo@stacruzlaguna.gov.ph`). *[Inferred real from the landing page; the listed phone `(049) 123-4567` looks like a placeholder — verify before treating as real.]*
- **Additional test clients:** 3–5 more municipalities being interviewed to validate the generic system. *[From project notes; names not yet recorded here.]*
- **No real applicant/scholar data exists yet** — this is a capstone build and everything renders from placeholder/empty state. Future work must **not** fabricate testimonials, scholar records, application counts, or usage statistics as if they were real.

## Product Principles

- **Dynamic-content-first.** Never hardcode what a tenant configures; every screen handles loading, empty, and error states.
- **Two-sided parity.** A low-friction applicant journey and an efficient staff workflow are both first-class; neither is a second-class afterthought.
- **Assistive, not authoritative.** Automated checks (OCR, blur, AI) inform human decisions; they never gate, block, or auto-decide.
- **Generic and configurable.** Features are municipality-configurable data, not Sta.-Cruz-specific hardcoding.
- **Tenant isolation.** A scholar or staff member belongs to exactly one municipality; data, config, and branding are tenant-scoped.

## Accessibility & Inclusion

- **WCAG AA** as a real, held standard — preserve the existing `aria-*`, keyboard, and contrast discipline already in the code rather than treating it as incidental.
- **Mobile-first.** Students apply mostly on phones; layouts and flows must hold up on small screens first.
- **Bilingual Filipino / English.** Support both (at least eventually); copy and structure must not hard-assume English.
- **PH Data Privacy Act (RA 10173).** Sensitive personal and income documents handled with consent, role-based access, and audit trails (activity logs already exist as the seed of this).
