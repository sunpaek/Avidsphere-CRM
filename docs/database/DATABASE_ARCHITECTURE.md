# AVIDSPHERE CRM - PRODUCTION DATABASE ARCHITECTURE

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Schema Design Decisions](#schema-design-decisions)
5. [Multi-iPad & Multi-User Strategy](#multi-ipad--multi-user-strategy)
6. [Authentication & Authorization](#authentication--authorization)
7. [Sales Module Architecture](#sales-module-architecture)
8. [Invoicing & Payment Processing](#invoicing--payment-processing)
9. [Agreements & E-Signature Strategy](#agreements--e-signature-strategy)
10. [QuickBooks Integration Strategy](#quickbooks-integration-strategy)
11. [Performance & Optimization](#performance--optimization)
12. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

This production-ready PostgreSQL database architecture is designed to support:
- **5-25 concurrent users** with role-based access control
- **Multiple iPad deployments** with device management and session tracking
- **Complete CRM lifecycle**: customers → opportunities → sales → invoicing → payments
- **Real-time collaboration** across sales team, management, finance, and design teams
- **Compliance & audit trails** with comprehensive activity logging
- **QuickBooks integration** with bidirectional sync capabilities
- **E-signature workflows** with audit-safe signature storage

---

## Architecture Overview

### Core Principles
1. **Normalization**: 3NF design to prevent data anomalies
2. **Separation of Concerns**: Dedicated schemas for auth, sales, invoicing, agreements
3. **Auditability**: Comprehensive logging of all changes with user attribution
4. **Scalability**: Properly indexed for queries on 5-25 users × 100-1000s of records
5. **Device Support**: Native iPad and multi-device session management
6. **Integration Ready**: QB sync queue, webhook support, API-friendly design

### Schema Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  VIEWS & MATERIALIZED VIEWS (Active Users, Pipeline, etc)  │
├─────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                      │
│  • Stored Procedures (Calculations, Permissions)            │
│  • Triggers (Timestamps, Constraints)                       │
│  • Functions (Activity Logging)                             │
├─────────────────────────────────────────────────────────────┤
│                    DATA MODEL LAYER                          │
│  ├── Authentication (Users, Roles, Permissions)             │
│  ├── Core Entities (Companies, Contacts, Social)            │
│  ├── Sales (Opportunities, Sales, Service Details)          │
│  ├── Financial (Invoices, Line Items, Payments)             │
│  ├── Legal (Agreements, Signatories, Signatures)            │
│  ├── Workflow (Reminders, Notifications)                    │
│  ├── Integration (QB Sync, Device Sessions)                 │
│  └── Audit (Activity Logs, Audit Logs)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram

### High-Level ERD (Mermaid Format)

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : "has"
    ROLES ||--o{ USER_ROLES : "assigned"
    ROLES ||--o{ ROLE_PERMISSIONS : "includes"
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : "granted"
    
    USERS ||--o{ COMPANIES : "creates"
    USERS ||--o{ ACTIVITY_LOGS : "performs"
    USERS ||--o{ REMINDERS : "assigned"
    USERS ||--o{ OPPORTUNITIES : "manages"
    USERS ||--o{ SALES : "creates"
    USERS ||--o{ USER_SESSIONS : "has"
    
    COMPANIES ||--o{ COMPANY_CONTACTS : "has"
    COMPANIES ||--o{ COMPANY_SOCIAL_ACCOUNTS : "has"
    COMPANIES ||--o{ OPPORTUNITIES : "has"
    COMPANIES ||--o{ SALES : "generates"
    COMPANIES ||--o{ INVOICES : "receives"
    COMPANIES ||--o{ PAYMENTS : "makes"
    COMPANIES ||--o{ AGREEMENTS : "signs"
    COMPANIES ||--o{ REMINDERS : "relates to"
    
    OPPORTUNITIES ||--o{ SALES : "converts to"
    
    SALES ||--|| SALE_MAILER_DETAILS : "has"
    SALES ||--|| SALE_DIGITAL_DETAILS : "has"
    SALES ||--|| SALE_PRINT_DETAILS : "has"
    SALES ||--|| SALE_SOCIAL_MEDIA_DETAILS : "has"
    SALES ||--|| SALE_WEBSITE_DETAILS : "has"
    SALES ||--|| SALE_PAID_ADS_DETAILS : "has"
    SALES ||--|| SALE_GEOFENCING_DETAILS : "has"
    SALES ||--o{ SALE_SERVICES : "includes"
    SALES ||--o{ INVOICES : "invoiced as"
    SALES ||--o{ AGREEMENTS : "requires"
    
    INVOICES ||--o{ INVOICE_LINE_ITEMS : "contains"
    INVOICES ||--o{ PAYMENTS : "paid by"
    
    AGREEMENTS ||--o{ AGREEMENT_SIGNATORIES : "requires"
    AGREEMENT_SIGNATORIES ||--|| SIGNATURES : "has"
    AGREEMENTS ||--o{ AGREEMENT_DOCUMENTS : "contains"
    
    REMINDERS ||--o{ RECURRING_REMINDERS : "can recur"
    
    NOTIFICATIONS ||--o{ USERS : "sent to"
    NOTIFICATION_PREFERENCES ||--|| USERS : "configured by"
    
    QUICKBOOKS_SYNC_LOGS ||--o{ SALES : "syncs"
    QUICKBOOKS_SYNC_LOGS ||--o{ INVOICES : "syncs"
    QUICKBOOKS_SYNC_LOGS ||--o{ PAYMENTS : "syncs"
    
    USER_SESSIONS ||--|| USERS : "for"
    DEVICE_REGISTRATIONS ||--|| USERS : "for"
```

### Detailed Table Relationships

#### Authentication & Authorization Flow
```
User (email, password_hash)
  ├─ User_Roles (N:M mapping)
  │   └─ Roles (Admin, Sales Staff, Management, etc)
  │       └─ Role_Permissions (N:M mapping)
  │           └─ Permissions (resource:action pairs)
  └─ User_Sessions (multiple active sessions per device)
      └─ Device_Registrations (push tokens, device trust)
```

#### Company & Sales Flow
```
Companies (master customer record)
  ├─ Company_Contacts (billing, technical, etc)
  ├─ Company_Social_Accounts (platforms & handles)
  ├─ Opportunities (sales pipeline)
  │   └─ Sales (converted to actual sales)
  │       ├─ Sale_[Type]_Details (Mailer|Digital|Print|Social|Website|Paid Ads|Geofencing)
  │       ├─ Sale_Services (Design, Design Changes, Mailing)
  │       ├─ Invoices (1 sale → 1 or more invoices)
  │       └─ Agreements (service contracts)
  └─ Reminders (follow-ups related to company)
```

#### Financial Flow
```
Sales
  └─ Invoices (linked 1:1 or as summary)
      ├─ Invoice_Line_Items (services/products on invoice)
      └─ Payments (payments received)
          └─ QuickBooks_Sync_Logs (sync status)
```

#### E-Signature Flow
```
Agreements
  ├─ Agreement_Signatories (who needs to sign)
  │   └─ Signatures (actual signature data)
  └─ Agreement_Documents (versioned PDF storage)
```

---

## Schema Design Decisions

### 1. Primary Keys (UUID vs Serial INT)
**Decision**: UUIDs (uuid4) as PRIMARY KEYs
**Rationale**:
- Distributed: Can generate IDs offline (critical for iPad app)
- Privacy: URLs/IDs don't reveal cardinality
- Multi-region ready: No ID coordination needed
- GDPR compliant: No sequential guess attacks
- PostgreSQL native: `gen_random_uuid()` is cryptographically sound

### 2. Soft Deletes vs Hard Deletes
**Decision**: Soft delete pattern with `is_deleted` flag
**Why**:
- Financial audits require historical records
- Regulatory compliance (maintain 7-year records for tax)
- Relationship integrity (don't cascade delete)
- Recovery: Can restore accidentally deleted records

```sql
-- When querying, always filter
WHERE is_deleted = false
```

### 3. Company vs Customer Terminology
**Decision**: Use `companies` as master entity
**Why**:
- More precise terminology (B2B SaaS CRM)
- Includes multi-contact support (company_contacts)
- Supports social account tracking
- Natural mapping to QB customer objects

### 4. Sales Type Polymorphism
**Decision**: Single `sales` table + type-specific detail tables
**Why**:
- Clean separation of concerns
- Supports filtering by sale_type efficiently
- No NULL columns for unused fields
- Easy to add new sale types without schema change
- Queries remain simple and readable

```sql
-- Query example
SELECT s.*, sd.service_price, sd.monthly_spend
FROM sales s
LEFT JOIN sale_digital_details sd ON s.id = sd.sale_id
WHERE s.sale_type = 'Digital'
```

### 5. Invoice-to-Sales Relationship
**Decision**: `invoices.sale_id` as optional foreign key
**Why**:
- Allows 1:many (sales → invoices) without denormalization
- Supports summary invoices combining multiple sales
- QB integration cleaner with separate invoice records
- Flexible pricing: can adjust amounts during invoicing

### 6. Signature Storage Strategy
**Decision**: Hybrid approach - Base64 + URL support
**Options evaluated**:
- ✅ **Base64 embedded** (default, for iPad offline)
- ✅ **URL reference** (for cloud storage like S3)
- ❌ Binary BLOB (not mobile-friendly)
- ❌ External signing service only (requires internet)

**Implementation**:
```sql
-- For iPad offline
signature_data_type = 'base64'
signature_content = '[base64 PNG of signature pad]'

-- For cloud backup
signature_data_type = 'url'
signature_url = 's3://avidsphere/signatures/[signed]/[date]'
```

### 7. Multi-Device Session Management
**Decision**: `user_sessions` + `device_registrations` split
**Why**:
- Sessions: Temporary, per-login tracking, expiry-based
- Devices: Persistent trust relationships, push tokens
- Supports 5+ devices per user (sales rep has phone + iPad)
- Can disable specific device without logout elsewhere

```sql
-- User has device registered
SELECT COUNT(*) FROM user_sessions
WHERE user_id = $1 AND device_id = $2 AND is_active = true

-- Push notifications target trusted devices
SELECT push_token FROM device_registrations
WHERE user_id = $1 AND is_trusted = true
```

### 8. Activity Logging Strategy
**Decision**: Two-tier logging (activity_logs + audit_logs)
**Separation**:
- **activity_logs**: Everything (read, update, delete, download)
  - High volume, auto-purge after 90 days
  - Use for user behavior analytics
  - Smaller retention for storage efficiency
  
- **audit_logs**: Critical only (create, update_critical_field, delete, sign)
  - Lower volume, 7-year retention
  - Use for compliance/regulatory
  - Include before/after values as JSONB

### 9. QB Sync Architecture
**Decision**: Queue + retry pattern with logging
**Why**:
- Asynchronous: Non-blocking operations
- Auditable: Full sync history traceable
- Retryable: Handle network failures
- Bidirectional: Support data flowing both directions

```sql
quickbooks_sync_logs (
  sync_status: 'Pending' → 'Synced' / 'Failed' → 'Retried'
  sync_direction: 'To QB' / 'From QB' / 'Bidirectional'
  retry_count: Auto-increment on failure
)
```

### 10. Indexing Strategy
**Decision**: Composite indexes on frequently filtered columns
**Primary indexes**:
```sql
-- User lookups
idx_users_email (case-insensitive)
idx_user_sessions_token (session validation)

-- Sales pipeline
idx_sales_status (forecasting queries)
idx_sales_date (monthly reporting)
idx_sales_sales_rep_id (rep performance)

-- Financial
idx_invoices_status (outstanding balance queries)
idx_invoices_due_date (aging reports)
idx_payments_date (cash flow analysis)

-- Notifications
idx_notifications_recipient_id + created_at DESC (inbox queries)
```

---

## Multi-iPad & Multi-User Strategy

### Device Architecture

```
iPad #1 (Sales Rep A)
├─ Device ID: unique_hardware_id_1
├─ Session Token: session_token_1 (expires 24h)
├─ Device Registration: marked as trusted
└─ Push Token: for background notifications

iPad #2 (Sales Rep A, backup)
├─ Device ID: unique_hardware_id_2
├─ Session Token: session_token_2 (separate session)
├─ Device Registration: marked as trusted
└─ Push Token: for background notifications

Shared iPad (Front Desk)
├─ Device ID: shared_ipad_id
├─ Sessions: User1 logs in → User1 Session
│          User1 logs out → Session marked inactive
│          User2 logs in → User2 Session (new device session)
└─ Device Registration: marked as NOT trusted (no persistent access)
```

### Conflict Resolution & Data Sync

**Problem**: Two sales reps edit same customer simultaneously on different iPads

**Solution**: Last-Write-Wins (LWW) with activity logging

```sql
-- Optimistic locking approach
UPDATE companies
SET 
  business_name = $1,
  updated_at = CURRENT_TIMESTAMP,
  updated_by = $2
WHERE id = $3 
  AND updated_at = $4  -- Original timestamp
RETURNING *;

-- If WHERE clause doesn't match, someone else edited it
-- App shows: "Record was modified. Would you like to view changes?"
```

### Offline-First Architecture Recommendations

For iOS app (not implemented in DB, but referenced):

```javascript
// Store important reference data locally
const localCache = {
  companies: [...], // Cached on first load
  users: [...]      // Cached for display
}

// Queue changes while offline
const offlineQueue = [
  { action: 'UPDATE_CUSTOMER', data: {...}, timestamp: now }
]

// On reconnection
await syncOfflineQueue()
  .then(results => updateActivityLogs(results))
  .catch(err => showRetryUI())
```

---

## Authentication & Authorization

### Role Hierarchy

```
Admin (super user)
├─ All permissions
└─ User management

Sales Staff
├─ Create/read/update customers
├─ Create/read/update sales (draft/submitted only)
├─ Create/read reminders
└─ Cannot: approve sales, view finances

Management
├─ Read all customers/sales
├─ Approve/reject sales
├─ View financial summary
└─ Cannot: delete records

Finance
├─ Create/read/update invoices
├─ Record payments
├─ QB sync management
└─ Cannot: edit sales records

Designer / Social / Digital Team
├─ Read related sales
├─ Update task status
└─ Cannot: edit commercial terms
```

### Permission Model

Follows `resource:action` pattern:

```
Resource         | Action        | Used By
─────────────────┼───────────────┼────────────────
customers        | create/read   | Sales Staff+
invoices         | create/update | Finance+
sales            | approve       | Management+
users            | manage        | Admin
settings         | manage        | Admin
reports          | view          | Management+
```

### Implementation Check

Every API endpoint:
```python
@requires_permission('sales.create')
def create_sale(request):
    user_permissions = get_user_permissions(request.user_id)
    if 'sales.create' not in user_permissions:
        raise PermissionDenied()
    # ... create sale
```

---

## Sales Module Architecture

### Sales Type Lifecycle

#### Mailer Sale
```
Mailer Details:
├─ Geographic area
├─ Month/run time
├─ Ad size + monthly rate
├─ Discount structure
└─ Design/mailing services required

Notification Flow:
├─ Sale created → Notify: Management, Designers
├─ Design approved → Notify: Print team
└─ Mailing complete → Notify: Sales rep, Management
```

#### Digital Sale (Multi-Platform)
```
Digital Targeting:
├─ Campaign type (Social, Search, Display, Video)
├─ Platform(s): Meta Ads, Google, TikTok, etc
├─ Targeting: Age, gender, income, location
├─ Duration: Start date + run time
└─ Budget: Monthly spend

Campaign Types:
├─ Social: Facebook, Instagram, TikTok, LinkedIn
├─ Website: Site build/redesign
├─ Paid Ads: Google Ads, Meta Ads Manager
└─ Geofencing: Location-based mobile ads
```

#### Print Sale
```
Print Specifications:
├─ Type: Business cards, flyers, brochures, signage
├─ Specs: Size, quantity, finish, fold, thickness
├─ Design needs: Design fee, revision allowance
└─ Delivery: Standard or rushed

Cost Breakdown:
├─ Design fee (one-time)
├─ Production cost (per quantity)
├─ Design revisions (if needed)
└─ Total investment
```

### Sales Status Workflow

```
Draft → Submitted → Approved → Active → Completed
  ↓        ↓          ↓        ↓        ↓
[Edit]   [Reject]   [Edit]  [Pause]  [Archive]
            ↓
         Cancelled
```

### Service Tracking

Some sales require design or additional services:

```sql
sale_services (
  service_type: 'Design' | 'Design Changes' | 'Mailing' | 'Other'
  is_required: true/false
  amount: cost of service
)

Example:
Sale ID    Service Type       Required  Amount
----       ────────────       ────────  ──────
S001       Design             Yes       $500
S001       Mailing            No        $1500
S002       Design Changes     Yes       $250
```

---

## Invoicing & Payment Processing

### Invoice Generation Strategy

**Rule**: Create invoice when sale moves to "Active" status

```sql
-- Trigger on sales status update
IF sales.status = 'Active' THEN
  INSERT INTO invoices (
    company_id, sale_id, invoice_date, due_date,
    subtotal, tax_amount, total_amount
  ) VALUES (...)
  
  -- Add line items
  INSERT INTO invoice_line_items
    SELECT service name, amount FROM sale_services
    UNION ALL
    SELECT product name, amount FROM sale product details
END IF
```

### Multi-Invoice Support

Single sale can generate multiple invoices:

```sql
-- Large digital campaign: invoice by month
Sale: "12-month Google Ads"
  ├─ Invoice 1: Month 1 charges (Jan)
  ├─ Invoice 2: Month 2 charges (Feb)
  └─ ... Invoice 12: Month 12 charges (Dec)

-- QB Sync friendly: Track individual invoice payment status
```

### Payment Reconciliation

```sql
-- Auto-update invoice status based on payments
UPDATE invoices
SET 
  status = CASE 
    WHEN amount_paid >= total_amount THEN 'Paid'
    WHEN amount_paid > 0 THEN 'Partial'
    WHEN due_date < CURRENT_DATE AND amount_paid = 0 THEN 'Overdue'
    ELSE 'Sent'
  END,
  amount_remaining = total_amount - amount_paid
WHERE id IN (
  SELECT DISTINCT invoice_id FROM payments
  WHERE payment_status = 'Completed'
)
```

### QB Integration Points

```
┌─ AVIDSPHERE ────────────────────────────────────────┐
│  Invoice created                                     │
│  ├─ Insert: invoices, invoice_line_items           │
│  └─ Queue: quickbooks_sync_logs (status='Pending') │
│                                                      │
│  Sync Service (runs every 5 minutes):              │
│  ├─ Read pending QB syncs                          │
│  ├─ POST /api/quickbooks/customers                 │
│  ├─ POST /api/quickbooks/invoices                  │
│  ├─ Update: quickbooks_sync_logs (status='Synced') │
│  └─ Update: invoices.quickbooks_id                 │
└──────────────────────────────────────────────────────┘
        │
        ↓
┌─ QUICKBOOKS ONLINE ──────────────────────────────────┐
│  Invoice synced                                      │
│  ├─ Customer created/updated                        │
│  ├─ Invoice record created in QB                    │
│  └─ QB sends webhook: Payment received              │
│                                                      │
│  Payment received in QB:                            │
│  ├─ POST webhook to /api/webhooks/qb-payment       │
│  └─ Update: payments, invoices.amount_paid         │
└──────────────────────────────────────────────────────┘
```

---

## Agreements & E-Signature Strategy

### Agreement Workflow

```
┌─ Create Agreement ─────────────────────────┐
│ agreement_number: AUTO (e.g., AGR-2026-001)
│ company_id: Selected company
│ sale_id: Related sale (optional)
│ status: 'Draft'
│ created_by: Current user
└────────────────────────────────────────────┘
            ↓
┌─ Add Signatories ──────────────────────────┐
│ Signer 1: John Doe, President
│ Signer 2: Jane Smith, CFO
│ Each gets: email, unique signing link
└────────────────────────────────────────────┘
            ↓
┌─ Upload Document ──────────────────────────┐
│ agreement_documents table:
│ ├─ file_name: 'Service_Agreement_v1.pdf'
│ ├─ file_path: 's3://bucket/agreements/...'
│ ├─ content_hash: 'sha256:...' (for integrity)
│ └─ storage_type: 'local' or 's3'
└────────────────────────────────────────────┘
            ↓
┌─ Send for Signatures ──────────────────────┐
│ status: 'Sent'
│ agreement_signatories.signature_status: 'Pending'
│ Send emails with: Signing link + document preview
└────────────────────────────────────────────┘
            ↓
┌─ Signing (iPad App) ───────────────────────┐
│ Signer opens link → views document
│ Signs on iPad touchscreen (Signature Pad)
│ Capture: signature base64 + metadata
│         (device_type: 'iPad', platform: 'iOS')
└────────────────────────────────────────────┘
            ↓
┌─ Store Signature ──────────────────────────┐
│ signatures table:
│ ├─ signature_data_type: 'base64'
│ ├─ signature_content: 'data:image/png;...'
│ ├─ signature_timestamp: CURRENT_TIMESTAMP
│ ├─ device_type: 'iPad'
│ └─ [Optional] signature_url: (S3 backup URL)
│
│ Update: agreement_signatories
│ ├─ signature_status: 'Signed'
│ ├─ signature_date: CURRENT_TIMESTAMP
│ └─ signature_ip_address: INET from request
└────────────────────────────────────────────┘
            ↓
┌─ Generate Final Document ──────────────────┐
│ If all signers signed:
│ ├─ Combine agreement PDF + signature images
│ ├─ Create: agreement_documents (v2, final)
│ ├─ Store: Local or S3
│ └─ agreement.status: 'Executed'
└────────────────────────────────────────────┘
            ↓
┌─ Archive & Notify ─────────────────────────┐
│ ├─ Email PDF to all signers
│ ├─ Notify: Sales rep, Management
│ ├─ Log: activity_logs (action='Sign')
│ ├─ Audit: audit_logs (before/after values)
│ └─ Send: agreement_number to QB via sync
└────────────────────────────────────────────┘
```

### Signature Security & Compliance

**Off-the-shelf library** recommendation: [SignaturePad.js](http://szimek.github.io/signature_pad/)

```javascript
// iPad HTML5 Canvas approach
const canvas = document.getElementById('signaturePad');
const signaturePad = new SignaturePad(canvas);

canvas.addEventListener('touchend', () => {
  const signatureData = canvas.toDataURL('image/png');
  // Store: signatureData as base64
  
  // Metadata capture
  const metadata = {
    timestamp: Date.now(),
    device: navigator.userAgent,
    platform: 'iOS',
    ipAddress: request.ip
  };
  
  POST /api/agreements/{id}/sign
    body: { signatureData, metadata }
});
```

**Audit Trail**:
```sql
-- Verify signature was captured on specific device at specific time
SELECT 
  asig.signer_name,
  sig.signature_timestamp,
  sig.device_type,
  sig.platform,
  sig.signature_ip_address,
  a.agreement_number
FROM agreement_signatories asig
JOIN signatures sig ON asig.id = sig.signatory_id
JOIN agreements a ON asig.agreement_id = a.id
WHERE a.id = $1;
```

### Document Versioning

```sql
agreement_documents table:
├─ document_version: 1 (draft), 2 (signed), etc
├─ is_current_version: true (only one per agreement)
├─ file_path: Versioned storage path
└─ content_hash: SHA256 for integrity verification

-- Query: Get all versions of an agreement
SELECT file_name, document_version, created_at, created_by
FROM agreement_documents
WHERE agreement_id = $1
ORDER BY document_version DESC;
```

---

## QuickBooks Integration Strategy

### High-Level Architecture

```
AVIDSPHERE (Primary CRM System)
    │
    ├─ OAuth 2.0 Authorization
    │   ├─ Realm ID: QB company ID
    │   ├─ Access Token: Refresh every ~60 min
    │   └─ Refresh Token: Long-lived credential
    │
    ├─ Sync Engine (Background Job: every 5 min)
    │   ├─ Check: quickbooks_sync_logs (status='Pending')
    │   ├─ Transform: AVIDSPHERE objects → QB format
    │   ├─ POST: QB API endpoints
    │   └─ Update: sync status + QB IDs
    │
    └─ Webhook Receiver
        ├─ QB sends: Payments, Payment refunds
        ├─ POST: /api/webhooks/quickbooks
        └─ Update: payments table + invoices.amount_paid

QUICKBOOKS ONLINE (Accounting System)
    │
    ├─ Customers: Synced from companies
    ├─ Invoices: Synced from invoices + sales
    ├─ Payments: Synced TO QB + webhook FROM QB
    └─ Bills: Read from QB (if using QB payables)
```

### Sync Queue Example

```sql
-- Create a sale → Auto-queue for QB sync
INSERT INTO quickbooks_sync_logs (
  sync_type, entity_type, entity_id, quickbooks_id, 
  sync_status, sync_direction, created_at
)
VALUES (
  'Invoice',           -- sync_type
  'invoices',          -- entity_type
  uuid-of-invoice,     -- entity_id
  NULL,                -- quickbooks_id (filled after sync)
  'Pending',           -- sync_status
  'To QB',             -- sync_direction
  CURRENT_TIMESTAMP
);

-- Sync service processes pending items
SELECT * FROM quickbooks_sync_logs
WHERE sync_status = 'Pending'
  AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
LIMIT 50;

-- For each pending:
// 1. Fetch AVIDSPHERE data (invoices, companies)
// 2. Transform to QB format
// 3. POST to QB API
// 4. Store returned QB ID
UPDATE quickbooks_sync_logs
SET 
  quickbooks_id = $1,
  sync_status = 'Synced',
  synced_at = CURRENT_TIMESTAMP
WHERE id = $2;

UPDATE invoices
SET quickbooks_id = $1
WHERE id = $2;
```

### Field Mapping: AVIDSPHERE → QB

| AVIDSPHERE | QB Equivalent | Notes |
|-----------|--------------|-------|
| companies.company_name | Customer.Name | |
| companies.email_address | Customer.PrimaryEmailAddr | |
| companies.phone_number | Customer.PrimaryPhone | |
| companies.business_address | Customer.BillAddr | |
| companies.quickbooks_id | Customer.Id | Stored for lookup |
| invoices | Invoice | |
| invoices.invoice_number | Invoice.DocNumber | |
| invoices.total_amount | Invoice.TotalAmt | |
| invoices.due_date | Invoice.DueDate | |
| invoice_line_items[] | Invoice.Line[] | Array of line items |
| payments | Payment | |
| payments.amount | Payment.TotalAmt | |
| payments.payment_date | Payment.TxnDate | |
| payments.reference_number | Payment.ReferenceNumber | Check/ACH ref |

### Webhook Handler: QB → AVIDSPHERE

```python
@app.post("/api/webhooks/quickbooks")
async def handle_quickbooks_webhook(request):
    """
    QB sends webhooks on:
    - Payment received
    - Invoice paid
    - Bill created
    
    Payload example:
    {
      "realmId": "1234567890",
      "dataChangeEvent": {
        "entities": [
          {
            "name": "Payment",
            "id": "qb-payment-id-123",
            "operation": "Create"
          }
        ]
      }
    }
    """
    
    webhook_data = await request.json()
    realm_id = webhook_data['realmId']
    
    for entity in webhook_data['dataChangeEvent']['entities']:
        if entity['name'] == 'Payment':
            # Fetch payment details from QB
            qb_payment = qb_api.fetch_payment(
                realm_id=realm_id,
                payment_id=entity['id']
            )
            
            # Find matching invoice
            invoice = db.invoices.find_one(
                quickbooks_id=qb_payment['Invoice']['Id']
            )
            
            if invoice:
                # Create payment record
                payment = db.payments.insert({
                    'invoice_id': invoice.id,
                    'company_id': invoice.company_id,
                    'payment_date': qb_payment['TxnDate'],
                    'amount': qb_payment['TotalAmt'],
                    'quickbooks_id': qb_payment['Id'],
                    'payment_status': 'Completed'
                })
                
                # Update invoice
                db.invoices.update(invoice.id, {
                    'amount_paid': invoice.amount_paid + payment.amount,
                    'amount_remaining': invoice.total_amount - (invoice.amount_paid + payment.amount),
                    'status': 'Paid' if invoice.total_amount == (invoice.amount_paid + payment.amount) else 'Partial'
                })
                
                # Log activity
                log_activity(
                    user_id=None,  # QB webhook
                    entity_type='payments',
                    entity_id=payment.id,
                    action='Create',
                    source='QuickBooks Webhook'
                )
    
    return {"status": "processed"}
```

### Error Handling & Retry Logic

```sql
-- After failed sync attempt
UPDATE quickbooks_sync_logs
SET 
  sync_status = 'Failed',
  error_message = $1,  -- 'Connection timeout' / 'Invalid customer reference'
  retry_count = retry_count + 1,
  last_retry_at = CURRENT_TIMESTAMP
WHERE id = $2;

-- Retry policy: Exponential backoff
-- Retry 1: After 1 minute (if created < 1 min ago)
-- Retry 2: After 5 minutes
-- Retry 3: After 30 minutes
-- Retry 4: After 2 hours
-- After 4 retries: Mark as 'Partial' + alert admin

SELECT * FROM quickbooks_sync_logs
WHERE sync_status = 'Failed'
  AND (
    (retry_count = 0 AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 min')
    OR (retry_count = 1 AND last_retry_at < CURRENT_TIMESTAMP - INTERVAL '5 min')
    OR (retry_count = 2 AND last_retry_at < CURRENT_TIMESTAMP - INTERVAL '30 min')
    OR (retry_count = 3 AND last_retry_at < CURRENT_TIMESTAMP - INTERVAL '2 hours')
  )
  AND retry_count < 4;
```

---

## Performance & Optimization

### Query Performance Targets

**For 5-25 users + 1000-10000 records**:
- Page load: < 100ms (index hits)
- Search: < 500ms
- Report generation: < 2 seconds
- Background sync: < 5 minutes

### Index Design Rationale

```sql
-- Most frequently filtered
idx_sales_company_id        -- Fetch all sales for company
idx_sales_status            -- Pipeline filtering
idx_sales_date              -- Date range queries
idx_invoices_status         -- Outstanding balances
idx_notifications_recipient -- User inbox

-- Composite indexes for common filters
CREATE INDEX idx_sales_company_status 
  ON sales(company_id, status);

CREATE INDEX idx_invoices_company_status 
  ON invoices(company_id, status, created_at DESC);

CREATE INDEX idx_reminders_assigned_date 
  ON reminders(assigned_to, reminder_date);
```

### Query Optimization Examples

**BAD** ❌:
```sql
SELECT * FROM sales s
WHERE s.company_id = $1
  AND EXTRACT(MONTH FROM s.sale_date) = 5;  -- Index unusable
```

**GOOD** ✅:
```sql
SELECT * FROM sales s
WHERE s.company_id = $1
  AND s.sale_date >= '2026-05-01'
  AND s.sale_date < '2026-06-01';  -- Index usable
```

### Materialized Views for Reporting

```sql
-- Rebuild daily for performance
CREATE MATERIALIZED VIEW sales_performance_monthly AS
SELECT 
  s.sales_rep_id,
  u.display_name,
  DATE_TRUNC('month', s.sale_date)::DATE as month,
  COUNT(*) as sales_count,
  SUM(CASE WHEN s.status = 'Active' THEN 1 ELSE 0 END) as active_sales,
  SUM(i.total_amount) as total_revenue,
  AVG(i.total_amount) as avg_invoice_amount
FROM sales s
JOIN users u ON s.sales_rep_id = u.id
LEFT JOIN invoices i ON s.id = i.sale_id
GROUP BY s.sales_rep_id, u.display_name, DATE_TRUNC('month', s.sale_date);

-- Refresh schedule: Every night at 2 AM
REFRESH MATERIALIZED VIEW sales_performance_monthly;
```

### Connection Pooling

```yaml
# In backend config
database:
  pool_size: 20          # Max connections
  max_idle: 10           # Connections to keep warm
  connection_timeout: 5s
  idle_timeout: 30m
```

---

## Implementation Roadmap

### Phase 1: Core Foundation (Week 1-2)
- [ ] Deploy PostgreSQL instance
- [ ] Create base schema (users, roles, companies)
- [ ] Set up authentication (JWT + password hashing)
- [ ] Implement session management
- [ ] Deploy initial API endpoints

### Phase 2: Sales Module (Week 3-4)
- [ ] Implement opportunities table
- [ ] Build sales creation API
- [ ] Add sale-type specific details
- [ ] Implement activity logging
- [ ] Create sales dashboard views

### Phase 3: Financial (Week 5-6)
- [ ] Build invoice generation
- [ ] Implement payment tracking
- [ ] Create QB sync infrastructure
- [ ] Implement payment reconciliation
- [ ] Add financial reporting views

### Phase 4: Legal & Agreements (Week 7)
- [ ] Build agreement workflow
- [ ] Implement e-signature capture
- [ ] Create signature storage
- [ ] Add document versioning
- [ ] Build agreement status views

### Phase 5: Integration & Polish (Week 8-9)
- [ ] QB API integration & testing
- [ ] Webhook receiver implementation
- [ ] Device management & session tracking
- [ ] Performance optimization & indexing
- [ ] Backup & disaster recovery setup

### Phase 6: Deployment & Training (Week 10)
- [ ] Data migration from demo
- [ ] Production PostgreSQL setup
- [ ] iOS app integration testing
- [ ] Staff training & documentation
- [ ] Go-live

---

## Appendix: Setup Instructions

### 1. PostgreSQL Installation

```bash
# macOS (via Homebrew)
brew install postgresql@15

# Linux (Ubuntu)
sudo apt install postgresql postgresql-contrib

# Or use Docker
docker run --name avidsphere-db \
  -e POSTGRES_PASSWORD=securepassword \
  -e POSTGRES_DB=avidsphere \
  -p 5432:5432 \
  postgres:15-alpine
```

### 2. Schema Deployment

```bash
# Connect to database
psql -U postgres -d avidsphere -f DATABASE_SCHEMA.sql

# Verify installation
psql -U postgres -d avidsphere -c "\dt+"
```

### 3. Environment Configuration

```bash
# .env file for backend
DATABASE_URL="postgresql://user:password@localhost:5432/avidsphere"
JWT_SECRET="your-secret-key-here"
QB_REALM_ID="your-realm-id"
QB_CLIENT_ID="your-client-id"
QB_CLIENT_SECRET="your-secret"
RESEND_API_KEY="your-resend-key"
```

### 4. Initial Data Setup

```sql
-- Create first admin user
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES ('admin@avidsphere.local', '$2b$12$...hash...', 'Admin', 'User');

-- Assign Admin role
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  (SELECT id FROM users WHERE email = 'admin@avidsphere.local'),
  (SELECT id FROM roles WHERE name = 'Admin'),
  (SELECT id FROM users WHERE email = 'admin@avidsphere.local');
```

---

## Support & Next Steps

1. **Database Migrations**: Set up Alembic or Liquibase for versioning
2. **Backup Strategy**: Implement nightly backups to S3
3. **Monitoring**: Set up pg_stat_statements and slow query logs
4. **Security Hardening**: Row-level security (RLS) policies per role
5. **API Documentation**: Generate OpenAPI spec from endpoints

