import { useEffect, useRef, useState } from 'react'
import { UserPlus, X, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePlatformStore, PLATFORM_ROLES, sigilOf } from '../../store/platformStore'
import { InviteUserDrawer } from '../../components/platform/InviteUserDrawer'

function RoleTag({ role }) {
  const meta = PLATFORM_ROLES[role] ?? PLATFORM_ROLES.readonly
  return <span className={`pf-tag ${meta.cls}`}>{meta.label}</span>
}

// Destructive confirm for removing a teammate's access. Mirrors OffboardDrawer's
// accessible pattern (role=dialog, focus trap, Esc, focus restore).
function RemoveUserDrawer({ open, user, onClose, onConfirm }) {
  const ref = useRef(null)
  const restoreRef = useRef(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement
    const t = setTimeout(() => ref.current?.querySelector('button.pf-btn--danger')?.focus(), 120)
    return () => { clearTimeout(t); restoreRef.current?.focus?.() }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const nodes = ref.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const focusable = Array.from(nodes ?? []).filter((n) => !n.disabled && n.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div className={`pf-scrim${open ? ' show' : ''}`} onClick={onClose} />
      <aside
        ref={ref}
        className={`pf-drawer${open ? ' show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-removeuser-title"
        aria-hidden={!open}
      >
        <div className="pf-drawer-head">
          <div>
            <h2 id="pf-removeuser-title">Remove {user?.name}</h2>
            <p>This revokes their access to the platform console.</p>
          </div>
          <button className="pf-drawer-close" type="button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="pf-drawer-body">
          <div className="pf-banner" style={{ background: 'var(--pf-stop-fg)', margin: '0 0 22px' }}>
            <AlertTriangle size={30} strokeWidth={2} />
            <div>
              <div className="bt">They lose access immediately</div>
              <div className="bs">
                {user?.name} ({user?.email}) will no longer be able to sign in to the operator console. You can re-invite them later.
              </div>
            </div>
          </div>
        </div>

        <div className="pf-drawer-foot">
          <button className="pf-btn pf-btn--ghost" type="button" onClick={onClose}>Cancel</button>
          <button className="pf-btn pf-btn--danger" type="button" onClick={onConfirm}>Remove access</button>
        </div>
      </aside>
    </>
  )
}

export function PlatformUsersPage() {
  const users = usePlatformStore((s) => s.platformUsers)
  const changeRole = usePlatformStore((s) => s.changePlatformUserRole)
  const removeUser = usePlatformStore((s) => s.removePlatformUser)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  function confirmRemove() {
    if (!removing) return
    removeUser(removing.id)
    toast.success(`${removing.name} removed from the platform team`)
    setRemoving(null)
  }

  return (
    <>
      <div className="pf-page-head">
        <div>
          <h1 className="pf-title">Platform users</h1>
          <p className="pf-note">Our own team&rsquo;s accounts and what each can reach across every municipality.</p>
        </div>
        <button className="pf-btn" type="button" onClick={() => setInviteOpen(true)}>
          <UserPlus size={18} strokeWidth={2.2} />
          Invite user
        </button>
      </div>
      <hr className="pf-rule" />

      <div className="pf-tscroll">
        <table className="pf-reg">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last active</th>
              <th><span className="pf-sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ cursor: 'default' }}>
                <td>
                  <div className="pf-ten">
                    <div className="pf-sigil">{sigilOf(u.name)}</div>
                    <div className="pf-ten-name">
                      {u.name}
                      {u.you && <span className="pf-you">YOU</span>}
                    </div>
                  </div>
                </td>
                <td><span className="pf-mono">{u.email}</span></td>
                <td>
                  {u.you ? (
                    <RoleTag role={u.role} />
                  ) : (
                    <select
                      className="pf-select"
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      aria-label={`Role for ${u.name}`}
                    >
                      {Object.entries(PLATFORM_ROLES).map(([key, r]) => (
                        <option key={key} value={key}>{r.label}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td style={{ color: 'var(--pf-ink-2)' }}>{u.lastActive}</td>
                <td style={{ textAlign: 'right' }}>
                  {u.you ? (
                    <span style={{ color: 'var(--pf-ink-2)', fontSize: 13 }}>—</span>
                  ) : (
                    <button
                      type="button"
                      className="pf-link-danger"
                      onClick={() => setRemoving(u)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pf-foot">{users.length} platform users · only a Super Admin can invite, change roles, or remove access. You can&rsquo;t change or remove your own account.</div>

      {/* What each role can do */}
      <div className="pf-block" style={{ marginTop: 34 }}>
        <h2>Roles</h2>
        {Object.entries(PLATFORM_ROLES).map(([key, r]) => (
          <div key={key} className="pf-set-row">
            <div>
              <div className="pf-set-lbl"><RoleTag role={key} /></div>
              <div className="pf-set-desc">{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <InviteUserDrawer open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <RemoveUserDrawer open={!!removing} user={removing} onClose={() => setRemoving(null)} onConfirm={confirmRemove} />
    </>
  )
}
