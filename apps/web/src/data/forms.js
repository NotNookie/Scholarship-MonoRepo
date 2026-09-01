// Shared fallback list of downloadable forms, used by the public /forms page and
// the Requirements page so they stay a single source. Real files (url) arrive
// from the /forms API once the backend exists; until then url is null and the
// download shows an honest "pending" state.
export const FALLBACK_FORMS = [
  {
    id: 1,
    name: 'Scholarship Application Form',
    description: 'For new applicants applying for the scholarship for the first time.',
    format: 'PDF',
    url: null,
  },
  {
    id: 2,
    name: 'Renewal Application Form',
    description: 'For continuing scholars renewing their scholarship for another term.',
    format: 'PDF',
    url: null,
  },
  {
    id: 3,
    name: 'Program Guidelines & Mechanics',
    description: 'Official scholarship program guidelines, terms, and conditions.',
    format: 'PDF',
    url: null,
  },
  {
    id: 4,
    name: 'Appeal / Reconsideration Form',
    description: 'For applicants who wish to appeal a rejected or incomplete application.',
    format: 'PDF',
    url: null,
  },
]
