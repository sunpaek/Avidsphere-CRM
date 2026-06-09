// ═════════════════════════════════════════════════════════════════════════════
// AVIDSPHERE CRM - BACKEND IMPLEMENTATION GUIDE & CODE EXAMPLES
// Node.js/Express + PostgreSQL
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// 1. DATABASE CONNECTION & POOL SETUP
// ═════════════════════════════════════════════════════════════════════════════

// config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'avidsphere',
  max: 20,                    // Maximum connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail if can't connect in 5s
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;


// ═════════════════════════════════════════════════════════════════════════════
// 2. AUTHENTICATION & AUTHORIZATION LAYER
// ═════════════════════════════════════════════════════════════════════════════

// middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Middleware: Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify token in database (optional but more secure)
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true AND is_deleted = false',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware: Check permissions
const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT p.name FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         JOIN roles r ON ur.role_id = r.id
         JOIN role_permissions rp ON r.id = rp.role_id
         JOIN permissions p ON rp.permission_id = p.id
         WHERE u.id = $1`,
        [req.user.id]
      );

      const permissions = result.rows.map(row => row.name);
      
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

// Login endpoint
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = LOWER($1) AND is_deleted = false',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get roles
    const rolesResult = await pool.query(
      `SELECT r.name FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    const roles = rolesResult.rows.map(row => row.name);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last_login
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Create session record
    const sessionResult = await pool.query(
      `INSERT INTO user_sessions (user_id, device_id, device_type, session_token, expires_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '24 hours')
       RETURNING id`,
      [user.id, req.body.deviceId, req.body.deviceType, token]
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        displayName: user.display_name,
        roles: roles
      },
      sessionId: sessionResult.rows[0].id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { authMiddleware, requirePermission, login };


// ═════════════════════════════════════════════════════════════════════════════
// 3. COMPANY/CUSTOMER MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

// routes/companies.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware, requirePermission } = require('../middleware/auth');

// GET: List all companies (with pagination)
router.get('/', authMiddleware, requirePermission('customers.read'), async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM companies WHERE is_deleted = false';
    let params = [];

    if (status) {
      query += ' AND is_active = $' + (params.length + 1);
      params.push(status === 'active');
    }

    if (search) {
      query += ` AND (company_name ILIKE '%' || $${params.length + 1} || '%'
                 OR email_address ILIKE '%' || $${params.length + 2} || '%')`;
      params.push(search, search);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rowCount
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET: Single company with related data
router.get('/:id', authMiddleware, requirePermission('customers.read'), async (req, res) => {
  try {
    const { id } = req.params;

    // Main company
    const companyResult = await pool.query(
      'SELECT * FROM companies WHERE id = $1 AND is_deleted = false',
      [id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Contacts
    const contactsResult = await pool.query(
      'SELECT * FROM company_contacts WHERE company_id = $1 AND is_deleted = false',
      [id]
    );

    // Social accounts
    const socialResult = await pool.query(
      'SELECT * FROM company_social_accounts WHERE company_id = $1',
      [id]
    );

    // Recent sales
    const salesResult = await pool.query(
      `SELECT s.*, u.display_name as sales_rep_name
       FROM sales s
       JOIN users u ON s.sales_rep_id = u.id
       WHERE s.company_id = $1 AND s.status != 'Cancelled'
       ORDER BY s.sale_date DESC LIMIT 10`,
      [id]
    );

    // Outstanding invoices
    const invoicesResult = await pool.query(
      `SELECT id, invoice_number, total_amount, amount_remaining, due_date, status
       FROM invoices
       WHERE company_id = $1 AND status != 'Paid' AND is_deleted = false
       ORDER BY due_date ASC`,
      [id]
    );

    res.json({
      company: companyResult.rows[0],
      contacts: contactsResult.rows,
      socialAccounts: socialResult.rows,
      recentSales: salesResult.rows,
      outstandingInvoices: invoicesResult.rows
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// POST: Create company
router.post('/', authMiddleware, requirePermission('customers.create'), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      companyName, businessType, industry, email, phone,
      websiteUrl, address, city, state, zipCode, country,
      primaryContactName, primaryContactEmail, notes
    } = req.body;

    await client.query('BEGIN');

    // Insert company
    const companyResult = await client.query(
      `INSERT INTO companies (
        company_name, business_type, industry, email_address, phone_number,
        website_url, business_address, city, state, zip_code, country,
        notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [companyName, businessType, industry, email, phone, websiteUrl,
       address, city, state, zipCode, country || 'USA', notes, req.user.id]
    );

    const companyId = companyResult.rows[0].id;

    // Insert primary contact if provided
    if (primaryContactName) {
      await client.query(
        `INSERT INTO company_contacts (company_id, contact_name, email_address, is_primary_contact)
         VALUES ($1, $2, $3, true)`,
        [companyId, primaryContactName, primaryContactEmail]
      );
    }

    // Log activity
    await client.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, action_details, device_type, created_at)
       VALUES ($1, 'companies', $2, 'Create', $3, $4, CURRENT_TIMESTAMP)`,
      [req.user.id, companyId, JSON.stringify({ companyName, email }), req.body.deviceType || 'web']
    );

    await client.query('COMMIT');

    res.status(201).json(companyResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  } finally {
    client.release();
  }
});

// PUT: Update company
router.put('/:id', authMiddleware, requirePermission('customers.update'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { companyName, businessType, industry, email, phone, notes } = req.body;

    await client.query('BEGIN');

    // Get old values for audit
    const oldResult = await client.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Company not found' });
    }

    const oldValues = oldResult.rows[0];

    // Update company
    const updateResult = await client.query(
      `UPDATE companies SET
        company_name = COALESCE($1, company_name),
        business_type = COALESCE($2, business_type),
        industry = COALESCE($3, industry),
        email_address = COALESCE($4, email_address),
        phone_number = COALESCE($5, phone_number),
        notes = COALESCE($6, notes),
        updated_by = $7,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [companyName, businessType, industry, email, phone, notes, req.user.id, id]
    );

    // Log activity with change tracking
    await client.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, changes_from, changes_to, device_type, created_at)
       VALUES ($1, 'companies', $2, 'Update', $3, $4, $5, CURRENT_TIMESTAMP)`,
      [req.user.id, id, JSON.stringify(oldValues), JSON.stringify(updateResult.rows[0]), req.body.deviceType || 'web']
    );

    await client.query('COMMIT');

    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  } finally {
    client.release();
  }
});

module.exports = router;


// ═════════════════════════════════════════════════════════════════════════════
// 4. SALES MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

// routes/sales.js
router.post('/', authMiddleware, requirePermission('sales.create'), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      companyId, opportunityId, saleType, saleDate, amount,
      status = 'Draft', notes, designRequired, designChangeRequired,
      paymentMethod, saleDetails
    } = req.body;

    await client.query('BEGIN');

    // Create main sale record
    const saleResult = await client.query(
      `INSERT INTO sales (
        company_id, opportunity_id, sales_rep_id, sale_date, sale_type,
        status, notes, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [companyId, opportunityId, req.user.id, saleDate, saleType,
       status, notes, req.user.id, req.user.id]
    );

    const saleId = saleResult.rows[0].id;

    // Insert type-specific details based on saleType
    switch (saleType) {
      case 'Digital':
        await client.query(
          `INSERT INTO sale_digital_details (
            sale_id, service_type, service_price, discount_type, discount_value,
            total_investment, target_areas, target_locations, start_date,
            campaign_goal, website_url, landing_page_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [saleId, saleDetails.serviceType, saleDetails.servicePrice,
           saleDetails.discountType, saleDetails.discountValue,
           saleDetails.totalInvestment, saleDetails.targetAreas,
           saleDetails.targetLocations, saleDetails.startDate,
           saleDetails.campaignGoal, saleDetails.websiteUrl,
           saleDetails.landingPageUrl]
        );
        break;

      case 'Mailer':
        await client.query(
          `INSERT INTO sale_mailer_details (
            sale_id, area_name, month_name, run_time, ad_size,
            monthly_rate, subtotal, discount_type, discount_value,
            total_investment, needs_mailing
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [saleId, saleDetails.areaName, saleDetails.monthName,
           saleDetails.runTime, saleDetails.adSize, saleDetails.monthlyRate,
           saleDetails.subtotal, saleDetails.discountType,
           saleDetails.discountValue, saleDetails.totalInvestment,
           saleDetails.needsMailing]
        );
        break;

      case 'Print':
        await client.query(
          `INSERT INTO sale_print_details (
            sale_id, print_type, description, finish_type, thickness_type,
            fold_type, quantity, size, design_fee, project_price,
            discount_type, discount_value, total_investment
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [saleId, saleDetails.printType, saleDetails.description,
           saleDetails.finishType, saleDetails.thicknessType,
           saleDetails.foldType, saleDetails.quantity, saleDetails.size,
           saleDetails.designFee, saleDetails.projectPrice,
           saleDetails.discountType, saleDetails.discountValue,
           saleDetails.totalInvestment]
        );
        break;
    }

    // Add design service if required
    if (designRequired) {
      await client.query(
        `INSERT INTO sale_services (sale_id, service_type, amount, is_required)
         VALUES ($1, 'Design', $2, true)`,
        [saleId, saleDetails.designFee || 0]
      );
    }

    // Log activity
    await client.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, action_details, device_type, created_at)
       VALUES ($1, 'sales', $2, 'Create', $3, $4, CURRENT_TIMESTAMP)`,
      [req.user.id, saleId, JSON.stringify({ saleType, amount, status }), req.body.deviceType || 'web']
    );

    // Create notification for management
    const managementResult = await client.query(
      'SELECT id FROM users WHERE is_deleted = false'
    );

    for (const mgmt of managementResult.rows) {
      await client.query(
        `INSERT INTO notifications (
          recipient_id, notification_type, title, message, priority,
          related_sale_id, related_company_id, created_at
        ) VALUES ($1, 'Sale', $2, $3, 'Normal', $4, $5, CURRENT_TIMESTAMP)`,
        [mgmt.id, 'New Sale Created', `New ${saleType} sale for company #${companyId}`,
         saleId, companyId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: saleId,
      ...saleResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  } finally {
    client.release();
  }
});

// PUT: Approve/Update sale status
router.put('/:id/approve', authMiddleware, requirePermission('sales.approve'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { approvalNotes } = req.body;

    await client.query('BEGIN');

    // Update sale status
    const result = await client.query(
      `UPDATE sales SET
        status = 'Approved',
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $1
       WHERE id = $2 AND status = 'Submitted'
       RETURNING *`,
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sale not found or not in Submitted status' });
    }

    const sale = result.rows[0];

    // Log audit
    await client.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, new_values, created_at)
       VALUES ($1, 'Approve', 'sales', $2, $3, CURRENT_TIMESTAMP)`,
      [req.user.id, id, JSON.stringify({ status: 'Approved', approvalNotes })]
    );

    // Notify sales rep
    await client.query(
      `INSERT INTO notifications (recipient_id, notification_type, title, message,
        priority, related_sale_id, created_at)
       VALUES ($1, 'Approval', $2, $3, 'High', $4, CURRENT_TIMESTAMP)`,
      [sale.sales_rep_id, 'Sale Approved', `Your sale #${id} has been approved`, id]
    );

    await client.query('COMMIT');

    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error approving sale:', error);
    res.status(500).json({ error: 'Failed to approve sale' });
  } finally {
    client.release();
  }
});

module.exports = router;


// ═════════════════════════════════════════════════════════════════════════════
// 5. INVOICING & PAYMENT PROCESSING
// ═════════════════════════════════════════════════════════════════════════════

// routes/invoices.js

// POST: Create invoice from sale
router.post('/', authMiddleware, requirePermission('invoices.create'), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      companyId, saleId, invoiceDate, dueDate,
      lineItems, taxPercent = 0, discountAmount = 0, notes
    } = req.body;

    await client.query('BEGIN');

    // Generate invoice number (format: INV-YYYY-MM-0001)
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const countResult = await client.query(
      `SELECT COUNT(*) as cnt FROM invoices
       WHERE invoice_number LIKE $1 || '-%'`,
      [`INV-${datePrefix}`]
    );
    const invoiceNum = `INV-${datePrefix}-${String(countResult.rows[0].cnt + 1).padStart(4, '0')}`;

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxPercent / 100);
    const totalAmount = subtotal + taxAmount - (discountAmount || 0);

    // Create invoice
    const invoiceResult = await client.query(
      `INSERT INTO invoices (
        invoice_number, company_id, sale_id, invoice_date, due_date,
        subtotal, tax_amount, tax_percent, discount_amount,
        total_amount, amount_remaining, status, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [invoiceNum, companyId, saleId, invoiceDate, dueDate,
       subtotal, taxAmount, taxPercent, discountAmount,
       totalAmount, totalAmount, 'Draft', notes, req.user.id]
    );

    const invoiceId = invoiceResult.rows[0].id;

    // Insert line items
    for (const item of lineItems) {
      await client.query(
        `INSERT INTO invoice_line_items (invoice_id, description, quantity, unit_price, line_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [invoiceId, item.description, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
      );
    }

    // Queue for QB sync
    await client.query(
      `INSERT INTO quickbooks_sync_logs (
        sync_type, entity_type, entity_id, sync_status, sync_direction, created_at
      ) VALUES ('Invoice', 'invoices', $1, 'Pending', 'To QB', CURRENT_TIMESTAMP)`,
      [invoiceId]
    );

    // Log activity
    await client.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, action_details, device_type, created_at)
       VALUES ($1, 'invoices', $2, 'Create', $3, $4, CURRENT_TIMESTAMP)`,
      [req.user.id, invoiceId, JSON.stringify({ invoiceNum, totalAmount }), req.body.deviceType]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: invoiceId,
      invoiceNumber: invoiceNum,
      totalAmount: totalAmount,
      status: 'Draft'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  } finally {
    client.release();
  }
});

// POST: Record payment
router.post('/payments', authMiddleware, requirePermission('payments.create'), async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      invoiceId, companyId, paymentDate, amount,
      paymentMethod, referenceNumber, notes
    } = req.body;

    await client.query('BEGIN');

    // Generate payment number
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const countResult = await client.query(
      `SELECT COUNT(*) as cnt FROM payments
       WHERE payment_number LIKE $1 || '-%'`,
      [`PAY-${datePrefix}`]
    );
    const paymentNum = `PAY-${datePrefix}-${String(countResult.rows[0].cnt + 1).padStart(4, '0')}`;

    // Create payment
    const paymentResult = await client.query(
      `INSERT INTO payments (
        payment_number, invoice_id, company_id, payment_date, amount,
        payment_method, reference_number, notes, payment_status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Completed', $9)
       RETURNING *`,
      [paymentNum, invoiceId, companyId, paymentDate, amount,
       paymentMethod, referenceNumber, notes, req.user.id]
    );

    const paymentId = paymentResult.rows[0].id;

    // Update invoice amounts
    const invoiceResult = await client.query(
      `UPDATE invoices SET
        amount_paid = amount_paid + $1,
        amount_remaining = total_amount - (amount_paid + $1),
        status = CASE
          WHEN (amount_paid + $1) >= total_amount THEN 'Paid'
          WHEN (amount_paid + $1) > 0 THEN 'Partial'
          ELSE status
        END,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [amount, invoiceId]
    );

    // Queue for QB sync
    await client.query(
      `INSERT INTO quickbooks_sync_logs (
        sync_type, entity_type, entity_id, sync_status, sync_direction, created_at
      ) VALUES ('Payment', 'payments', $1, 'Pending', 'To QB', CURRENT_TIMESTAMP)`,
      [paymentId]
    );

    // Log activity
    await client.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, action_details, device_type, created_at)
       VALUES ($1, 'payments', $2, 'Create', $3, $4, CURRENT_TIMESTAMP)`,
      [req.user.id, paymentId, JSON.stringify({ amount, invoiceId }), req.body.deviceType]
    );

    await client.query('COMMIT');

    res.status(201).json({
      id: paymentId,
      paymentNumber: paymentNum,
      amount: amount,
      invoice: invoiceResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error recording payment:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  } finally {
    client.release();
  }
});

module.exports = router;


// ═════════════════════════════════════════════════════════════════════════════
// 6. AGREEMENT & E-SIGNATURE MANAGEMENT
// ═════════════════════════════════════════════════════════════════════════════

// routes/agreements.js

// POST: Create agreement
router.post('/', authMiddleware, requirePermission('agreements.create'), async (req, res) => {
  const client = await pool.connect();
  try {
    const { companyId, saleId, agreementType, signers, documentData } = req.body;

    await client.query('BEGIN');

    // Generate agreement number
    const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '');
    const countResult = await client.query(
      `SELECT COUNT(*) as cnt FROM agreements
       WHERE agreement_number LIKE $1 || '-%'`,
      [`AGR-${datePrefix}`]
    );
    const agreementNum = `AGR-${datePrefix}-${String(countResult.rows[0].cnt + 1).padStart(4, '0')}`;

    // Create agreement
    const agreementResult = await client.query(
      `INSERT INTO agreements (
        agreement_number, company_id, sale_id, agreement_type, status,
        created_by, updated_by
      ) VALUES ($1, $2, $3, $4, 'Draft', $5, $6)
       RETURNING *`,
      [agreementNum, companyId, saleId, agreementType, req.user.id, req.user.id]
    );

    const agreementId = agreementResult.rows[0].id;

    // Add signatories
    for (const signer of signers) {
      await client.query(
        `INSERT INTO agreement_signatories (
          agreement_id, signer_name, signer_title, signer_email, signer_phone
        ) VALUES ($1, $2, $3, $4, $5)`,
        [agreementId, signer.name, signer.title, signer.email, signer.phone]
      );
    }

    // Store document (base64 or file path)
    if (documentData) {
      await client.query(
        `INSERT INTO agreement_documents (
          agreement_id, document_version, file_name, file_path, storage_type, is_current_version, created_by
        ) VALUES ($1, 1, $2, $3, $4, true, $5)`,
        [agreementId, `${agreementNum}_v1.pdf`, documentData.path, 'local', req.user.id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      id: agreementId,
      agreementNumber: agreementNum,
      status: 'Draft',
      signerCount: signers.length
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating agreement:', error);
    res.status(500).json({ error: 'Failed to create agreement' });
  } finally {
    client.release();
  }
});

// POST: Capture signature
router.post('/:id/sign', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { signatoryId, signatureData, metadata } = req.body;

    await client.query('BEGIN');

    // Store signature
    await client.query(
      `INSERT INTO signatures (
        signatory_id, signature_data_type, signature_content,
        signature_timestamp, device_type, platform, created_at
      ) VALUES ($1, 'base64', $2, CURRENT_TIMESTAMP, $3, $4, CURRENT_TIMESTAMP)`,
      [signatoryId, signatureData, metadata.deviceType, metadata.platform]
    );

    // Update signatory status
    const signatoryResult = await client.query(
      `UPDATE agreement_signatories SET
        signature_status = 'Signed',
        signature_date = CURRENT_TIMESTAMP,
        signature_ip_address = $1::inet
       WHERE id = $2 AND agreement_id = $3
       RETURNING *`,
      [req.ip, signatoryId, id]
    );

    // Check if all signers have signed
    const signaturesResult = await client.query(
      `SELECT COUNT(*) as total, COUNT(CASE WHEN signature_status = 'Signed' THEN 1 END) as signed
       FROM agreement_signatories
       WHERE agreement_id = $1`,
      [id]
    );

    const { total, signed } = signaturesResult.rows[0];

    let newStatus = 'Signed';
    if (parseInt(signed) === parseInt(total)) {
      // All signed - move to Executed
      newStatus = 'Executed';
      await client.query(
        `UPDATE agreements SET status = 'Executed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );
    }

    // Log activity
    await client.query(
      `INSERT INTO activity_logs (user_id, entity_type, entity_id, action, action_details, device_type, created_at)
       VALUES ($1, 'agreements', $2, 'Sign', $3, $4, CURRENT_TIMESTAMP)`,
      [req.user.id || null, id, JSON.stringify({ signatoryId, signed, total }), metadata.deviceType]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      status: newStatus,
      signed: parseInt(signed),
      total: parseInt(total)
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error signing agreement:', error);
    res.status(500).json({ error: 'Failed to sign agreement' });
  } finally {
    client.release();
  }
});

module.exports = router;


// ═════════════════════════════════════════════════════════════════════════════
// 7. QUICKBOOKS SYNC SERVICE (Background Job)
// ═════════════════════════════════════════════════════════════════════════════

// services/quickbooksSyncService.js
const axios = require('axios');

class QuickBooksSync {
  constructor(realmId, accessToken) {
    this.realmId = realmId;
    this.accessToken = accessToken;
    this.apiBase = `https://quickbooks.api.intuit.com/v2/company/${realmId}`;
  }

  async syncPendingItems() {
    try {
      // Fetch pending syncs
      const result = await pool.query(
        `SELECT * FROM quickbooks_sync_logs
         WHERE sync_status = 'Pending'
         AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
         LIMIT 50`
      );

      console.log(`Found ${result.rows.length} pending QB sync items`);

      for (const syncLog of result.rows) {
        await this.processSyncItem(syncLog);
      }
    } catch (error) {
      console.error('QB sync error:', error);
    }
  }

  async processSyncItem(syncLog) {
    try {
      if (syncLog.sync_type === 'Customer') {
        await this.syncCustomer(syncLog.entity_id);
      } else if (syncLog.sync_type === 'Invoice') {
        await this.syncInvoice(syncLog.entity_id);
      } else if (syncLog.sync_type === 'Payment') {
        await this.syncPayment(syncLog.entity_id);
      }
    } catch (error) {
      console.error(`Error syncing ${syncLog.sync_type}:`, error);

      // Update sync log with error
      await pool.query(
        `UPDATE quickbooks_sync_logs SET
          sync_status = 'Failed',
          error_message = $1,
          retry_count = retry_count + 1,
          last_retry_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [error.message, syncLog.id]
      );
    }
  }

  async syncInvoice(invoiceId) {
    // Fetch invoice from AVIDSPHERE
    const invoiceResult = await pool.query(
      `SELECT i.*, c.company_name, c.email_address, c.quickbooks_id
       FROM invoices i
       JOIN companies c ON i.company_id = c.id
       WHERE i.id = $1`,
      [invoiceId]
    );

    if (invoiceResult.rows.length === 0) {
      throw new Error('Invoice not found');
    }

    const invoice = invoiceResult.rows[0];

    // Get line items
    const lineItemsResult = await pool.query(
      'SELECT * FROM invoice_line_items WHERE invoice_id = $1',
      [invoiceId]
    );

    // Build QB invoice payload
    const qbInvoicePayload = {
      Line: lineItemsResult.rows.map((item, idx) => ({
        Id: String(idx + 1),
        LineNum: idx + 1,
        Amount: item.line_total,
        DetailType: 'SalesItemLineDetail',
        Description: item.description,
        SalesItemLineDetail: {
          UnitPrice: item.unit_price,
          Qty: item.quantity,
          ItemRef: {
            value: '1'  // Default item reference
          }
        }
      })),
      CustomerRef: {
        value: invoice.quickbooks_id || 'customer-id-from-qb'
      },
      DueDate: invoice.due_date,
      TxnDate: invoice.invoice_date,
      DocNumber: invoice.invoice_number,
      TotalAmt: invoice.total_amount
    };

    // POST to QB API
    const response = await axios.post(
      `${this.apiBase}/invoice`,
      qbInvoicePayload,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const qbInvoiceId = response.data.Invoice.Id;

    // Update sync log and invoice with QB ID
    await pool.query(
      `UPDATE quickbooks_sync_logs SET
        quickbooks_id = $1,
        sync_status = 'Synced',
        synced_at = CURRENT_TIMESTAMP
       WHERE entity_id = $2 AND sync_type = 'Invoice'`,
      [qbInvoiceId, invoiceId]
    );

    await pool.query(
      'UPDATE invoices SET quickbooks_id = $1, status = $2 WHERE id = $3',
      [qbInvoiceId, 'Sent', invoiceId]
    );

    console.log(`Synced invoice ${invoiceId} to QB as ${qbInvoiceId}`);
  }

  async syncPayment(paymentId) {
    const paymentResult = await pool.query(
      `SELECT p.*, i.quickbooks_id as invoice_qb_id, c.quickbooks_id
       FROM payments p
       JOIN invoices i ON p.invoice_id = i.id
       JOIN companies c ON p.company_id = c.id
       WHERE p.id = $1`,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      throw new Error('Payment not found');
    }

    const payment = paymentResult.rows[0];

    // Build QB payment payload
    const qbPaymentPayload = {
      TxnDate: payment.payment_date,
      Line: [
        {
          Amount: payment.amount,
          LinkedTxn: [
            {
              TxnId: payment.invoice_qb_id,
              TxnType: 'Invoice'
            }
          ]
        }
      ],
      CustomerRef: {
        value: payment.quickbooks_id
      },
      ReferenceNumber: payment.reference_number,
      PrivateNote: payment.notes
    };

    // POST to QB API
    const response = await axios.post(
      `${this.apiBase}/payment`,
      qbPaymentPayload,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const qbPaymentId = response.data.Payment.Id;

    // Update sync log
    await pool.query(
      `UPDATE quickbooks_sync_logs SET
        quickbooks_id = $1,
        sync_status = 'Synced',
        synced_at = CURRENT_TIMESTAMP
       WHERE entity_id = $2 AND sync_type = 'Payment'`,
      [qbPaymentId, paymentId]
    );

    await pool.query(
      'UPDATE payments SET quickbooks_id = $1 WHERE id = $2',
      [qbPaymentId, paymentId]
    );

    console.log(`Synced payment ${paymentId} to QB as ${qbPaymentId}`);
  }
}

// Run sync every 5 minutes
setInterval(async () => {
  const configResult = await pool.query('SELECT * FROM quickbooks_config WHERE is_active = true LIMIT 1');
  
  if (configResult.rows.length > 0) {
    const config = configResult.rows[0];
    const sync = new QuickBooksSync(config.realm_id, config.access_token);
    await sync.syncPendingItems();
  }
}, 5 * 60 * 1000);

module.exports = QuickBooksSync;


// ═════════════════════════════════════════════════════════════════════════════
// 8. WEBHOOK RECEIVER (QB → AVIDSPHERE)
// ═════════════════════════════════════════════════════════════════════════════

// routes/webhooks.js
router.post('/quickbooks', async (req, res) => {
  try {
    const { realmId, dataChangeEvent } = req.body;

    // Verify webhook signature (optional but recommended)
    // validateSignature(req);

    for (const entity of dataChangeEvent.entities) {
      if (entity.name === 'Payment') {
        // Fetch payment details from QB
        const qbPayment = await getFromQuickBooks(
          `/payment/${entity.id}`,
          realmId
        );

        // Find matching invoice in AVIDSPHERE
        const invoiceResult = await pool.query(
          'SELECT * FROM invoices WHERE quickbooks_id = $1',
          [qbPayment.Invoice.Id]
        );

        if (invoiceResult.rows.length > 0) {
          const invoice = invoiceResult.rows[0];

          // Create payment record in AVIDSPHERE
          const paymentNum = `PAY-QB-${Date.now()}`;
          
          await pool.query(
            `INSERT INTO payments (
              payment_number, invoice_id, company_id, payment_date, amount,
              payment_method, payment_status, quickbooks_id, created_by
            ) VALUES ($1, $2, $3, $4, $5, 'QB Sync', 'Completed', $6, NULL)`,
            [paymentNum, invoice.id, invoice.company_id, qbPayment.TxnDate,
             qbPayment.TotalAmt, entity.id]
          );

          // Update invoice
          await pool.query(
            `UPDATE invoices SET
              amount_paid = amount_paid + $1,
              amount_remaining = total_amount - (amount_paid + $1),
              status = CASE
                WHEN (amount_paid + $1) >= total_amount THEN 'Paid'
                ELSE 'Partial'
              END
             WHERE id = $2`,
            [qbPayment.TotalAmt, invoice.id]
          );
        }
      }
    }

    res.json({ status: 'processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;

