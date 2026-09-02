// Dev-only axios adapter. Intercepts /admin/* requests and serves them from the
// in-memory demo store (./data.js), mutating it on decisions so the UI behaves
// like a real backend (approve/reject, undo, document review, bulk actions).
// Non-admin requests fall through to the real browser adapter unchanged.
import axios from 'axios'
import { buildStore, computeStats } from './data'

const store = buildStore()

// The real XHR adapter, for anything we don't mock.
let passthrough
try {
  passthrough = axios.getAdapter('xhr')
} catch {
  passthrough = () => Promise.resolve({ data: '', status: 200, statusText: 'OK', headers: {}, config: {}, request: {} })
}

function ok(data, config, status = 200) {
  return { data, status, statusText: 'OK', headers: {}, config, request: {} }
}
const delay = (ms = 140) => new Promise((r) => setTimeout(r, ms))

function parseBody(config) {
  if (!config.data) return {}
  if (typeof config.data === 'string') { try { return JSON.parse(config.data) } catch { return {} } }
  return config.data
}

const byId = (list, id) => list.find((x) => String(x.id) === String(id))

async function route(config) {
  const method = (config.method || 'get').toLowerCase()
  const [path, qs] = (config.url || '').split('?')
  const q = new URLSearchParams(qs || '')
  const body = parseBody(config)
  await delay()

  // ── Dashboard stats ──
  if (method === 'get' && path === '/admin/stats') {
    return ok(computeStats(store.applications), config)
  }

  // ── Applications list ──
  if (method === 'get' && path === '/admin/applications') {
    let rows = [...store.applications]
    const status = q.get('status')
    const search = (q.get('search') || '').toLowerCase()
    const ay = q.get('academic_year')
    if (status && status !== 'all') rows = rows.filter((a) => a.status === status)
    if (ay) rows = rows.filter((a) => a.academic_year === ay)
    if (search) rows = rows.filter((a) => `${a.first_name} ${a.last_name} ${a.reference_no}`.toLowerCase().includes(search))
    rows.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
    const perPage = Number(q.get('per_page') || 0)
    if (perPage > 0) rows = rows.slice(0, perPage)
    return ok({ data: rows }, config)
  }

  // ── Application detail ──
  let m = path.match(/^\/admin\/applications\/(\w+)$/)
  if (method === 'get' && m) {
    const app = byId(store.applications, m[1])
    return app ? ok({ data: app }, config) : ok({ data: null }, config, 404)
  }

  // ── Decision (approve / reject / incomplete) ──
  m = path.match(/^\/admin\/applications\/(\w+)\/decision$/)
  if (method === 'post' && m) {
    const app = byId(store.applications, m[1])
    if (app) {
      app._prevStatus = app.status
      app.status = body.decision
      app.decided_at = new Date().toISOString()
      app.decision_remarks = body.remarks ?? null
      if (body.grant_amount != null) app.grant_amount = body.grant_amount
    }
    return ok({ data: app }, config)
  }

  // ── Undo a decision ──
  m = path.match(/^\/admin\/applications\/(\w+)\/revert$/)
  if (method === 'post' && m) {
    const app = byId(store.applications, m[1])
    if (app && app._prevStatus) {
      app.status = app._prevStatus
      app._prevStatus = null
      app.decided_at = null
      app.decision_remarks = null
      app.grant_amount = app.status === 'approved' ? app.grant_amount : null
    }
    return ok({ data: app }, config)
  }

  // ── Bulk decision ──
  if (method === 'post' && path === '/admin/applications/bulk-decision') {
    const ids = body.ids || []
    ids.forEach((id) => {
      const app = byId(store.applications, id)
      if (app) {
        app._prevStatus = app.status
        app.status = body.decision
        app.decided_at = new Date().toISOString()
        app.decision_remarks = body.remarks ?? null
        if (body.grant_amount != null) app.grant_amount = body.grant_amount
      }
    })
    return ok({ data: { updated: ids.length } }, config)
  }

  // ── Bulk undo ──
  if (method === 'post' && path === '/admin/applications/bulk-revert') {
    const ids = body.ids || []
    ids.forEach((id) => {
      const app = byId(store.applications, id)
      if (app && app._prevStatus) {
        app.status = app._prevStatus
        app._prevStatus = null
        app.decided_at = null
        app.decision_remarks = null
      }
    })
    return ok({ data: { reverted: ids.length } }, config)
  }

  // ── Document review ──
  m = path.match(/^\/admin\/applications\/(\w+)\/documents\/([\w-]+)\/review$/)
  if (method === 'post' && m) {
    const app = byId(store.applications, m[1])
    const doc = app?.documents?.find((d) => String(d.id) === String(m[2]))
    if (doc) { doc.status = body.status; doc.remarks = body.remarks ?? '' }
    return ok({ data: doc }, config)
  }

  // ── Other admin read endpoints ──
  if (method === 'get' && path === '/admin/applicants') return ok({ data: store.applications }, config)
  if (method === 'get' && path === '/admin/scholars') return ok({ data: store.scholars }, config)
  if (method === 'get' && path === '/admin/maintenance/policies') return ok({ data: store.policies }, config)
  if (method === 'get' && path === '/admin/schedules') return ok({ data: store.schedules }, config)
  if (method === 'get' && path === '/admin/renewals') return ok({ data: store.renewals }, config)
  if (method === 'get' && path.startsWith('/admin/appeals')) return ok({ data: store.appeals }, config)
  if (method === 'get' && path === '/admin/activity-logs') return ok({ data: store.activity }, config)

  // Unmatched admin endpoint → empty success so pages stay calm (no error state).
  if (path.startsWith('/admin/')) {
    return ok(method === 'get' ? { data: [] } : { data: { ok: true } }, config)
  }
  return null
}

export function installMockAdapter(instance) {
  instance.defaults.adapter = async (config) => {
    const res = await route(config)
    if (res) return res
    return passthrough(config)
  }
}
