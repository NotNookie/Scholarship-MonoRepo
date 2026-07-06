# Iskolar Link — Digital Scholarship Management Platform

A web-based scholarship management system for the Municipality of Sta. Cruz, Laguna (LYDO). Built as a capstone project.

---

## Tech Stack

- **React 19** + **Vite 8**
- **Tailwind CSS v4** (design tokens via `@theme {}`)
- **React Router v7** (nested layouts)
- **Zustand** (auth state, persist middleware)
- **TanStack Query v5** (server state)
- **TanStack Table v8**
- **React Hook Form v7** + **Zod v4**
- **Recharts**
- **Lucide React**

---

## Project Structure

```
Scholarship/
├── apps/
│   └── web/                  # Frontend React app
│       ├── src/
│       │   ├── components/   # Shared UI components + layouts
│       │   ├── pages/        # Route-level pages (public, auth, student, admin)
│       │   ├── router/       # React Router config
│       │   ├── store/        # Zustand stores
│       │   └── lib/          # Axios instance, helpers
│       └── package.json
└── package.json              # Root monorepo scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/NotNookie/Scholarship-MonoRepo.git
cd Scholarship-MonoRepo

# Install dependencies
cd apps/web
npm install
```

### Running the Dev Server

From the **root** of the monorepo:

```bash
npm run web
```

Or from inside `apps/web`:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
# From root
npm run web:build

# Or from apps/web
npm run build
```

### Preview Production Build

```bash
cd apps/web
npm run preview
```

---

## Portals

| Portal | URL | Roles |
|---|---|---|
| Public / Student | `/` | Guest, Student |
| Admin | `/admin` | super_admin, admin, miso |

### Student Flow
1. Register at `/register`
2. Log in at `/login` (2FA via OTP)
3. Apply for a scholarship at `/apply`
4. Track status at `/applications`

### Admin Flow
1. Log in at `/admin/login`
2. Review applications at `/admin/applications`
3. Manage schedules, announcements, and reports

---

## Environment Variables

Create `apps/web/.env` (not committed):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## License

For academic/capstone use only. Municipality of Sta. Cruz, Laguna — LYDO.
