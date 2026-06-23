export const queryKeys = {
  // Public
  announcements: {
    all: ['announcements'],
    list: (params) => ['announcements', 'list', params],
    detail: (id) => ['announcements', 'detail', id],
  },
  requirements: {
    all: ['requirements'],
  },
  forms: {
    all: ['forms'],
  },

  // Student
  applications: {
    all: ['applications'],
    list: () => ['applications', 'list'],
    detail: (id) => ['applications', 'detail', id],
    documents: (id) => ['applications', 'documents', id],
  },

  // Admin
  adminApplications: {
    all: ['admin', 'applications'],
    list: (params) => ['admin', 'applications', 'list', params],
    detail: (id) => ['admin', 'applications', 'detail', id],
  },
  adminApplicants: {
    all: ['admin', 'applicants'],
    list: (params) => ['admin', 'applicants', 'list', params],
  },
  schedules: {
    all: ['schedules'],
    list: () => ['schedules', 'list'],
  },
  reports: {
    all: ['reports'],
    summary: () => ['reports', 'summary'],
  },
  users: {
    all: ['users'],
    list: () => ['users', 'list'],
  },
  maintenance: {
    all: ['maintenance'],
    settings: () => ['maintenance', 'settings'],
  },
  stats: {
    public: () => ['stats', 'public'],
    admin: () => ['stats', 'admin'],
  },
}
