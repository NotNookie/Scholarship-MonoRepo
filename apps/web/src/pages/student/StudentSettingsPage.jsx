import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User, ShieldCheck, Bell, Lock, Camera, Loader2, Check, KeyRound, ShieldAlert, BadgeCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../../lib/axios'
import { queryKeys } from '../../lib/queryKeys'
import { useAuthStore } from '../../store/authStore'
import { Skeleton } from '../../components/shared/Skeleton'

const TABS = [
  { key: 'profile', label: 'Profile', Icon: User },
  { key: 'security', label: 'Account & Security', Icon: ShieldCheck },
  { key: 'notifications', label: 'Notifications', Icon: Bell },
]

const NOTIF_TYPES = [
  { key: 'application_status', label: 'Application status updates', desc: 'When your application is verified, approved, or needs action.' },
  { key: 'announcements', label: 'Announcements & news', desc: 'Official notices from the LYDO scholarship office.' },
  { key: 'schedules', label: 'Schedule reminders', desc: 'Upcoming examination, orientation, and payout events.' },
  { key: 'renewal', label: 'Renewal reminders', desc: 'When your renewal window opens and before it closes.' },
]

const inputCls = (locked) =>
  `w-full text-sm px-3 py-2.5 rounded-lg border bg-surface focus:outline-none focus:border-primary transition-colors ${locked ? 'border-border bg-surface-alt text-content-muted cursor-not-allowed' : 'border-border'}`

function initials(name) {
  if (!name) return 'S'
  const p = String(name).trim().split(/\s+/)
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0][0]).toUpperCase()
}

function Field({ id, label, locked, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-content flex items-center gap-1.5">
        {label}
        {locked && <Lock size={12} className="text-content-muted" />}
      </label>
      {children}
      {locked && <p className="text-xs text-content-muted">Locked while your application is under review. Contact LYDO to change.</p>}
      {!locked && hint && <p className="text-xs text-content-muted">{hint}</p>}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-primary' : 'bg-border'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ── Profile tab ───────────────────────────────────────────────

function ProfileTab({ data, locked }) {
  const queryClient = useQueryClient()
  const [edits, setEdits] = useState({})
  const form = { ...data, ...edits }
  const set = (k) => (e) => setEdits((p) => ({ ...p, [k]: e.target.value }))

  const save = useMutation({
    mutationFn: (payload) => api.put('/student/profile', payload),
    onSuccess: () => { toast.success('Profile updated.'); queryClient.invalidateQueries({ queryKey: ['student', 'profile'] }) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save profile.'),
  })

  const name = [form.first_name, form.last_name].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-bold text-content">Personal Profile</h2>

      {/* Avatar + ID */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-xl bg-primary-light text-primary text-xl font-bold flex items-center justify-center">
            {initials(name)}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors" aria-label="Change photo">
            <Camera size={13} />
            <input type="file" accept=".png,.jpg,.jpeg" className="hidden" onChange={() => toast('Photo upload will be available once accounts sync.')} />
          </label>
        </div>
        <div>
          <p className="text-base font-bold text-content">{name || 'Scholar'}</p>
          <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-md">
            <BadgeCheck size={12} /> ID: {form.scholar_id ?? form.applicant_id ?? form.id ?? '—'}
          </span>
        </div>
      </div>

      {/* Personal info */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="first_name" label="First Name" locked={locked}>
            <input id="first_name" value={form.first_name ?? ''} onChange={set('first_name')} disabled={locked} className={inputCls(locked)} />
          </Field>
          <Field id="last_name" label="Last Name" locked={locked}>
            <input id="last_name" value={form.last_name ?? ''} onChange={set('last_name')} disabled={locked} className={inputCls(locked)} />
          </Field>
          <div className="sm:col-span-2">
            <Field id="address" label="Home Address">
              <input id="address" value={form.address ?? ''} onChange={set('address')} className={inputCls(false)} placeholder="Brgy., Sta. Cruz, Laguna" />
            </Field>
          </div>
          <Field id="birthdate" label="Date of Birth" locked={locked}>
            <input id="birthdate" type="date" value={form.birthdate ? String(form.birthdate).slice(0, 10) : ''} onChange={set('birthdate')} disabled={locked} className={inputCls(locked)} />
          </Field>
          <Field id="mobile" label="Phone Number">
            <input id="mobile" value={form.mobile ?? ''} onChange={set('mobile')} className={inputCls(false)} placeholder="+63 9XX XXX XXXX" />
          </Field>
        </div>
      </div>

      {/* Academic info */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Academic Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field id="school_name" label="University / College" locked={locked}>
              <input id="school_name" value={form.school_name ?? ''} onChange={set('school_name')} disabled={locked} className={inputCls(locked)} />
            </Field>
          </div>
          <Field id="course" label="Course / Degree Program" locked={locked}>
            <input id="course" value={form.course ?? ''} onChange={set('course')} disabled={locked} className={inputCls(locked)} />
          </Field>
          <Field id="year_level" label="Year Level">
            <select id="year_level" value={form.year_level ?? ''} onChange={set('year_level')} className={inputCls(false)}>
              <option value="">Select year level</option>
              {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduating'].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <button onClick={() => save.mutate(form)} disabled={save.isPending}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
          {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Changes
        </button>
      </div>
    </div>
  )
}

// ── Security tab ──────────────────────────────────────────────

function SecurityTab({ data }) {
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const setP = (k) => (e) => setPw((p) => ({ ...p, [k]: e.target.value }))

  const changePw = useMutation({
    mutationFn: (payload) => api.post('/student/password', payload),
    onSuccess: () => { toast.success('Password updated.'); setPw({ current: '', next: '', confirm: '' }) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not update password.'),
  })

  const canSubmit = pw.current && pw.next.length >= 8 && pw.next === pw.confirm

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-bold text-content">Account &amp; Security</h2>

      {/* Email */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Email Address</p>
        <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-surface-alt max-w-md">
          <span className="text-sm text-content flex-1 truncate">{data.email ?? '—'}</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary-dark bg-tertiary-light px-2 py-0.5 rounded-full">
            <BadgeCheck size={11} /> Verified
          </span>
        </div>
        <p className="text-xs text-content-muted mt-2">To change your email, please contact the LYDO office.</p>
      </div>

      {/* Change password */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4 inline-flex items-center gap-1.5"><KeyRound size={13} /> Change Password</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="sm:col-span-2">
            <Field id="current_pw" label="Current Password">
              <input id="current_pw" type="password" value={pw.current} onChange={setP('current')} className={inputCls(false)} autoComplete="current-password" />
            </Field>
          </div>
          <Field id="new_pw" label="New Password" hint="At least 8 characters.">
            <input id="new_pw" type="password" value={pw.next} onChange={setP('next')} className={inputCls(false)} autoComplete="new-password" />
          </Field>
          <Field id="confirm_pw" label="Confirm New Password"
            hint={pw.confirm && pw.next !== pw.confirm ? undefined : undefined}>
            <input id="confirm_pw" type="password" value={pw.confirm} onChange={setP('confirm')} className={inputCls(false)} autoComplete="new-password" />
          </Field>
          {pw.confirm && pw.next !== pw.confirm && (
            <p className="sm:col-span-2 text-xs text-danger -mt-1">Passwords don't match.</p>
          )}
        </div>
        <button onClick={() => changePw.mutate({ current_password: pw.current, password: pw.next })} disabled={!canSubmit || changePw.isPending}
          className="mt-4 inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {changePw.isPending && <Loader2 size={15} className="animate-spin" />} Update Password
        </button>
      </div>

      {/* 2FA — mandatory */}
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Two-Factor Authentication</p>
        <div className="border border-tertiary/30 bg-tertiary-light/40 rounded-xl p-5 flex items-start gap-4 max-w-2xl">
          <div className="w-11 h-11 rounded-lg bg-tertiary-light text-tertiary-dark flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-content">Two-factor authentication is enabled</p>
              <span className="text-xs font-semibold text-tertiary-dark bg-tertiary-light px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-xs text-content-muted mt-1 leading-relaxed inline-flex items-start gap-1.5">
              <ShieldAlert size={13} className="text-content-muted shrink-0 mt-0.5" />
              Required by municipal policy for all scholarship accounts — it can't be turned off. You'll enter a one-time code when signing in.
            </p>
          </div>
          <button onClick={() => toast('2FA reconfiguration will be available once accounts sync.')}
            className="text-xs font-semibold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors shrink-0">
            Reconfigure
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Notifications tab ─────────────────────────────────────────

function NotificationsTab({ data }) {
  const queryClient = useQueryClient()
  const base = { application_status: true, announcements: true, schedules: true, renewal: true, ...(data?.notifications ?? {}) }
  const [prefs, setPrefs] = useState(base)

  const save = useMutation({
    mutationFn: (payload) => api.put('/student/notification-preferences', payload),
    onSuccess: () => { toast.success('Notification preferences saved.'); queryClient.invalidateQueries({ queryKey: ['student', 'profile'] }) },
    onError: (e) => toast.error(e?.response?.data?.message ?? 'Could not save preferences.'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-content">Notifications</h2>
        <p className="text-sm text-content-muted mt-1">Choose which in-app notifications you'd like to receive.</p>
      </div>

      <div className="divide-y divide-border border border-border rounded-xl">
        {NOTIF_TYPES.map((t) => (
          <div key={t.key} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-content">{t.label}</p>
              <p className="text-xs text-content-muted mt-0.5">{t.desc}</p>
            </div>
            <Toggle checked={!!prefs[t.key]} label={t.label} onChange={() => setPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))} />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={() => save.mutate(prefs)} disabled={save.isPending}
          className="inline-flex items-center gap-2 bg-primary text-on-primary text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
          {save.isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save Preferences
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────

export function StudentSettingsPage() {
  const [tab, setTab] = useState('profile')
  const authUser = useAuthStore((s) => s.user)

  const profileQuery = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: () => api.get('/student/profile').then((r) => r.data?.data ?? r.data),
    retry: false,
  })
  const applicationsQuery = useQuery({
    queryKey: queryKeys.applications.list(),
    queryFn: () => api.get('/applications?sort=desc').then((r) => r.data),
    retry: false,
  })

  const isPending = profileQuery.isPending || applicationsQuery.isPending
  const data = { ...(authUser ?? {}), ...(profileQuery.data ?? {}) }
  const applications = applicationsQuery.data?.data ?? []
  // Lock identity/academic fields once an application has been submitted for review.
  const locked = applications.some((a) => a.status && a.status !== 'draft')

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold text-content">Account Settings</h1>
        <p className="text-sm text-content-muted mt-1">Manage your profile, security preferences, and notification settings.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sub-nav */}
        <nav className="lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2.5 text-sm font-medium px-4 py-2.5 rounded-lg whitespace-nowrap transition-colors ${tab === t.key ? 'bg-primary text-on-primary' : 'text-content-muted hover:bg-surface-alt hover:text-content'}`}>
              <t.Icon size={16} /> {t.label}
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="flex-1 bg-surface border border-border rounded-xl shadow-card p-6 sm:p-8 min-w-0">
          {isPending ? (
            <div className="space-y-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : tab === 'profile' ? (
            <ProfileTab data={data} locked={locked} />
          ) : tab === 'security' ? (
            <SecurityTab data={data} />
          ) : (
            <NotificationsTab data={data} />
          )}
        </div>
      </div>
    </div>
  )
}
