// Shared catalog of available scholarship programs, used by the public
// Scholarships page and the embedded catalog inside My Scholarship.
// (Static for now; swaps for a Maintenance-driven API later — see D2.)

export const SCHOLARSHIPS = [
  {
    id: 1,
    name: "Mayor's Academic Excellence Award",
    category: 'Academic Merit',
    filter: 'Academic Excellence',
    status: 'open',
    eligibility: 'College students with a GWA of 1.50 or better, no failing grades.',
    benefit: '₱10,000 / semester',
  },
  {
    id: 2,
    name: 'Tulong Dunong Financial Assistance',
    category: 'Financial Need',
    filter: 'Financial Assistance',
    status: 'closing_soon',
    daysLeft: 5,
    eligibility: "Indigent college students; parents' combined income below poverty threshold.",
    benefit: '₱5,000 / semester',
  },
  {
    id: 3,
    name: 'Iskolar ng Bayan – TVET Grant',
    category: 'Skills Training',
    filter: 'TVET / Skills',
    status: 'open',
    eligibility: 'High school graduates or ALS passers enrolling in TESDA accredited courses.',
    benefit: 'Full Tuition + ₱2,000 Allowance',
  },
  {
    id: 4,
    name: 'Senior High School Subsidy',
    category: 'Senior High',
    filter: 'Senior High School',
    status: 'closed',
    eligibility: 'Incoming Grade 11 students enrolled in public high schools within the municipality.',
    benefit: '₱3,000 / year',
  },
]

export const QUALIFICATIONS = [
  { label: 'Residency', text: 'Must be a bonafide resident of the municipality for at least 3 years.' },
  { label: 'Good Moral Character', text: 'Must not have been convicted of any crime involving moral turpitude.' },
  { label: 'Voter Registration', text: 'Applicant or parents must be registered voters of the municipality.' },
  { label: 'No Other Scholarships', text: 'Must not be a recipient of any other major government scholarship.' },
]

export const FILTERS = ['All Programs', 'Academic Excellence', 'Financial Assistance', 'TVET / Skills', 'Senior High School']

export const SORT_OPTIONS = ['Deadline (Soonest)', 'Name (A-Z)', 'Grant Amount']
