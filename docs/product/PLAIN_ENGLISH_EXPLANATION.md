# Avidsphere CRM Plain English Explanation

Date: June 7, 2026  
Audience: Non-technical founder

## 1. Executive Summary

This CRM is a working prototype of how Avidsphere could manage customers, sales, reminders, notifications, advertising agreements, pricing, and team handoffs. It is not just a generic database. It understands Avidsphere-specific work like mailers, print jobs, social media, paid ads, websites, geofencing, design requests, and agreement PDFs.

The important thing to understand is this:

The product idea is strong, but the current software is still an MVP. Today, most CRM data is saved inside the browser on one device. That is fine for testing and demos, but it is not enough for a real multi-user company system. To become production software, the CRM needs a real database, login system, permissions, backups, and a proper server.

## 2. Current Architecture

Right now, the system has three main parts:

1. The screen you use in the browser.
2. A small backend that sends email notifications.
3. A set of database and deployment documents that describe the future production version.

In simple terms:

```text
Current MVP:
Your browser
  -> saves CRM data in that browser
  -> generates PDFs in that browser
  -> can ask the email backend to send notifications
```

Future production version:

```text
Production CRM:
Your browser or iPad
  -> logs into secure backend
  -> backend saves data in PostgreSQL database
  -> backend controls permissions
  -> backend sends emails and PDFs
  -> backend syncs invoices/payments with QuickBooks
```

## 3. Current Tech Stack

The current app uses:

- HTML for the page structure.
- CSS for the design.
- JavaScript for the CRM behavior.
- Browser storage called `localStorage` for saved customer/sales/reminder data.
- jsPDF to create PDF agreements.
- A small Node.js/Express backend for email notifications.
- Resend as the email-sending service.

The future plan uses:

- PostgreSQL as the real database.
- Node.js/Express as the real backend.
- User accounts and roles.
- QuickBooks integration.
- Cloud hosting.
- File storage for PDFs and signed agreements.

## 4. Data Flow Analysis

Today, when you add a customer or sale, the CRM saves it inside your browser. That is like saving a document on one computer instead of saving it to a shared company system.

This is useful for a prototype because it is fast and easy. But for production, it creates problems:

- Another iPad will not automatically see the same data.
- Another employee will not have the same records.
- Clearing browser data can delete records.
- There is no central backup.
- There is no real security around who can see or change records.

The future version should save records in a real database. The browser should only display and edit the data, not be the main place where company data lives.

## 5. CRM Workflow Analysis

The CRM already supports the core business flow:

```text
Create customer
  -> record sale
  -> calculate price
  -> notify the right teams
  -> create agreement PDF
  -> collect signature
  -> schedule reminders
  -> show dashboard/reporting
```

That is a big strength. The software reflects how Avidsphere actually works.

The next step is to make those workflows reliable for multiple people at once.

## 6. Customer Lifecycle Analysis

The customer system lets the team track:

- Business name.
- Contact person.
- Email.
- Phone.
- Address.
- Sales representative.
- Customer status.
- Notes.
- Social links.
- Order history.

In plain English, the CRM is trying to become the main customer memory for the company.

The risk is that this customer memory currently lives inside one browser unless moved to a real database.

## 7. Sales Workflow Analysis

The sales area is one of the most valuable parts of the CRM. It supports different Avidsphere product types:

- Mailers.
- Digital campaigns.
- Social media management.
- Paid ads.
- Websites.
- Geofencing.
- Print jobs.

Each type asks for different information. For example, a mailer needs area, month, ad size, and runtime. A digital campaign needs service type, targeting, budget, and start date. A print job needs size, quantity, finish, fold, and design fee.

This is good because generic CRMs usually do not understand these details.

## 8. PDF & Agreement System

The CRM can generate an advertising agreement PDF. It can include:

- Customer details.
- Product sold.
- Pricing.
- Payment method.
- Notes.
- Signature area.

It can also collect a handwritten signature using a canvas, especially useful on an iPad.

The current version is good for demos and internal testing. For production, signed agreements should be stored on the server with a permanent record of:

- Who signed.
- When they signed.
- What device they used.
- The exact final PDF they signed.
- Whether the document changed afterward.

That protects the business.

## 9. Notification System

The CRM can create notifications for teams like:

- Management.
- Design.
- Print.
- Digital.
- Social media.
- Geofencing.

It can also send emails through the backend.

Today, most notifications are browser-local. That means they work in the prototype, but they are not yet a true company-wide notification system.

In production, notifications should be saved in the database and assigned to real users or teams.

## 10. Pricing System

The app already calculates pricing for:

- Mailers.
- Digital services.
- Print jobs.

It handles things like:

- Base price.
- Number of months.
- Discounts.
- Design fees.
- Final total.

This is useful and should be preserved.

For production, pricing should move to the backend so users cannot accidentally or intentionally change the calculation in the browser. Price rules should also be versioned so the company knows what pricing rule was used for each agreement.

## 11. Authentication Readiness

Authentication means logging in.

Right now, there is no real login system. The app has a role dropdown, but that is only for demonstration. A user can choose a role from the screen. That does not protect data.

Production needs:

- Real usernames and passwords.
- Password reset.
- Session expiration.
- Admin user management.
- Optional multi-factor authentication later.

## 12. Role-Based Permission Readiness

Permissions decide what each person can do.

Example:

- Sales can create customers and sales.
- Management can approve and view reports.
- Finance can manage invoices and payments.
- Admin can manage users.

The database plan already includes a good permission design. But the working app does not enforce it yet.

In production, permissions must be checked by the backend, not just the screen.

## 13. Multi-User Readiness

Multi-user means several people can use the CRM at the same time and see the same information.

The current MVP is not ready for that because data is saved in each browser separately.

To support multiple users, the CRM needs:

- One shared database.
- A backend API.
- Real user accounts.
- Rules for when two people edit the same record.
- Activity logs showing who changed what.

## 14. Multi-iPad Readiness

The app is promising for iPads because:

- It is browser-based.
- It has responsive styling.
- It supports touch signatures.

But multiple iPads need a shared database. Otherwise, iPad A and iPad B may each have different customer lists.

The future database plan includes device sessions, which is good. That would let the company track which iPads are logged in and revoke access if a device is lost.

## 15. QuickBooks Integration Readiness

QuickBooks integration means the CRM can send accounting-related records to QuickBooks.

The usual flow would be:

```text
Sale created in CRM
  -> invoice created in CRM
  -> invoice sent to QuickBooks
  -> payment recorded in QuickBooks
  -> CRM receives payment update
```

The database plan already includes QuickBooks IDs and sync logs. That is good planning.

But the actual QuickBooks integration is not built yet. It still needs:

- QuickBooks OAuth login.
- Secure token storage.
- Customer syncing.
- Invoice syncing.
- Payment syncing.
- Webhook verification.
- Duplicate prevention.

## 16. SaaS Readiness

SaaS means software hosted online where users log in from anywhere.

The CRM is not yet a SaaS product. It is an MVP that can become one.

To become SaaS, it needs:

- Cloud hosting.
- Real login.
- A production database.
- Backups.
- Monitoring.
- Admin tools.
- Billing if sold externally.
- Tenant separation if multiple companies use it.

If Avidsphere only uses it internally, the build is simpler. If Avidsphere wants to sell it to other companies, the architecture must be designed more carefully.

## 17. Deployment Readiness

Deployment means putting the software online so the team can use it reliably.

Today:

- The frontend can likely be opened or hosted as static files.
- The backend can run locally with Node.
- There is no full production deployment setup yet.

Production needs:

- A hosted frontend.
- A hosted backend.
- A managed database.
- SSL/HTTPS.
- Backups.
- Monitoring.
- Error tracking.
- A way to deploy updates safely.

## 18. Database Migration Readiness

Database migration means moving from browser-saved data to a real database.

The project already has a strong proposed PostgreSQL database design. That is a very good start.

The migration work still needs to happen:

1. Export existing browser data.
2. Clean and validate it.
3. Convert customer records into database company/contact records.
4. Convert sales into the right sales tables.
5. Move reminders and notifications.
6. Move agreement/signature records carefully.

This should be done with scripts and tested before real company data is trusted.

## 19. Technical Debt Analysis

Technical debt means shortcuts that helped build the MVP quickly but need to be cleaned up before production.

Main technical debt:

- One very large `script.js` file handles almost everything.
- Data is stored in the browser.
- There is no real authentication.
- There is no real permission enforcement.
- The backend only sends emails.
- Email addresses are hardcoded.
- Pricing is calculated in the browser.
- There are no automated tests.
- There is no deployment pipeline.

This is normal for an MVP. It becomes dangerous only if the company tries to use it as production software without rebuilding the foundation.

## 20. Security Concerns

The main security issue is that the CRM does not yet have real protection around company data.

Production must protect:

- Customer records.
- Sales records.
- Pricing.
- Agreements.
- Signatures.
- Email notifications.
- QuickBooks tokens.

Security work needed:

- Real login.
- Backend permissions.
- HTTPS.
- Secure password handling.
- Encrypted secrets.
- Safer logging.
- Restricted email endpoints.
- Backups.
- Audit logs.

## 21. Performance Concerns

The MVP should feel fast with small data because everything is local. But if the company adds many customers, sales, reminders, and PDFs, the browser could slow down.

Production should use:

- Database search.
- Pagination.
- Server-side reports.
- Background jobs for heavy work.
- Cached dashboard summaries.

## 22. Scalability Analysis

For Avidsphere internal use with 5-25 users, the planned PostgreSQL architecture is enough.

The challenge is not raw size. The challenge is moving from one-browser storage to a real shared system.

Once that is done, scaling to a small team should be very manageable.

Selling it as SaaS to many companies is a bigger step. That requires tenant separation, billing, support tools, and stronger operations.

## 23. Recommended Future Architecture

The recommended future system is:

```text
User on browser/iPad
  -> logs into CRM
  -> backend checks permissions
  -> backend saves records in PostgreSQL
  -> backend creates PDFs/emails
  -> backend syncs accounting data with QuickBooks
```

The browser should become the user interface. The backend and database should become the source of truth.

## 24. Recommended Deployment Architecture

For a practical internal launch:

- Host the frontend online.
- Host the backend online.
- Use managed PostgreSQL.
- Store PDFs/signatures in cloud file storage.
- Use Resend for email.
- Add monitoring and backups.

This does not need to be overcomplicated at first. The most important thing is reliable data, secure access, and backups.

## 25. Commercialization Readiness

The CRM has commercial potential because it solves specific advertising workflow problems.

Its valuable features are:

- Advertising-specific sales intake.
- Mailer pricing.
- Print specs.
- Digital campaign details.
- Team notifications.
- Agreement PDFs.
- iPad signatures.

But it is not ready to sell yet.

Before selling externally, it needs:

- Multi-company account separation.
- Billing.
- Onboarding.
- Admin tools.
- Support tools.
- Strong security.
- Legal review for agreements/signatures.

The best path is to make it excellent for Avidsphere first, then decide whether it should become a product for other businesses.

## 26. Suggested Development Roadmap

Step 1: Protect the MVP

- Keep the current workflow.
- Document the current data.
- Remove unsafe logging.
- Move email recipients into settings.
- Add simple tests for pricing.

Step 2: Build the real backend

- Add PostgreSQL.
- Add login.
- Add permissions.
- Add customer and sales APIs.
- Add reminders and notifications APIs.

Step 3: Move data out of the browser

- Import existing browser data into PostgreSQL.
- Replace browser-only saving with backend saving.
- Keep browser storage only for drafts and preferences.

Step 4: Upgrade agreements

- Generate/store PDFs on the server.
- Save signatures with audit information.
- Email agreements with automatic attachments.

Step 5: Add QuickBooks

- Connect QuickBooks securely.
- Sync customers, invoices, and payments.
- Track sync errors.
- Add payment reconciliation.

Step 6: Launch production

- Set up hosting.
- Set up backups.
- Set up monitoring.
- Train the team.
- Move real operations into the system.

## Final Plain English Assessment

This CRM is a strong prototype with a real business brain. It already understands much of how Avidsphere sells and manages advertising work.

But today it is still like a very smart workbook living inside a browser. To become real company software, it needs to move into a shared, secure, backed-up system with a database, login, permissions, and cloud deployment.

The good news: the project already contains a thoughtful database plan. The next phase is not inventing the product from scratch. It is turning the existing workflow into a reliable production platform.
