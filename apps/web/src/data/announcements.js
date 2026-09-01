// Shared fallback announcements, used by the public list and the detail page so
// they resolve the same items while there's no backend. Swap for the API later.
export const FALLBACK_ANNOUNCEMENTS = [
  {
    id: 1,
    category: 'Requirements',
    title: 'Scholarship Applications Now Open for AY 2026–2027',
    body: 'The Municipal Youth Development Office is pleased to announce that scholarship applications for Academic Year 2026–2027 are now open. Qualified residents are encouraged to apply through the portal. Complete all required documents and submit before the deadline.',
    created_at: '2026-06-20T08:00:00Z',
  },
  {
    id: 2,
    category: 'Examination',
    title: 'Qualifying Examination Schedule Posted',
    body: 'Examination batches for new applicants have been finalized. Please check your portal to view your assigned testing center, date, and time.',
    created_at: '2026-06-15T10:00:00Z',
  },
  {
    id: 3,
    category: 'Orientation',
    title: 'Orientation Venue Change for Batch 1',
    body: 'Please be informed that the venue for Batch 1 orientation has been updated. Check your portal inbox for the new location details.',
    created_at: '2026-06-10T09:00:00Z',
  },
  {
    id: 4,
    category: 'Requirements',
    title: 'Updated List of Valid Proof of Residency Documents',
    body: 'The office has updated the list of accepted residency documents. Please review the Requirements page for the latest information.',
    created_at: '2026-06-05T14:00:00Z',
  },
  {
    id: 5,
    category: 'Payout',
    title: 'First Semester Allowances Released for Continuing Scholars',
    body: 'First semester stipends for continuing scholars have been processed. Please coordinate with the office for disbursement details.',
    created_at: '2026-05-28T11:00:00Z',
  },
]

export const CATEGORY_STYLES = {
  Examination: 'bg-warning-light text-warning border-warning/20',
  Orientation: 'bg-info-light text-info border-info/20',
  Payout: 'bg-success-light text-success-dark border-success/20',
  Requirements: 'bg-primary-light text-primary border-primary/20',
  General: 'bg-surface-alt text-content-muted border-border',
}
