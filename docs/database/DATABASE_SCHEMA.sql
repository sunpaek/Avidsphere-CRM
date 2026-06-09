-- =============================================================================
-- AVIDSPHERE CRM - PRODUCTION-READY POSTGRESQL DATABASE SCHEMA
-- =============================================================================
-- Designed for: 5-25 users, Multi-user access, iPad support, QB Integration
-- Created: 2026-06-07
-- =============================================================================

-- Drop existing objects (use with caution in production)
-- DROP SCHEMA IF EXISTS avidsphere CASCADE;
-- CREATE SCHEMA avidsphere;

-- =============================================================================
-- 1. AUTHENTICATION & AUTHORIZATION SCHEMA
-- =============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  phone_number VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  
  CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Full system access, user management, configuration'),
  ('Sales Staff', 'Create and manage customers and sales records'),
  ('Management', 'View all records, reporting, analytics, approvals'),
  ('Designer', 'Design task management and proof updates'),
  ('Social Media Manager', 'Social campaign management and coordination'),
  ('Digital Team Lead', 'Digital campaign oversight and coordination'),
  ('Finance', 'Invoice, payment, and billing management'),
  ('Guest', 'Read-only access to assigned records');

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID NOT NULL REFERENCES users(id),
  UNIQUE(user_id, role_id)
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  resource VARCHAR(100),
  action VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert core permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('customers.create', 'Create customer records', 'customers', 'create'),
  ('customers.read', 'View customer records', 'customers', 'read'),
  ('customers.update', 'Edit customer records', 'customers', 'update'),
  ('customers.delete', 'Delete customer records', 'customers', 'delete'),
  ('sales.create', 'Create sales records', 'sales', 'create'),
  ('sales.read', 'View sales records', 'sales', 'read'),
  ('sales.update', 'Edit sales records', 'sales', 'update'),
  ('sales.delete', 'Delete sales records', 'sales', 'delete'),
  ('sales.approve', 'Approve sales records', 'sales', 'approve'),
  ('reminders.create', 'Create reminders', 'reminders', 'create'),
  ('reminders.read', 'View reminders', 'reminders', 'read'),
  ('invoices.create', 'Create invoices', 'invoices', 'create'),
  ('invoices.read', 'View invoices', 'invoices', 'read'),
  ('invoices.update', 'Edit invoices', 'invoices', 'update'),
  ('payments.create', 'Record payments', 'payments', 'create'),
  ('payments.read', 'View payments', 'payments', 'read'),
  ('reports.view', 'Access reporting', 'reports', 'read'),
  ('users.manage', 'Manage users and roles', 'users', 'manage'),
  ('settings.manage', 'Manage system settings', 'settings', 'manage');

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- =============================================================================
-- 2. CORE ENTITY SCHEMA
-- =============================================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100),
  industry VARCHAR(100),
  website_url VARCHAR(255),
  phone_number VARCHAR(20),
  email_address VARCHAR(255),
  primary_contact_person VARCHAR(100),
  business_address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'USA',
  quickbooks_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  CONSTRAINT email_format CHECK (email_address ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE TABLE company_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_name VARCHAR(100) NOT NULL,
  title VARCHAR(100),
  email_address VARCHAR(255),
  phone_number VARCHAR(20),
  is_primary_contact BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  username VARCHAR(255),
  url VARCHAR(255),
  follower_count INT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_platforms CHECK (platform IN ('Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'TikTok', 'YouTube', 'Snapchat', 'Website'))
);

-- =============================================================================
-- 3. SALES & OPPORTUNITIES SCHEMA
-- =============================================================================

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  sales_rep_id UUID NOT NULL REFERENCES users(id),
  opportunity_name VARCHAR(255) NOT NULL,
  opportunity_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Prospect',
  value DECIMAL(12, 2),
  expected_close_date DATE,
  probability_percent INT DEFAULT 50,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  
  CONSTRAINT valid_status CHECK (status IN ('Prospect', 'Qualified', 'Proposal', 'Negotiating', 'Won', 'Lost')),
  CONSTRAINT valid_probability CHECK (probability_percent >= 0 AND probability_percent <= 100)
);

-- Sales record types: Mailer, Digital, Print, Social Media, Website, Paid Ads, Geofencing
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  sales_rep_id UUID NOT NULL REFERENCES users(id),
  sale_date DATE NOT NULL,
  sale_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  description TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_sale_type CHECK (sale_type IN ('Mailer', 'Digital', 'Print', 'Social Media', 'Website', 'Paid Ads', 'Geofencing')),
  CONSTRAINT valid_sales_status CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Active', 'Completed', 'Cancelled'))
);

-- Mailer-specific details
CREATE TABLE sale_mailer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  area_name VARCHAR(100),
  month_name VARCHAR(20),
  run_time INT,
  ad_size VARCHAR(50),
  monthly_rate DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  discount_type VARCHAR(50),
  discount_value DECIMAL(10, 2),
  total_investment DECIMAL(12, 2),
  needs_mailing BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Digital-specific details
CREATE TABLE sale_digital_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  service_type VARCHAR(100),
  service_price DECIMAL(10, 2),
  discount_type VARCHAR(50),
  discount_value DECIMAL(10, 2),
  total_investment DECIMAL(12, 2),
  static_ideas_provided BOOLEAN DEFAULT false,
  video_campaign BOOLEAN DEFAULT false,
  client_video_provided BOOLEAN DEFAULT false,
  target_areas TEXT,
  target_locations TEXT,
  target_age_range VARCHAR(50),
  target_gender VARCHAR(20),
  target_income_range VARCHAR(50),
  monthly_spend DECIMAL(10, 2),
  start_date DATE,
  campaign_goal TEXT,
  website_url VARCHAR(255),
  landing_page_url VARCHAR(255),
  campaign_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Print-specific details
CREATE TABLE sale_print_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  print_type VARCHAR(100),
  description TEXT,
  finish_type VARCHAR(100),
  thickness_type VARCHAR(100),
  fold_type VARCHAR(100),
  quantity INT,
  size VARCHAR(50),
  design_fee DECIMAL(10, 2),
  project_price DECIMAL(10, 2),
  discount_type VARCHAR(50),
  discount_value DECIMAL(10, 2),
  total_investment DECIMAL(12, 2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Social Media-specific details
CREATE TABLE sale_social_media_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  platforms TEXT,
  username VARCHAR(255),
  start_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Website-specific details
CREATE TABLE sale_website_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  website_option VARCHAR(100),
  website_url VARCHAR(255),
  primary_goal TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Paid Ads-specific details
CREATE TABLE sale_paid_ads_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  platforms TEXT,
  other_platform_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Geofencing-specific details
CREATE TABLE sale_geofencing_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL UNIQUE REFERENCES sales(id) ON DELETE CASCADE,
  target_areas TEXT,
  target_locations TEXT,
  campaign_type VARCHAR(100),
  monthly_spend DECIMAL(10, 2),
  target_age_range VARCHAR(50),
  target_gender VARCHAR(20),
  target_income_range VARCHAR(50),
  start_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Track design and mailing services
CREATE TABLE sale_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2),
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_service_type CHECK (service_type IN ('Design', 'Design Changes', 'Mailing', 'Other'))
);

-- =============================================================================
-- 4. INVOICING & PAYMENT SCHEMA
-- =============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  tax_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  amount_remaining DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  memo TEXT,
  quickbooks_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_invoice_status CHECK (status IN ('Draft', 'Sent', 'Viewed', 'Overdue', 'Paid', 'Cancelled', 'Disputed')),
  CONSTRAINT amount_consistency CHECK (amount_paid >= 0 AND amount_remaining >= 0)
);

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  account_code VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  reference_number VARCHAR(100),
  notes TEXT,
  quickbooks_id VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  processed_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('Credit Card', 'Bank Transfer', 'ACH', 'Check', 'Cash', 'Other')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('Pending', 'Processing', 'Completed', 'Failed', 'Refunded', 'Cancelled'))
);

-- =============================================================================
-- 5. AGREEMENTS & SIGNATURES SCHEMA
-- =============================================================================

CREATE TABLE agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_number VARCHAR(50) NOT NULL UNIQUE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  agreement_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Draft',
  document_version INT DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  sent_date TIMESTAMP,
  sent_by UUID REFERENCES users(id),
  
  CONSTRAINT valid_agreement_type CHECK (agreement_type IN ('Service Agreement', 'NDA', 'Contract', 'Amendment', 'Other')),
  CONSTRAINT valid_agreement_status CHECK (status IN ('Draft', 'Sent', 'Viewed', 'Signed', 'Executed', 'Cancelled'))
);

CREATE TABLE agreement_signatories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  signer_name VARCHAR(100) NOT NULL,
  signer_title VARCHAR(100),
  signer_email VARCHAR(255),
  signer_phone VARCHAR(20),
  signature_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  signature_date TIMESTAMP,
  signature_ip_address INET,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_signature_status CHECK (signature_status IN ('Pending', 'Sent', 'Viewed', 'Signed', 'Declined', 'Expired'))
);

-- Signature storage (base64 or URL reference)
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signatory_id UUID NOT NULL UNIQUE REFERENCES agreement_signatories(id) ON DELETE CASCADE,
  signature_data_type VARCHAR(20) NOT NULL DEFAULT 'base64',
  signature_content TEXT,
  signature_url VARCHAR(500),
  signature_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  device_type VARCHAR(50),
  platform VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_data_type CHECK (signature_data_type IN ('base64', 'url', 'file_path'))
);

CREATE TABLE agreement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  document_version INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes INT,
  mime_type VARCHAR(100),
  content_hash VARCHAR(64),
  storage_type VARCHAR(50) DEFAULT 'local',
  is_current_version BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id)
);

-- =============================================================================
-- 6. REMINDERS & CALENDAR SCHEMA
-- =============================================================================

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_type VARCHAR(50),
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  assigned_to UUID NOT NULL REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  priority VARCHAR(50) DEFAULT 'Normal',
  related_to_sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  related_to_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  related_to_agreement_id UUID REFERENCES agreements(id) ON DELETE SET NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_reminder_type CHECK (reminder_type IN ('Follow-up', 'Call', 'Email', 'Meeting', 'Task', 'Review', 'Other')),
  CONSTRAINT valid_reminder_status CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  CONSTRAINT valid_priority CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent'))
);

CREATE TABLE recurring_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  recurrence_pattern VARCHAR(50) NOT NULL,
  recurrence_frequency INT,
  recurrence_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_recurrence CHECK (recurrence_pattern IN ('Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'))
);

-- =============================================================================
-- 7. NOTIFICATIONS SCHEMA
-- =============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'Normal',
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  action_url VARCHAR(500),
  related_sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  related_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  related_agreement_id UUID REFERENCES agreements(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  
  CONSTRAINT valid_notification_type CHECK (notification_type IN ('Sale', 'Invoice', 'Payment', 'Agreement', 'Reminder', 'System', 'Assignment', 'Approval'))
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  in_app_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  digest_frequency VARCHAR(50) DEFAULT 'Daily',
  preferred_notification_time TIME DEFAULT '09:00:00',
  notification_categories JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 8. ACTIVITY LOG & AUDIT SCHEMA
-- =============================================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  action_details JSONB,
  changes_from JSONB,
  changes_to JSONB,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_action CHECK (action IN ('Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject', 'Sign', 'Download', 'Email', 'Export'))
);

-- Audit log for critical operations
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 9. QUICKBOOKS SYNCHRONIZATION SCHEMA
-- =============================================================================

CREATE TABLE quickbooks_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  quickbooks_id VARCHAR(255),
  sync_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  sync_direction VARCHAR(20),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMP,
  synced_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_sync_type CHECK (sync_type IN ('Customer', 'Invoice', 'Payment', 'Bill', 'Estimate')),
  CONSTRAINT valid_sync_status CHECK (sync_status IN ('Pending', 'Synced', 'Failed', 'Partial', 'Skipped')),
  CONSTRAINT valid_sync_direction CHECK (sync_direction IN ('To QB', 'From QB', 'Bidirectional'))
);

CREATE TABLE quickbooks_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id VARCHAR(255) NOT NULL,
  access_token VARCHAR(500),
  refresh_token VARCHAR(500),
  token_expiry TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  sync_enabled_for JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 10. DEVICE & SESSION SCHEMA (for multi-iPad support)
-- =============================================================================

CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  device_type VARCHAR(50),
  device_name VARCHAR(255),
  os_type VARCHAR(50),
  os_version VARCHAR(50),
  app_version VARCHAR(50),
  session_token VARCHAR(500) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  
  CONSTRAINT valid_device_type CHECK (device_type IN ('iPad', 'iPhone', 'Android', 'Web', 'Desktop'))
);

CREATE TABLE device_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL UNIQUE,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  os_type VARCHAR(50),
  push_token VARCHAR(500),
  is_trusted BOOLEAN DEFAULT false,
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 11. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- User and Auth Indexes
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_is_active_deleted ON users(is_active, is_deleted);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- Company Indexes
CREATE INDEX idx_companies_email ON companies(email_address);
CREATE INDEX idx_companies_quickbooks_id ON companies(quickbooks_id);
CREATE INDEX idx_companies_active ON companies(is_active, is_deleted);
CREATE INDEX idx_company_contacts_company_id ON company_contacts(company_id);
CREATE INDEX idx_company_social_accounts_company_id ON company_social_accounts(company_id);

-- Sales Indexes
CREATE INDEX idx_sales_company_id ON sales(company_id);
CREATE INDEX idx_sales_sales_rep_id ON sales(sales_rep_id);
CREATE INDEX idx_sales_opportunity_id ON sales(opportunity_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_type ON sales(sale_type);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_opportunities_company_id ON opportunities(company_id);
CREATE INDEX idx_opportunities_sales_rep_id ON opportunities(sales_rep_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);

-- Invoice Indexes
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_sale_id ON invoices(sale_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_invoices_quickbooks_id ON invoices(quickbooks_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- Payment Indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_company_id ON payments(company_id);
CREATE INDEX idx_payments_payment_number ON payments(payment_number);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date DESC);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Agreement and Signature Indexes
CREATE INDEX idx_agreements_company_id ON agreements(company_id);
CREATE INDEX idx_agreements_sale_id ON agreements(sale_id);
CREATE INDEX idx_agreements_status ON agreements(status);
CREATE INDEX idx_agreement_signatories_agreement_id ON agreement_signatories(agreement_id);
CREATE INDEX idx_signatures_signatory_id ON signatures(signatory_id);

-- Reminder Indexes
CREATE INDEX idx_reminders_assigned_to ON reminders(assigned_to);
CREATE INDEX idx_reminders_company_id ON reminders(company_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_priority ON reminders(priority);
CREATE INDEX idx_reminders_created_at ON reminders(created_at DESC);

-- Notification Indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- Activity and Audit Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- QuickBooks Sync Indexes
CREATE INDEX idx_quickbooks_sync_status ON quickbooks_sync_logs(sync_status);
CREATE INDEX idx_quickbooks_sync_entity ON quickbooks_sync_logs(entity_type, entity_id);
CREATE INDEX idx_quickbooks_sync_created_at ON quickbooks_sync_logs(created_at DESC);

-- =============================================================================
-- 12. VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Active users view
CREATE VIEW active_users_view AS
SELECT 
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.display_name,
  string_agg(r.name, ', ') as roles,
  u.last_login,
  u.is_active
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.is_active = true AND u.is_deleted = false
GROUP BY u.id, u.email, u.first_name, u.last_name, u.display_name, u.last_login, u.is_active;

-- Company with recent sales activity
CREATE VIEW company_activity_view AS
SELECT 
  c.id,
  c.company_name,
  c.email_address,
  COUNT(DISTINCT s.id) as total_sales,
  SUM(CASE WHEN s.status IN ('Draft', 'Submitted') THEN s.id ELSE NULL END) as pending_sales,
  MAX(s.created_at) as last_sale_date,
  COUNT(DISTINCT i.id) as total_invoices,
  SUM(i.amount_remaining) as outstanding_balance
FROM companies c
LEFT JOIN sales s ON c.id = s.company_id
LEFT JOIN invoices i ON c.id = i.company_id AND i.status != 'Paid'
WHERE c.is_deleted = false
GROUP BY c.id, c.company_name, c.email_address;

-- Outstanding invoices view
CREATE VIEW outstanding_invoices_view AS
SELECT 
  i.id,
  i.invoice_number,
  c.company_name,
  i.total_amount,
  i.amount_paid,
  i.amount_remaining,
  i.due_date,
  CASE 
    WHEN i.due_date < CURRENT_DATE THEN 'Overdue'
    WHEN i.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Due Soon'
    ELSE 'Pending'
  END as urgency,
  CURRENT_DATE - i.due_date as days_overdue
FROM invoices i
JOIN companies c ON i.company_id = c.id
WHERE i.status IN ('Sent', 'Viewed', 'Overdue') 
  AND i.amount_remaining > 0
ORDER BY i.due_date ASC;

-- Sales pipeline view
CREATE VIEW sales_pipeline_view AS
SELECT 
  o.status,
  COUNT(*) as opportunity_count,
  SUM(o.value) as total_value,
  AVG(o.probability_percent) as avg_probability,
  SUM(o.value * o.probability_percent / 100) as weighted_value
FROM opportunities o
WHERE o.status IN ('Prospect', 'Qualified', 'Proposal', 'Negotiating')
GROUP BY o.status
ORDER BY 
  CASE o.status 
    WHEN 'Prospect' THEN 1
    WHEN 'Qualified' THEN 2
    WHEN 'Proposal' THEN 3
    WHEN 'Negotiating' THEN 4
  END;

-- Agreement signature status view
CREATE VIEW agreement_signature_status_view AS
SELECT 
  a.id,
  a.agreement_number,
  c.company_name,
  a.status,
  COUNT(DISTINCT asig.id) as total_signatories,
  COUNT(DISTINCT CASE WHEN asig.signature_status = 'Signed' THEN asig.id END) as signed_count,
  COUNT(DISTINCT CASE WHEN asig.signature_status = 'Pending' THEN asig.id END) as pending_count
FROM agreements a
JOIN companies c ON a.company_id = c.id
LEFT JOIN agreement_signatories asig ON a.id = asig.agreement_id
GROUP BY a.id, a.agreement_number, c.company_name, a.status;

-- =============================================================================
-- 13. STORED PROCEDURES & FUNCTIONS
-- =============================================================================

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_id UUID)
RETURNS TABLE(subtotal DECIMAL, tax_amount DECIMAL, total_amount DECIMAL, amount_remaining DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(ili.line_total),
    (SUM(ili.line_total) * i.tax_percent / 100),
    (SUM(ili.line_total) * (1 + i.tax_percent / 100)) - COALESCE(i.discount_amount, 0),
    (SUM(ili.line_total) * (1 + i.tax_percent / 100)) - COALESCE(i.discount_amount, 0) - COALESCE(i.amount_paid, 0)
  FROM invoices i
  LEFT JOIN invoice_line_items ili ON i.id = ili.invoice_id
  WHERE i.id = invoice_id
  GROUP BY i.id, i.tax_percent, i.discount_amount, i.amount_paid;
END;
$$ LANGUAGE plpgsql;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE(permission_name VARCHAR, resource VARCHAR, action VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.name, p.resource, p.action
  FROM users u
  JOIN user_roles ur ON u.id = ur.user_id
  JOIN roles r ON ur.role_id = r.id
  JOIN role_permissions rp ON r.id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.id
  WHERE u.id = user_id AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to create activity log entry
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_entity_type VARCHAR,
  p_entity_id UUID,
  p_action VARCHAR,
  p_details JSONB DEFAULT NULL,
  p_changes_from JSONB DEFAULT NULL,
  p_changes_to JSONB DEFAULT NULL,
  p_device_type VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id, entity_type, entity_id, action, action_details, 
    changes_from, changes_to, device_type, created_at
  )
  VALUES (
    p_user_id, p_entity_type, p_entity_id, p_action, p_details,
    p_changes_from, p_changes_to, p_device_type, CURRENT_TIMESTAMP
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER companies_updated_at_trigger
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER sales_updated_at_trigger
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER invoices_updated_at_trigger
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER agreements_updated_at_trigger
BEFORE UPDATE ON agreements
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =============================================================================
-- 14. INITIAL ROLE & PERMISSION SETUP (Optional)
-- =============================================================================

-- Map Admin role to all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;

-- Map Sales Staff role to core sales permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Sales Staff' AND p.name IN (
  'customers.create', 'customers.read', 'customers.update',
  'sales.create', 'sales.read', 'sales.update',
  'reminders.create', 'reminders.read'
)
ON CONFLICT DO NOTHING;

-- Map Management role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Management' AND p.name IN (
  'customers.read', 'sales.read', 'sales.approve',
  'invoices.read', 'payments.read', 'reports.view',
  'reminders.read'
)
ON CONFLICT DO NOTHING;

-- Map Finance role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Finance' AND p.name IN (
  'invoices.create', 'invoices.read', 'invoices.update',
  'payments.create', 'payments.read', 'reports.view'
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF SCHEMA DEFINITION
-- =============================================================================
