# AvidSphere CRM Architecture

## Current executable architecture

The active frontend is a React 18, TypeScript, Vite, and Tailwind application in `frontend/react-app`.

Its current data and integration flow is:

```text
Browser
  ├── React routes and workflow components
  ├── localStorage customer, sale, reminder, preference, and notification data
  ├── jsPDF agreement generation
  └── HTTP requests to the Express backend
        └── Resend email delivery
```

The backend in `backend/` currently provides health and email-notification endpoints. It is not yet the system of record for CRM data.

## Source-of-truth boundaries

- Active UI and workflow code: `frontend/react-app/src/`
- Active email backend: `backend/`
- Production database design: `docs/database/`
- Deployment design: `docs/deployment/`
- Legacy parity reference: `archive/legacy-crm/`
- Migration and diagnostic history: `archive/migration-artifacts/`

## Production target

```text
React client
  -> authenticated API
  -> authorization and validation
  -> PostgreSQL transactions
  -> audit log and notification jobs
  -> email/document/accounting integrations
```

Required production capabilities include:

- Identity, sessions, and role-based access control
- PostgreSQL migrations and transactional repositories
- Shared file and generated-agreement storage
- Background processing and retry handling
- Audit history, monitoring, backups, and disaster recovery
- Automated tests and deployment gates

The larger database/backend files under `docs/` are architectural references until their behavior is implemented and integrated with the active application.
