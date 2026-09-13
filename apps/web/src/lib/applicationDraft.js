// Shared helpers for the in-progress application draft, so the resume prompts on
// the Dashboard / My Scholarship compute the SAME percentage as the form's own
// progress bar. The application form auto-saves its values here on every change.

export const DRAFT_KEY = 'iskolar-application-draft'

// Single source of truth for the fields that make each step "complete".
// ApplicationPage's STEP_DEFS pulls its `fields` from here.
export const STEP_FIELDS = {
  personal: ['first_name', 'last_name', 'birthdate', 'sex', 'civil_status', 'street_address', 'barangay', 'mobile'],
  academic: ['school_name', 'course', 'year_level', 'gwa'],
  family: ['annual_income_range', 'num_dependents', 'primary_earner', 'primary_earner_occupation', 'primary_earner_monthly_income', 'financial_need_statement'],
  essay: ['essay'],
  documents: ['doc_acknowledged', 'attest'],
}

export function fieldFilled(v) {
  if (typeof v === 'boolean') return v === true
  if (typeof v === 'number') return Number.isFinite(v)
  return v != null && String(v).trim() !== ''
}

export function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null')
  } catch {
    return null
  }
}

// Progress %, matching the in-form bar. Essay is optional per municipality.
export function draftProgress(values, { hasEssay = true } = {}) {
  if (!values) return 0
  const stepIds = ['personal', 'academic', 'family', ...(hasEssay ? ['essay'] : []), 'documents']
  const done = stepIds.filter((id) => STEP_FIELDS[id].every((f) => fieldFilled(values[f]))).length
  return Math.round((done / stepIds.length) * 100)
}

// Is there a saved draft with any real content worth prompting the scholar to resume?
export function hasDraftInProgress(values) {
  if (!values) return false
  return Object.values(values).some((v) => fieldFilled(v))
}
