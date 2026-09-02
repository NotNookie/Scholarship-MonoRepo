import { create } from 'zustand'

// Placeholder tenant data for the platform (Super Admin) console while there is
// no multi-tenant backend yet. Swap this store for TanStack Query calls to
// `/platform/*` once the backend exists — the components read from selectors,
// so the shape is what matters.
// NOTE: illustrative sample data — not real municipalities or figures.
const SAMPLE = [
  { id: 'sta-cruz',  name: 'Sta. Cruz',  province: 'Laguna', subdomain: 'stacruz',   status: 'active',     scholars: 1248, admins: 1, staff: 4, programs: 3, cycle: 'A.Y. 2026–2027', applications: 642, onboarded: 'Aug 2025', main: true, ocr: true,  ai: true },
  { id: 'pagsanjan', name: 'Pagsanjan',  province: 'Laguna', subdomain: 'pagsanjan', status: 'active',     scholars: 412,  admins: 1, staff: 2, programs: 2, cycle: 'A.Y. 2026–2027', applications: 198, onboarded: 'Oct 2025', ocr: true,  ai: false },
  { id: 'pakil',     name: 'Pakil',      province: 'Laguna', subdomain: 'pakil',     status: 'active',     scholars: 186,  admins: 1, staff: 1, programs: 1, cycle: 'A.Y. 2026–2027', applications: 74,  onboarded: 'Nov 2025', ocr: true,  ai: false },
  { id: 'nagcarlan', name: 'Nagcarlan',  province: 'Laguna', subdomain: 'nagcarlan', status: 'active',     scholars: 58,   admins: 1, staff: 1, programs: 1, cycle: 'A.Y. 2026–2027', applications: 31,  onboarded: 'Jan 2026', ocr: false, ai: false },
  { id: 'pila',      name: 'Pila',       province: 'Laguna', subdomain: 'pila',      status: 'onboarding', scholars: 0,    admins: 1, staff: 0, programs: 0, cycle: '—', applications: 0, onboarded: 'Feb 2026', ocr: false, ai: false,
    setup: { head_invited: true, head_active: true, branding: true, program: false, cycle: false } },
  { id: 'lumban',    name: 'Lumban',     province: 'Laguna', subdomain: 'lumban',    status: 'onboarding', scholars: 0,    admins: 1, staff: 0, programs: 0, cycle: '—', applications: 0, onboarded: 'Feb 2026', ocr: false, ai: false,
    setup: { head_invited: true, head_active: false, branding: false, program: false, cycle: false } },
  { id: 'kalayaan',  name: 'Kalayaan',   province: 'Laguna', subdomain: 'kalayaan',  status: 'onboarding', scholars: 0,    admins: 1, staff: 0, programs: 1, cycle: '—', applications: 0, onboarded: 'Feb 2026', ocr: false, ai: false,
    setup: { head_invited: true, head_active: true, branding: true, program: true, cycle: false } },
]

// The manual onboarding checklist every new tenant works through, in order.
export const SETUP_STEPS = [
  { key: 'head_invited', label: 'Head admin invited' },
  { key: 'head_active',  label: 'Head activated account' },
  { key: 'branding',     label: 'Branding & profile set' },
  { key: 'program',      label: 'First program configured' },
  { key: 'cycle',        label: 'First application cycle opened' },
]

// Which pipeline column a tenant sits in, derived from its checklist progress.
export function setupStage(setup) {
  if (!setup) return 'invited'
  const done = SETUP_STEPS.filter((s) => setup[s.key]).length
  if (done <= 1) return 'invited'
  if (done >= SETUP_STEPS.length) return 'ready'
  return 'setup'
}
export const PIPELINE_COLUMNS = [
  { key: 'invited', label: 'Invited', desc: 'Charter created, waiting on the head admin.' },
  { key: 'setup',   label: 'Setting up', desc: 'Configuring programs, branding and staff.' },
  { key: 'ready',   label: 'Ready to launch', desc: 'Checklist complete — open for applicants.' },
]

// Illustrative onboarding trend (municipalities live at each month-end).
export const ONBOARD_TREND = [
  { m: 'Aug', n: 1 }, { m: 'Sep', n: 1 }, { m: 'Oct', n: 2 }, { m: 'Nov', n: 3 },
  { m: 'Dec', n: 3 }, { m: 'Jan', n: 4 }, { m: 'Feb', n: 7 },
]

// `grantsAccess` = the municipality authorized the platform team to enter their
// portal while this request is open. `tenantId` matches a municipality id.
const SUPPORT = [
  { id: 't-104', tenantId: 'pagsanjan', tenant: 'Pagsanjan', subject: 'Cannot upload office logo (file too large)', message: 'Our logo keeps failing to upload. Please take a look.', priority: 'normal', status: 'open', opened: '2026-02-18', requester: 'LYDO Head', grantsAccess: true },
  { id: 't-103', tenantId: 'nagcarlan', tenant: 'Nagcarlan', subject: 'Requesting help configuring GWA threshold', message: 'We are unsure how to set the GWA rule for our new program.', priority: 'normal', status: 'open', opened: '2026-02-16', requester: 'Staff', grantsAccess: false },
  { id: 't-102', tenantId: 'sta-cruz', tenant: 'Sta. Cruz', subject: 'OTP SMS not received by some applicants', message: 'A few applicants report not getting the OTP. Please investigate — you may enter to check our setup.', priority: 'high', status: 'open', opened: '2026-02-15', requester: 'LYDO Head', grantsAccess: true },
  { id: 't-101', tenantId: 'pakil', tenant: 'Pakil', subject: 'How do I export the applicant list?', message: '', priority: 'low', status: 'resolved', opened: '2026-02-09', requester: 'Staff', grantsAccess: false },
  { id: 't-100', tenantId: 'sta-cruz', tenant: 'Sta. Cruz', subject: 'Add a second reviewer account', message: '', priority: 'normal', status: 'resolved', opened: '2026-02-04', requester: 'LYDO Head', grantsAccess: false },
]

const BROADCASTS = [
  { id: 'b-3', title: 'Scheduled maintenance — Feb 25, 10 PM', audience: 'All municipalities', sentBy: 'Platform Admin', sentAt: '2026-02-19 · 14:00', body: 'The platform will be briefly unavailable on Feb 25 from 10:00–10:30 PM for a database upgrade. No action is needed on your end.' },
  { id: 'b-2', title: 'New: document checklist templates', audience: 'All municipalities', sentBy: 'Platform Admin', sentAt: '2026-02-10 · 09:30', body: 'You can now start from a ready-made document checklist when setting up a program. Find it under Maintenance → Document Checklist.' },
  { id: 'b-1', title: 'Reminder: verify staff accounts', audience: 'Active municipalities', sentBy: 'Platform Admin', sentAt: '2026-01-30 · 16:15', body: 'Please make sure every staff member has completed two-factor setup before your next application cycle opens.' },
]

const HEALTH = [
  { id: 'app',     label: 'Application & web portal', status: 'operational', detail: 'All regions responding', metric: '99.98% uptime · 30d' },
  { id: 'db',      label: 'Database',                 status: 'operational', detail: 'Primary + replica healthy', metric: 'Read/write normal' },
  { id: 'sms',     label: 'SMS / OTP provider',       status: 'degraded',    detail: 'Elevated delivery latency', metric: '~40s avg delivery' },
  { id: 'storage', label: 'Document storage',         status: 'operational', detail: 'Uploads accepted', metric: '62% of quota used' },
  { id: 'ocr',     label: 'OCR service',              status: 'operational', detail: 'Queue clear', metric: 'Local · no external calls' },
  { id: 'backup',  label: 'Backups',                  status: 'operational', detail: 'Nightly snapshot succeeded', metric: 'Last: today 03:00' },
]

// ── Operator activity feed ───────────────────────────────────────
// Each entry renders as "{before}<b>{strong}</b>{after}". `kind` picks the
// icon + tone in the UI. New entries are prepended by the mutating actions
// below, so the Overview feed reflects what the operator actually did.
const ACTIVITY = [
  { id: 'ac-3', kind: 'onboard', before: '', strong: 'Nagcarlan', after: ' onboarded and activated', time: 'Today · 09:14' },
  { id: 'ac-2', kind: 'cycle',   before: '', strong: 'Pakil',     after: ' completed its first application cycle', time: 'Yesterday · 16:40' },
  { id: 'ac-1', kind: 'invite',  before: 'Head admin invited for ', strong: 'Pila', after: '', time: '2 days ago · 11:02' },
]
let activityId = 4
const makeActivity = (partial) => ({ id: `ac-${activityId++}`, before: '', after: '', time: 'Just now', ...partial })

let notifId = 4
const NOTIFICATIONS = [
  { id: 'n-3', kind: 'warn', text: 'SMS / OTP provider is reporting degraded delivery.', time: '25m ago', read: false, to: '/platform/health' },
  { id: 'n-2', kind: 'info', text: 'New support request from Pagsanjan.', time: '2h ago', read: false, to: '/platform/support' },
  { id: 'n-1', kind: 'ok',   text: 'Nagcarlan completed onboarding and went live.', time: 'Yesterday', read: true, to: '/platform/onboarding' },
]

function initials(name) {
  const parts = name.trim().split(/\s+/)
  return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase()
}

export const usePlatformStore = create((set) => ({
  municipalities: SAMPLE,
  activity: ACTIVITY,

  // Toggle a tenant between active and suspended (reversible from the UI).
  toggleStatus: (id) =>
    set((s) => {
      const m = s.municipalities.find((x) => x.id === id)
      const suspending = m?.status !== 'suspended'
      return {
        municipalities: s.municipalities.map((x) =>
          x.id === id ? { ...x, status: x.status === 'suspended' ? 'active' : 'suspended' } : x
        ),
        activity: m
          ? [makeActivity({ kind: suspending ? 'suspend' : 'reactivate', strong: m.name, after: suspending ? ' was suspended' : ' was reactivated' }), ...s.activity]
          : s.activity,
      }
    }),

  // Charter a new tenant (local only, for design iteration). The blur/OCR/AI
  // starting state comes from the platform's new-municipality defaults.
  onboard: ({ name, province, subdomain, ocr = false, ai = false }) =>
    set((s) => ({
      municipalities: [
        ...s.municipalities,
        {
          id: subdomain || name.toLowerCase().replace(/\s+/g, '-'),
          name, province: province || '—', subdomain: subdomain || 'new',
          status: 'onboarding', scholars: 0, admins: 1, staff: 0, programs: 0,
          cycle: '—', applications: 0, onboarded: 'Just now', ocr, ai,
          setup: { head_invited: true, head_active: false, branding: false, program: false, cycle: false },
        },
      ],
      activity: [makeActivity({ kind: 'onboard', strong: name, after: ' chartered · invitation sent' }), ...s.activity],
    })),

  // Permanently remove a tenant from the platform (offboarding, last step).
  offboard: (id) =>
    set((s) => {
      const m = s.municipalities.find((x) => x.id === id)
      return {
        municipalities: s.municipalities.filter((x) => x.id !== id),
        activity: m
          ? [makeActivity({ kind: 'offboard', strong: m.name, after: ' was offboarded and removed' }), ...s.activity]
          : s.activity,
      }
    }),

  // ── Support inbox ──────────────────────────────────────────────
  supportTickets: SUPPORT,
  resolveTicket: (id) =>
    set((s) => ({
      supportTickets: s.supportTickets.map((t) =>
        t.id === id ? { ...t, status: t.status === 'resolved' ? 'open' : 'resolved' } : t
      ),
    })),
  // A municipality files a support request (optionally granting portal access).
  requestSupport: ({ tenantId, tenant, subject, message, grantsAccess }) =>
    set((s) => ({
      supportTickets: [
        { id: `t-${s.supportTickets.length + 105}`, tenantId, tenant, subject, message: message ?? '', priority: 'normal', status: 'open', opened: 'Just now', requester: 'LYDO Head', grantsAccess: !!grantsAccess },
        ...s.supportTickets,
      ],
      activity: [makeActivity({ kind: 'support', before: 'New support request from ', strong: tenant }), ...s.activity],
    })),
  // Revoke = close the request, which ends any granted access.
  revokeSupport: (id) =>
    set((s) => ({
      supportTickets: s.supportTickets.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t)),
    })),

  // ── Broadcasts to tenants ──────────────────────────────────────
  broadcasts: BROADCASTS,
  sendBroadcast: ({ title, audience, body }) =>
    set((s) => ({
      broadcasts: [
        { id: `b-${s.broadcasts.length + 1}`, title, audience, body, sentBy: 'Platform Admin', sentAt: 'Just now' },
        ...s.broadcasts,
      ],
      activity: [makeActivity({ kind: 'broadcast', before: 'Broadcast sent · ', strong: title }), ...s.activity],
    })),

  // ── Platform health ────────────────────────────────────────────
  healthServices: HEALTH,

  // ── Operator notifications ─────────────────────────────────────
  notifications: NOTIFICATIONS,
  markNotificationRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  // Our own team's accounts (placeholder — swap for /platform/users API later).
  platformUsers: [
    { id: 'you', name: 'Platform Admin', email: 'admin@iskolar.ph', role: 'super_admin', lastActive: 'Just now', you: true },
    { id: 'mika', name: 'Mika Ramos', email: 'mika@iskolar.ph', role: 'support', lastActive: '2 hours ago' },
    { id: 'dan', name: 'Dan Lim', email: 'dan@iskolar.ph', role: 'readonly', lastActive: 'Yesterday' },
  ],
  invitePlatformUser: ({ name, email, role }) =>
    set((s) => ({
      platformUsers: [
        ...s.platformUsers,
        { id: email || name, name: name || email, email, role, lastActive: 'Invited · pending' },
      ],
      activity: [makeActivity({ kind: 'invite_team', before: 'Invited ', strong: name || email, after: ' to the platform team' }), ...s.activity],
    })),

  // Change a teammate's platform role (Super Admin only; the UI blocks self-edits).
  changePlatformUserRole: (id, role) =>
    set((s) => {
      const u = s.platformUsers.find((x) => x.id === id)
      return {
        platformUsers: s.platformUsers.map((x) => (x.id === id ? { ...x, role } : x)),
        activity: u
          ? [makeActivity({ kind: 'role', strong: u.name, after: ` is now ${PLATFORM_ROLES[role]?.label ?? role}` }), ...s.activity]
          : s.activity,
      }
    }),

  // Remove a teammate's access (Super Admin only; the UI blocks removing yourself).
  removePlatformUser: (id) =>
    set((s) => {
      const u = s.platformUsers.find((x) => x.id === id)
      return {
        platformUsers: s.platformUsers.filter((x) => x.id !== id),
        activity: u
          ? [makeActivity({ kind: 'remove', strong: u.name, after: ' was removed from the platform team' }), ...s.activity]
          : s.activity,
      }
    }),
}))

// Platform-level roles for our own team (distinct from the municipal roles).
export const PLATFORM_ROLES = {
  super_admin: { label: 'Super Admin', cls: 'accent', desc: 'Full control — onboard, suspend, manage the platform team.' },
  support: { label: 'Support', cls: 'info', desc: 'Read everything and assist tenants; can open support sessions.' },
  readonly: { label: 'Read-only', cls: 'neutral', desc: 'Oversight only — can view, cannot change anything.' },
}

export const STATUS_META = {
  active: { label: 'Active', cls: 'ok' },
  onboarding: { label: 'Onboarding', cls: 'warn' },
  suspended: { label: 'Suspended', cls: 'stop' },
}

// Health service status vocabulary.
export const HEALTH_META = {
  operational: { label: 'Operational', cls: 'ok' },
  degraded: { label: 'Degraded', cls: 'warn' },
  down: { label: 'Down', cls: 'stop' },
}

export const sigilOf = initials

// True when a municipality currently authorizes the platform team to enter its
// portal (an open support request that grants access).
export const tenantHasActiveAccess = (tickets, tenantId) =>
  !!tenantId && tickets.some((t) => t.tenantId === tenantId && t.status === 'open' && t.grantsAccess)
export const nextNotifId = () => `n-${notifId++}`
