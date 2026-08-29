import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { usePlatformStore, PLATFORM_ROLES, sigilOf } from '../../store/platformStore'
import { InviteUserDrawer } from '../../components/platform/InviteUserDrawer'

function RoleTag({ role }) {
  const meta = PLATFORM_ROLES[role] ?? PLATFORM_ROLES.readonly
  return <span className={`pf-tag ${meta.cls}`}>{meta.label}</span>
}

export function PlatformUsersPage() {
  const users = usePlatformStore((s) => s.platformUsers)
  const [inviteOpen, setInviteOpen] = useState(false)

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
                <td><RoleTag role={u.role} /></td>
                <td style={{ color: 'var(--pf-ink-2)' }}>{u.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pf-foot">{users.length} platform users · only a Super Admin can invite, change roles, or remove access.</div>

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
    </>
  )
}
