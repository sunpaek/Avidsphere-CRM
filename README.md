# AvidSphere CRM

AvidSphere CRM is a vertical CRM MVP for customer management, sales workflows, product-specific pricing, reminders, notifications, reporting, agreement PDF generation, signatures, and department handoffs.

The active application is the React frontend in [`frontend/react-app`](frontend/react-app). The original HTML/CSS/JavaScript CRM is preserved in [`archive/legacy-crm`](archive/legacy-crm) for parity testing and historical reference.

## Repository layout

```text
.
├── frontend/
│   └── react-app/          Active React + TypeScript + Vite application
├── backend/                Express email and notification API
├── docs/                   Product, architecture, database, and migration docs
├── tools/                  Local data export and verification utilities
└── archive/                Legacy CRM and migration-era artifacts
```

## Run locally

Requirements:

- Node.js 18 or newer
- npm
- A Resend API key for live email delivery

Start the backend:

```powershell
cd backend
npm install
npm run dev
```

Create `backend/.env` locally:

```dotenv
RESEND_API_KEY=your_resend_api_key
PORT=3000
```

Start the frontend in another terminal:

```powershell
cd frontend/react-app
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The frontend uses `http://localhost:3000` for the API unless `VITE_API_BASE` is set.

## Architecture

The current MVP is browser-first:

```text
React UI
  -> localStorage CRM persistence
  -> browser PDF/signature generation
  -> Express notification API
  -> Resend email delivery
```

The production target replaces browser-only persistence with authenticated backend APIs, PostgreSQL, role-based access control, audit history, shared document storage, background jobs, and deployment automation. See [`docs/architecture.md`](docs/architecture.md).

## MVP status

Implemented:

- React routes for dashboard, customers, sales, reminders, notifications, and reports
- AvidSphere-specific mailer, print, and digital sales workflows
- Local demo data and browser persistence
- Agreement PDF and signature workflows
- Department notification routing and email integration
- Database and deployment design references

Pre-production limitations:

- CRM records are stored per browser/device
- No production authentication or authorization
- No integrated PostgreSQL persistence
- No automated test suite or CI quality gate
- Email backend is narrower than the planned production API

## Roadmap

1. Add authenticated users and role-based permissions.
2. Implement the PostgreSQL-backed CRM API and data migrations.
3. Replace localStorage writes with backend persistence and synchronization.
4. Add automated unit, integration, and end-to-end tests.
5. Add document storage, audit logging, backups, and observability.
6. Integrate accounting/payment workflows and production deployment.

## Maintenance notes

- Treat `frontend/react-app` as the frontend source of truth.
- Keep `archive/legacy-crm` unchanged except for explicit parity-reference maintenance.
- Do not commit `node_modules`, `dist`, local environment files, or diagnostic logs.
- Review [`docs/migration-notes.md`](docs/migration-notes.md) before removing archived material.
