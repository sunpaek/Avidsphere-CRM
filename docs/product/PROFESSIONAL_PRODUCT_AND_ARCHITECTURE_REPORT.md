# Avidsphere CRM Professional Product and Architecture Report

Date: June 7, 2026  
Prepared for: Avidsphere leadership, technical stakeholders, full-stack developers, and potential investors

## 1. Executive Summary

Avidsphere CRM is a strong MVP for a specialized advertising sales workflow. The current product successfully models customer management, sales capture, product-specific pricing, department notifications, reminders, reporting dashboards, PDF agreement generation, and handwritten signature capture. It is especially valuable because it reflects real Avidsphere operating workflows rather than a generic CRM template.

The current executable system is not yet a production SaaS platform. The live CRM data layer is browser `localStorage`; the working backend is a lightweight Express service focused on Resend email notifications; and the PostgreSQL schema, deployment guide, ERD, and backend implementation file represent a target architecture rather than an integrated production backend. This is a healthy MVP-to-production position, but it must be communicated clearly: the product concept is mature, while the platform infrastructure is still pre-production.

The most important next step is to convert the browser-only CRM into a backend-backed multi-user application with PostgreSQL, authentication, authorization, audit logging, migrations, and deployment automation. Once that foundation is implemented, the product can support multiple users, iPads, accounting sync, reporting, compliance, and commercialization.

High-level readiness assessment:

| Area | Current State | Production Readiness |
|---|---|---|
| Product workflow | Strong MVP workflow coverage | Medium-high |
| Frontend UX | Functional single-page CRM | Medium |
| Backend API | Email notification backend only | Low |
| Database | Well-designed proposed PostgreSQL schema | Medium as design, low as implementation |
| Authentication | Role selector only; no real login | Low |
| Multi-user sync | Not implemented | Low |
| QuickBooks | Designed, not implemented | Low-medium |
| SaaS deployment | Documented conceptually | Low |
| Commercialization | Promising vertical workflow | Medium after platform buildout |

## 2. Current Architecture

The current codebase has two separate architectural layers:

1. A working browser-based CRM MVP:
   - `index.html`
   - `style.css`
   - `script.js`
   - `Assets/logo-base64.js`, `Assets/logo.png`

2. A partial backend and production architecture plan:
   - `backend/server.js`
   - `backend/routes/emailRoutes.js`
   - `backend/controllers/emailController.js`
   - `backend/services/emailService.js`
   - `DATABASE_SCHEMA.sql`
   - `DATABASE_ARCHITECTURE.md`
   - `DATABASE_ERD.txt`
   - `BACKEND_IMPLEMENTATION.js`
   - `DEPLOYMENT_GUIDE.md`
   - `README_DATABASE.md`

Current data flow:

```text
Browser UI
  -> script.js application state
  -> localStorage persistence
  -> jsPDF agreement generation
  -> optional email API calls
  -> Express email backend
  -> Resend email service
```

Target production data flow described by the database documents:

```text
Browser/iPad clients
  -> Authenticated API
  -> RBAC permission checks
  -> PostgreSQL transactional data
  -> audit/activity logs
  -> notification service
  -> document storage
  -> QuickBooks sync queue
  -> background workers and webhooks
```

## 3. Current Tech Stack

Current implemented stack:

| Layer | Technology |
|---|---|
| Frontend | Plain HTML, CSS, JavaScript |
| Browser storage | `localStorage` |
| PDF generation | jsPDF via CDN |
| Signature capture | Native HTML canvas in `script.js` |
| Backend | Node.js, Express |
| Email provider | Resend |
| Backend config | dotenv |
| Backend dependencies | `cors`, `dotenv`, `express`, `resend` |

Planned/architectural stack:

| Layer | Technology |
|---|---|
| Database | PostgreSQL 15 |
| Backend pattern | Node.js/Express with PostgreSQL |
| Auth concept | JWT, bcrypt, sessions |
| Deployment concept | AWS RDS, EC2, ALB, S3, CloudWatch |
| Accounting integration | QuickBooks Online API |
| File storage concept | Local or S3 |

## 4. Data Flow Analysis

The frontend keeps a global `state` object containing customers, sales, reminders, notifications, activities, preferences, and UI state. Persistence is handled through `localStorage` keys such as:

- `avidSphere.customers`
- `avidSphere.sales`
- `avidSphere.reminders`
- `avidSphere.notifications`
- `avidSphere.activities`
- `avidSphere.preferences`
- `avidSphere.notificationHistory`

Strengths:

- Fast MVP iteration.
- Works offline on one browser/device.
- No infrastructure required for demos.
- Clear product workflows already captured.

Risks:

- Data is device-local and browser-local.
- There is no server-side source of truth.
- Multiple users cannot reliably share updates.
- Deleting browser storage can remove CRM records.
- Customer, sales, and signature data are exposed to anyone with browser access.
- No transactional integrity, backups, or audit-grade retention.

Production requirement:

Move all business records to PostgreSQL through an authenticated API. `localStorage` should be reduced to UI preferences, temporary drafts, and optional offline queues.

## 5. CRM Workflow Analysis

The product supports a practical advertising CRM workflow:

```text
Customer created
  -> sale logged
  -> product/category details captured
  -> pricing calculated
  -> notifications routed
  -> agreement generated
  -> signature captured
  -> reminders scheduled
  -> management dashboard updated
```

The workflow coverage is one of the strongest parts of the project. It includes customer records, assigned representatives, status tracking, notes, social accounts, order history, reorder support, sales ledgers, reminders, notifications, and management reporting.

Primary product gap:

The workflow exists mostly inside the browser script. A production system should move workflow rules into backend services so pricing, notifications, permissions, and status changes are enforced consistently across all users and devices.

## 6. Customer Lifecycle Analysis

Current lifecycle:

1. Customer is created in the browser.
2. Customer is assigned to a sales representative.
3. Customer status can be tracked as prospect/active/closed-type states.
4. Sales are attached to customer records.
5. Reminders and notes are associated with customer activity.
6. Customer data appears in dashboards and agreement PDFs.

Strengths:

- Captures operational customer context.
- Supports sales representative ownership.
- Allows practical search, sort, and filtering.
- Supports customer order history and reorder workflows.

Production gaps:

- No unique server-side customer identity.
- No duplicate detection.
- No company/contact normalization in the live MVP.
- No account ownership rules.
- No customer activity audit trail beyond browser-local activity data.

The proposed PostgreSQL schema handles this well through `companies`, `company_contacts`, and `company_social_accounts`.

## 7. Sales Workflow Analysis

The sales workflow is specialized and valuable. The frontend supports:

- Mailer sales.
- Digital services.
- Social media management.
- Paid ads.
- Website work.
- Geofencing.
- Print projects.
- Payment method capture.
- Design/mailing flags.
- Sale edit/delete/reorder.
- Department notification recommendations.

The current sales data model is flexible but informal. Sale records store mixed fields and nested `productDetails` objects. This works for an MVP, but a production platform should normalize sale details by category, as proposed in the SQL schema:

- `sales`
- `sale_mailer_details`
- `sale_digital_details`
- `sale_print_details`
- `sale_social_media_details`
- `sale_website_details`
- `sale_paid_ads_details`
- `sale_geofencing_details`
- `sale_services`

This is the correct direction because it avoids one oversized sales table with dozens of nullable fields.

## 8. PDF & Agreement System

Current implementation:

- Uses jsPDF in the browser.
- Generates an Avidsphere advertising agreement PDF.
- Includes customer information, products purchased, pricing, payment method, and signature area.
- Allows download of a generated PDF.
- Opens a `mailto:` email draft and instructs the user to manually attach the PDF.
- Captures handwritten signature from a canvas and stores it as a base64 image inside the sale object in `localStorage`.

Strengths:

- Good MVP experience.
- Practical for in-person/iPad signing.
- Signature appears in generated PDFs if saved.
- PDF generation is immediate and does not require server infrastructure.

Risks:

- Browser-generated agreements are not audit-grade.
- Signature data is stored locally with no immutable audit trail.
- There is no signed document hash, signer identity verification, or tamper-evident storage.
- Emailing depends on manual attachment, which creates operational risk.
- Browser PDF generation can vary across devices and browsers.

Production recommendation:

Move agreement generation to a backend document service. Store versioned PDFs in object storage, hash final documents, record signer IP/device/timestamp, and send agreement emails with server-attached PDFs. Consider DocuSign/Dropbox Sign for legally rigorous external signing, or build internal e-signature only if legal requirements are well understood.

## 9. Notification System

Current implementation:

- Browser-local in-app notifications.
- Department-specific routing functions for management, design, digital, print, social, and geofencing teams.
- Optional backend email calls to Resend endpoints.
- Notification filters, read state, deletion, and history stored in `localStorage`.

Backend implementation:

- Express routes exist for:
  - `/api/send-management-email`
  - `/api/send-designer-email`
  - `/api/send-social-email`
  - `/api/send-print-email`
  - `/api/send-digital-email`
  - `/api/send-geofencing-email`
  - `/api/send-agreement-email`
  - `/api/send-test-email`

Risks:

- No authentication on email endpoints.
- CORS allows any origin.
- Email recipient addresses are hardcoded.
- Request bodies are logged, potentially exposing customer data.
- No queue, retry system, bounce handling, or delivery audit.

Production recommendation:

Create a `notifications` table-backed service with role/user recipients, delivery status, retry policy, preferences, and audit trails. Add authentication and input validation to notification routes.

## 10. Pricing System

Current pricing logic:

- Mailer rates are hardcoded in `MAILER_PRICING_RATES`.
- Mailer pricing calculates base rate, runtime subtotal, discount, design fee, design change fee, and total.
- Digital pricing calculates service price minus discount.
- Print pricing calculates project price plus design fee minus discount.
- Discounts support fixed dollar and percentage values.

Strengths:

- Clear and fast user experience.
- Price logic is already centralized in named functions.
- Validation prevents invalid discount percentages and obvious pricing errors.

Risks:

- Pricing is client-side and can be modified by anyone in the browser.
- No versioning of pricing rules.
- No approval flow for discounts.
- No tax, margin, commission, or quote expiration model.
- Hardcoded mailer rates require code deployment for price changes.

Production recommendation:

Move pricing rules to backend-owned tables and services. Add quote snapshots so historical agreements preserve the exact pricing logic used at the time of sale.

## 11. Authentication Readiness

Current implementation:

- No real login system.
- The UI has a `currentRole` dropdown.
- Role selection changes displayed role access but does not secure data or actions.

Planned implementation:

- `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, and `user_sessions` exist in the proposed schema.
- `BACKEND_IMPLEMENTATION.js` includes JWT/bcrypt examples.

Readiness:

The design is directionally sound, but authentication is not implemented in the working CRM. Production should use a proven auth provider or a carefully implemented backend auth system with secure cookies/JWTs, password policies, MFA readiness, refresh token rotation, session revocation, and rate limiting.

## 12. Role-Based Permission Readiness

The proposed RBAC model is a strong foundation. It includes resource/action permissions such as:

- `customers.create`
- `customers.read`
- `sales.approve`
- `invoices.update`
- `payments.create`
- `users.manage`
- `reports.view`

Current gap:

The live frontend role model is informational only. Users can switch roles locally. There is no server-side enforcement.

Production recommendation:

Implement permission checks at the API layer and hide/disable frontend controls based on server-returned permissions. Never rely on frontend role checks for security.

## 13. Multi-User Readiness

Current readiness is low because `localStorage` is isolated per browser/device. Two users cannot share real-time state, and edits on one iPad will not automatically appear on another.

Production requirements:

- PostgreSQL as source of truth.
- Authenticated API endpoints.
- Optimistic concurrency control using `updated_at` or version columns.
- Server-side audit logging.
- WebSocket or polling-based live updates for notifications and shared workflow.
- Clear conflict handling for simultaneous edits.

## 14. Multi-iPad Readiness

The MVP is browser-friendly and likely usable on iPad because it is responsive and includes touch-based signature capture. However, multi-iPad business readiness is not present yet because data is local to each iPad/browser.

The proposed schema includes:

- `user_sessions`
- `device_registrations`
- device type metadata
- push token fields

This is useful for future iPad support. Additional requirements include offline queueing, conflict resolution, mobile session expiration, device revocation, and responsive QA across Safari iPad sizes.

## 15. QuickBooks Integration Readiness

The database design includes QuickBooks-ready fields and tables:

- `companies.quickbooks_id`
- `invoices.quickbooks_id`
- `payments.quickbooks_id`
- `quickbooks_sync_logs`
- `quickbooks_config`

The architecture documentation correctly recommends a queue-based sync model. This is appropriate because accounting integration should not block normal CRM workflows.

Critical concerns:

- QuickBooks OAuth tokens should not be stored in plaintext.
- Intuit API base paths and payloads need to be verified against the current QuickBooks Online API before implementation.
- Customer/invoice/payment mappings require reconciliation logic.
- Webhook verification must be mandatory.
- Duplicate sync prevention and idempotency keys are required.
- Accounting ownership should be clear: CRM may create invoices, but QuickBooks remains financial system of record unless leadership decides otherwise.

Readiness:

Good conceptual readiness, low implementation readiness.

## 16. SaaS Readiness

Current SaaS readiness is low. The product is an excellent MVP but not yet a SaaS platform.

Missing SaaS capabilities:

- Tenant model.
- Real user accounts.
- Secure authentication.
- Billing/subscription model.
- Production database.
- API authorization.
- Observability.
- Backups.
- CI/CD.
- Environment separation.
- Terms/privacy/compliance posture.
- Admin console.
- Data export/import.
- Support tooling.

If this remains internal Avidsphere software, a single-tenant production architecture is sufficient. If sold externally as SaaS, add tenant isolation from the beginning.

## 17. Deployment Readiness

Current deployment state:

- Frontend can likely be served as static files.
- Backend can run with `node server.js`.
- Backend `.env` exists.
- No production process manager configuration.
- No Dockerfile.
- No CI/CD pipeline.
- No automated tests.
- No database migrations.
- No infrastructure-as-code.

The deployment guide proposes AWS RDS, EC2, ALB, S3, CloudWatch, and backups. This is a reasonable production direction, but it is documentation rather than implemented deployment infrastructure.

## 18. Database Migration Readiness

The proposed schema is comprehensive and mostly well normalized. It is suitable as a strong draft for production database design.

Strengths:

- UUID primary keys.
- RBAC tables.
- Company/contact separation.
- Type-specific sale detail tables.
- Invoices and line items.
- Payments.
- Agreements, signatories, signatures, documents.
- Notifications and preferences.
- Activity and audit logs.
- QuickBooks sync log.
- Device/session support.
- Useful indexes and views.

Concerns:

- Schema file contains `INSERT` seed statements mixed with DDL; production migrations should separate schema and seeds.
- There is no migration tool such as Prisma, Knex, Drizzle, Flyway, or Liquibase.
- Some constraints and views need review before execution.
- `company_activity_view` appears to use `SUM(CASE WHEN s.status IN (...) THEN s.id ELSE NULL END)`, which is not appropriate for UUID values and should likely be a count.
- `invoices` does not include `is_deleted`, but sample backend queries reference `is_deleted = false` on invoices.
- `payments.created_by UUID NOT NULL REFERENCES users(id)` conflicts with webhook examples that insert `created_by = NULL`.
- `agreements.create` permission is used in backend examples but not inserted in the permissions seed list.
- `signature_ip_address` is in `agreement_signatories`, but one architecture example queries it from `signatures`.
- QuickBooks config lacks tenant/user scoping and encrypted secret handling.
- Several text fields should become structured arrays or child tables for reporting.

Migration recommendation:

Create a migration plan from `localStorage` JSON to PostgreSQL. Build import scripts that normalize customers, sales, reminders, signatures, and notifications. Treat historical browser data as untrusted input and validate it before import.

## 19. Technical Debt Analysis

Major technical debt:

- `script.js` is a large monolithic file of roughly 190 KB.
- Business logic, UI rendering, state management, pricing, PDF generation, notifications, and persistence are tightly coupled.
- Browser storage is the live database.
- Backend only handles emails.
- Production database code exists as planning documents, not integrated implementation.
- No automated tests.
- No linting/formatting pipeline.
- No API contract.
- No centralized validation schema.
- No real auth/permissions.
- Hardcoded email addresses and pricing values.
- Sensitive request data is logged.

Recommended refactor path:

1. Preserve current frontend UX.
2. Extract domain services for pricing, sale normalization, notifications, and agreement generation.
3. Build backend API endpoints matching current workflows.
4. Migrate data from `localStorage`.
5. Replace local writes with API calls.
6. Add tests around pricing, sales creation, agreement generation, and permissions.

## 20. Security Concerns

Critical security risks:

- No authentication protecting CRM data.
- Role dropdown can be changed by any user.
- Customer and signature data are stored in browser storage.
- Email API endpoints are unauthenticated.
- CORS allows any origin.
- Backend logs full request bodies.
- No rate limiting.
- No CSRF strategy.
- No input validation beyond basic payload shape.
- No encryption strategy for QuickBooks tokens.
- No audit-grade document/signature storage.

Production security baseline:

- Authenticated API.
- HTTPS only.
- Secure cookies or hardened token handling.
- Password hashing or managed auth provider.
- Server-side RBAC.
- Input validation with schemas.
- Rate limiting.
- Sanitized logging.
- Secret management.
- Encrypted database backups.
- Object storage access controls.
- Audit logs for critical actions.

## 21. Performance Concerns

Current MVP performance is acceptable for small demo datasets because all data is local. It will degrade as browser data grows because filtering, rendering, reporting, and PDF logic all run on the client.

Production performance risks:

- Large `localStorage` payloads.
- Full-table client rendering.
- No pagination in live frontend data.
- PDF generation on lower-powered iPads.
- Email calls made directly from browser workflows.
- No background job infrastructure.

Production fixes:

- Server-side pagination and filtering.
- Indexed PostgreSQL queries.
- Background jobs for PDF/email/QuickBooks.
- Cached dashboard summaries.
- Lazy loading for customer histories.
- Performance monitoring.

## 22. Scalability Analysis

For a 5-25 user internal CRM, the proposed PostgreSQL architecture is more than sufficient if implemented well. PostgreSQL plus a Node API can comfortably handle the expected workload.

Primary scaling bottlenecks are not database capacity; they are architecture maturity:

- No centralized data store in the live app.
- No concurrency controls.
- No background workers.
- No observability.
- No deployment automation.
- No tenant model if sold externally.

For external SaaS, additional scalability needs include tenant isolation, per-tenant billing, background worker queues, object storage, feature flags, support/admin tooling, and usage analytics.

## 23. Recommended Future Architecture

Recommended application architecture:

```text
Web/iPad Frontend
  -> API Gateway or Express/Fastify backend
  -> Auth service
  -> CRM domain services
     -> Customer service
     -> Sales service
     -> Pricing service
     -> Agreement service
     -> Notification service
     -> Reminder service
     -> QuickBooks sync service
  -> PostgreSQL
  -> Redis/job queue
  -> S3-compatible document storage
  -> Email provider
  -> QuickBooks Online
```

Recommended code structure:

```text
frontend/
  components/
  pages/
  services/api/
  domain/pricing/
  domain/agreements/

backend/
  src/
    auth/
    customers/
    sales/
    pricing/
    reminders/
    notifications/
    agreements/
    quickbooks/
    database/
    jobs/
```

## 24. Recommended Deployment Architecture

Internal production option:

```text
Static frontend: Cloudflare Pages, Vercel, Netlify, or S3/CloudFront
API: Render, Railway, Fly.io, ECS, or EC2
Database: Managed PostgreSQL
Files: S3-compatible object storage
Email: Resend
Monitoring: Sentry plus provider logs
Backups: automated database snapshots and object versioning
```

More robust AWS option:

```text
Route 53
  -> CloudFront
  -> Static frontend on S3
  -> Application Load Balancer
  -> ECS/Fargate or EC2 Node API
  -> RDS PostgreSQL Multi-AZ
  -> S3 for PDFs/signatures
  -> SQS for background jobs
  -> CloudWatch/Sentry for monitoring
```

## 25. Commercialization Readiness

The product has promising commercialization potential because it focuses on an advertising/media sales workflow that generic CRMs do not handle well. The specialized value includes mailer pricing, digital campaign intake, print specs, department notifications, agreement PDFs, and iPad signature workflows.

Commercial blockers:

- No SaaS tenant model.
- No production auth.
- No shared database.
- No billing/subscription model.
- No onboarding/admin tooling.
- No data import/export story.
- No production support/monitoring.
- Legal review needed for e-signature and agreement handling.

Commercialization recommendation:

First make it a stable internal production system. Then decide whether to productize externally. External SaaS should not be attempted until tenancy, compliance, support, billing, and deployment automation are designed intentionally.

## 26. Suggested Development Roadmap

Phase 1: Stabilize MVP and preserve current workflows

- Freeze current workflow behavior.
- Document current data shapes from `localStorage`.
- Add frontend regression tests for pricing and agreement generation.
- Remove sensitive logging.
- Restrict CORS on the backend.
- Move hardcoded email recipients to environment/config.

Phase 2: Build production backend foundation

- Create real backend project structure.
- Add PostgreSQL migration tooling.
- Implement users, roles, permissions, sessions.
- Implement customer, sales, reminder, notification APIs.
- Add request validation.
- Add audit logging.
- Add test suite.

Phase 3: Migrate data and replace browser persistence

- Build importer for existing `localStorage` data.
- Replace direct `localStorage` writes with API writes.
- Keep `localStorage` only for UI preferences and draft/offline support.
- Add pagination/search endpoints.
- Add optimistic locking.

Phase 4: Production agreements and notifications

- Move PDF generation server-side or to a controlled document service.
- Store signed documents in object storage.
- Record signature audit metadata.
- Send server-attached agreement emails.
- Add notification preferences and delivery logs.

Phase 5: QuickBooks and finance

- Implement QuickBooks OAuth.
- Encrypt tokens.
- Build customer/invoice/payment sync workers.
- Add webhook verification.
- Add reconciliation screens.
- Define accounting system of record rules.

Phase 6: Deployment and operations

- Create staging and production environments.
- Add CI/CD.
- Add backups and restore testing.
- Add monitoring, alerting, and error tracking.
- Add admin user management.
- Perform security review.
- Train staff and launch.

## Final Assessment

Avidsphere CRM is a strong domain-specific MVP with real product insight. Its main value is the workflow design, not the current technical infrastructure. The product is ready to be presented as a promising internal CRM prototype and production architecture candidate. It should not yet be presented as a production SaaS platform.

The recommended path is straightforward: preserve the current workflow, implement the PostgreSQL/API/auth foundation, move business rules server-side, add audit-grade agreement and notification handling, then deploy as a secure internal platform. After that, leadership can evaluate whether to commercialize it as a vertical SaaS product.
