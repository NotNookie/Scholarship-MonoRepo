// Dev-only demo dataset for the admin/LYDO portal. A coherent A.Y. 2026–2027
// scholarship cycle — applications across every status, the scholars they became,
// renewals, appeals, schedules, policies and activity. Served by the mock axios
// adapter (see ./adapter.js) so every admin page renders full without a backend.
// NONE of this is real; it is illustrative sample data for the prototype/demo.

// ── Deterministic PRNG so the demo is stable across reloads ──────────
function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}
const rng = makeRng(20262027)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const int = (min, max) => min + Math.floor(rng() * (max - min + 1))

const FIRST = ['Juan', 'Maria', 'Jose', 'Ana', 'Mark', 'Grace', 'Paolo', 'Andrea', 'Miguel', 'Carla', 'Rafael', 'Bea', 'Nathan', 'Ella', 'Kevin', 'Sofia', 'Diego', 'Camille', 'Aaron', 'Isabel', 'Leo', 'Nicole', 'Gabriel', 'Patricia', 'Emman', 'Trisha', 'Julian', 'Denise', 'Marco', 'Hannah', 'Vince', 'Kyla', 'Enzo', 'Angel', 'Rico', 'Faith', 'Karl', 'Janine']
const LAST = ['Dela Cruz', 'Santos', 'Reyes', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Ramos', 'Flores', 'Villanueva', 'Aquino', 'Castillo', 'Navarro', 'Salazar', 'Domingo', 'Rosales', 'Aguilar', 'Panganiban', 'Ocampo', 'Gutierrez']
const SCHOOLS = ['University of the Philippines Los Baños', 'Laguna State Polytechnic University', 'Pamantasan ng Lungsod ng Sta. Cruz', 'De La Salle Lipa', 'Batangas State University', 'Manuel S. Enverga University', 'STI College Sta. Cruz', 'AMA Computer College']
const COURSES = ['BS Computer Science', 'BS Nursing', 'BS Civil Engineering', 'BS Accountancy', 'BS Education', 'BS Agriculture', 'BS Information Technology', 'BS Business Administration', 'BS Psychology', 'BS Criminology']
const BARANGAYS = ['Poblacion I', 'Poblacion II', 'Poblacion III', 'Bagumbayan', 'Bubukal', 'Calios', 'Duhat', 'Gatid', 'Labuin', 'Oogong', 'Pagsawitan', 'Patimbao', 'San Jose', 'Santisima Cruz']
const INCOME = ['Below ₱100,000', '₱100,000 – ₱250,000', '₱250,001 – ₱500,000', 'Above ₱500,000']
const EARNERS = ['Father', 'Mother', 'Guardian']
const PROGRAMS = [
  { name: "Mayor's Academic Excellence Award", grant: 10000 },
  { name: 'Tulong Dunong Financial Assistance', grant: 5000 },
  { name: 'Iskolar ng Bayan – TVET Grant', grant: 8000 },
  { name: 'Senior High School Subsidy', grant: 3000 },
]
const DOC_NAMES = ['PSA Birth Certificate', 'Official Report Card / Form 138', 'Barangay Certificate of Indigency']

// Status mix for a realistic mid-cycle queue.
const STATUS_PLAN = [
  ...Array(13).fill('submitted'),
  ...Array(4).fill('under_review'),
  ...Array(5).fill('incomplete'),
  ...Array(14).fill('approved'),
  ...Array(6).fill('rejected'),
]

function isoDaysAgo(days, hour = 9) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(hour, int(0, 59), 0, 0)
  return d.toISOString()
}

function docsFor(status) {
  return DOC_NAMES.map((name, i) => {
    let ds = 'pending'
    if (status === 'approved') ds = 'verified'
    else if (status === 'rejected') ds = i === 0 ? 'verified' : 'rejected'
    else if (status === 'incomplete') ds = i === 2 ? 'rejected' : 'verified'
    else if (status === 'under_review') ds = i === 0 ? 'verified' : 'pending'
    return {
      id: `doc-${i + 1}`,
      name,
      status: ds,
      remarks: ds === 'rejected' ? 'Scanned copy is unclear — please re-upload a clearer photo.' : '',
      url: '',
    }
  })
}

function buildApplications() {
  const apps = []
  STATUS_PLAN.forEach((status, i) => {
    const first = FIRST[i % FIRST.length]
    const last = pick(LAST)
    const program = pick(PROGRAMS)
    const decided = status === 'approved' || status === 'rejected'
    const submittedDays = int(3, 45)
    const gwa = (1 + rng() * 2.2).toFixed(2) // 1.00–3.20 (lower is better)
    const ay = rng() < 0.15 ? '2025–2026' : '2026–2027'
    apps.push({
      id: i + 1,
      reference_no: `SC-2026-${String(1000 + i)}`,
      first_name: first,
      last_name: last,
      email: `${first}.${last}`.toLowerCase().replace(/\s+/g, '') + '@email.com',
      status,
      scholarship_name: program.name,
      category: program.name,
      academic_year: ay,
      submitted_at: isoDaysAgo(submittedDays),
      created_at: isoDaysAgo(submittedDays + 1),
      decided_at: decided ? isoDaysAgo(int(1, submittedDays - 1 > 1 ? submittedDays - 1 : 2)) : null,
      sex: pick(['Male', 'Female']),
      civil_status: 'Single',
      birthdate: `200${int(2, 6)}-0${int(1, 9)}-1${int(0, 9)}`,
      mobile: `09${int(10, 99)}${int(1000000, 9999999)}`,
      barangay: pick(BARANGAYS),
      school_name: pick(SCHOOLS),
      course: pick(COURSES),
      year_level: String(int(1, 4)),
      gwa,
      annual_income_range: pick(INCOME),
      num_dependents: int(1, 6),
      primary_earner: pick(EARNERS),
      financial_need_statement:
        'Our family relies on a single income and my studies are difficult to sustain. This scholarship would let me continue my education without adding to my family’s burden.',
      essay:
        'Education has always been my way forward. Coming from a modest household, I have learned to work hard and stay focused on my goals. This grant would help me become the first in my family to finish college and give back to our community.',
      grant_amount: status === 'approved' ? program.grant : null,
      decision_remarks:
        status === 'approved' ? 'All requirements verified. Congratulations.'
        : status === 'rejected' ? 'Household income exceeds the program threshold for this cycle.'
        : status === 'incomplete' ? 'Certificate of Indigency is unclear — please re-upload.'
        : null,
      documents: docsFor(status),
      _prevStatus: null,
    })
  })
  return apps
}

// ── Scholars (from approved applications) ────────────────────────────
function buildScholars(apps) {
  const approved = apps.filter((a) => a.status === 'approved')
  return approved.map((a, i) => {
    // A few fail the threshold (at-risk), a few are due for renewal.
    const risk = i % 7 === 0
    const latest = risk ? (2.7 + rng() * 0.6).toFixed(2) : (1.1 + rng() * 1.1).toFixed(2)
    const due = !risk && i % 5 === 0
    const history = [1, 2, 3].map((sem) => ({
      term: `Sem ${sem}`,
      gwa: (1.2 + rng() * 1.0).toFixed(2),
    }))
    return {
      id: 1000 + a.id,
      scholar_id: `SCH-${String(2000 + i)}`,
      first_name: a.first_name,
      last_name: a.last_name,
      program: a.scholarship_name,
      scholarship_name: a.scholarship_name,
      academic_year: '2026–2027',
      status: due ? 'renewal_due' : 'active',
      latest_gwa: Number(latest),
      required_gwa: 2.5,
      gwa_direction: 'lower_better',
      gwa_history: history,
      school_name: a.school_name,
      course: a.course,
      year_level: a.year_level,
      renewal_deadline: due ? isoDaysAgo(-12) : isoDaysAgo(-90),
      policy_id: PROGRAMS.findIndex((p) => p.name === a.scholarship_name) + 1,
    }
  })
}

// ── Policies (drive the at-risk computation on Scholar Monitoring) ────
const POLICIES = PROGRAMS.map((p, i) => ({
  id: i + 1,
  name: p.name,
  min_gwa: 2.5,
  gwa_direction: 'lower_better',
  income_cap: 250000,
  grant_amount: p.grant,
  slots: int(20, 80),
  active: true,
}))

const SCHEDULES = [
  { id: 1, title: 'Application deadline — A.Y. 2026–2027', type: 'Deadline', date: isoDaysAgo(-9), start_time: '5:00 PM', location: 'Online' },
  { id: 2, title: 'Qualifying exam', type: 'Exam', date: isoDaysAgo(-16), start_time: '8:00 AM', location: 'Municipal Gymnasium' },
  { id: 3, title: 'Scholar orientation', type: 'Orientation', date: isoDaysAgo(-23), start_time: '9:00 AM', location: 'LYDO Conference Room' },
  { id: 4, title: 'Grant disbursement — 1st tranche', type: 'Payout', date: isoDaysAgo(-31), start_time: '10:00 AM', location: 'Municipal Treasury' },
]

function buildRenewals(scholars) {
  return scholars
    .filter((s) => s.status === 'renewal_due')
    .map((s, i) => ({
      id: i + 1,
      scholar_id: s.scholar_id,
      first_name: s.first_name,
      last_name: s.last_name,
      program: s.program,
      scholarship_name: s.program,
      academic_year: '2026–2027',
      status: 'pending',
      latest_gwa: s.latest_gwa,
      required_gwa: 2.5,
      gwa_direction: 'lower_better',
      submitted_at: isoDaysAgo(int(2, 10)),
      documents: [
        { id: 'r-doc-1', name: 'Latest Report Card', status: 'pending', remarks: '', url: '' },
        { id: 'r-doc-2', name: 'Certificate of Enrollment', status: 'pending', remarks: '', url: '' },
      ],
    }))
}

function buildAppeals(apps) {
  return apps
    .filter((a) => a.status === 'rejected')
    .slice(0, 3)
    .map((a, i) => ({
      id: i + 1,
      application_id: a.id,
      reference_no: a.reference_no,
      first_name: a.first_name,
      last_name: a.last_name,
      scholarship_name: a.scholarship_name,
      academic_year: a.academic_year,
      status: 'pending',
      filed_at: isoDaysAgo(int(1, 8)),
      reason: 'Our updated income documents show that our household is below the threshold. We respectfully request a re-evaluation.',
      statement: 'Our updated income documents show that our household is below the threshold. We respectfully request a re-evaluation of my application.',
    }))
}

function buildActivity(apps) {
  const rows = []
  let id = 1
  apps.filter((a) => a.status === 'approved').slice(0, 6).forEach((a) => {
    rows.push({ id: id++, actor: 'Maria Santos', action: 'approved application', target: `${a.first_name} ${a.last_name}`, entity: a.reference_no, at: a.decided_at, type: 'decision' })
  })
  apps.filter((a) => a.status === 'rejected').slice(0, 3).forEach((a) => {
    rows.push({ id: id++, actor: 'Maria Santos', action: 'rejected application', target: `${a.first_name} ${a.last_name}`, entity: a.reference_no, at: a.decided_at, type: 'decision' })
  })
  rows.push({ id: id++, actor: 'Ana Reyes', action: 'verified document', target: 'PSA Birth Certificate', entity: 'SC-2026-1003', at: isoDaysAgo(2, 14), type: 'document' })
  rows.push({ id: id++, actor: 'Maria Santos', action: 'published announcement', target: 'Application deadline reminder', entity: '', at: isoDaysAgo(3, 11), type: 'announcement' })
  return rows.sort((a, b) => new Date(b.at) - new Date(a.at))
}

// ── Assemble the store ───────────────────────────────────────────────
export function buildStore() {
  const applications = buildApplications()
  const scholars = buildScholars(applications)
  return {
    applications,
    scholars,
    policies: POLICIES,
    schedules: SCHEDULES,
    renewals: buildRenewals(scholars),
    appeals: buildAppeals(applications),
    activity: buildActivity(applications),
  }
}

export function computeStats(applications) {
  const by = (s) => applications.filter((a) => a.status === s).length
  const pending = by('submitted') + by('under_review')
  return {
    total_applicants: applications.length,
    pending_review: pending,
    pending,
    approved: by('approved'),
    rejected: by('rejected'),
    incomplete: by('incomplete'),
    incomplete_rejected: by('incomplete') + by('rejected'),
  }
}
