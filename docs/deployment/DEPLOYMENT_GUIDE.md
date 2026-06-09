# AVIDSPHERE CRM - IMPLEMENTATION & DEPLOYMENT GUIDE

## Quick Start Checklist

- [ ] Review all 4 database files (SCHEMA, ARCHITECTURE, ERD, BACKEND_IMPLEMENTATION)
- [ ] Set up PostgreSQL instance
- [ ] Deploy schema
- [ ] Configure environment variables
- [ ] Set up API layer
- [ ] Implement QB integration
- [ ] Create iOS/web clients
- [ ] Load initial data
- [ ] Run integration tests
- [ ] Deploy to production

---

## Installation & Setup

### 1. PostgreSQL Installation

**Option A: Docker (Recommended for development)**
```bash
docker run --name avidsphere-db \
  -e POSTGRES_USER=avidsphere_user \
  -e POSTGRES_PASSWORD=secure_password_123 \
  -e POSTGRES_DB=avidsphere_crm \
  -p 5432:5432 \
  -v avidsphere_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

**Option B: Local Installation (macOS)**
```bash
brew install postgresql@15
brew services start postgresql@15
createdb avidsphere_crm
createuser avidsphere_user
psql avidsphere_crm -c "ALTER USER avidsphere_user WITH PASSWORD 'password';"
```

**Option C: AWS RDS (Production)**
```bash
# Create RDS instance via AWS Console
# - Engine: PostgreSQL 15.x
# - Instance: db.t3.small (for 5-25 users)
# - Storage: 100GB General Purpose SSD
# - Backup retention: 30 days
# - Multi-AZ: Yes
# - Enable encryption at rest
```

### 2. Deploy Database Schema

```bash
# Connect to database
psql -U avidsphere_user -d avidsphere_crm -h localhost -p 5432 \
  -f DATABASE_SCHEMA.sql

# Verify tables created
psql -U avidsphere_user -d avidsphere_crm -c "\dt+"

# Expected output: 40+ tables
```

### 3. Environment Configuration

**Create `.env` file in backend directory:**
```env
# Database
DATABASE_URL="postgresql://avidsphere_user:secure_password_123@localhost:5432/avidsphere_crm"
DB_USER="avidsphere_user"
DB_PASSWORD="secure_password_123"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="avidsphere_crm"

# Authentication
JWT_SECRET="your-secret-key-min-32-characters-long-please"
JWT_EXPIRY="24h"
BCRYPT_ROUNDS=12

# Server
NODE_ENV="development"
PORT=3000

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
DEFAULT_FROM_EMAIL="noreply@avidsphere.local"

# QuickBooks OAuth
QB_CLIENT_ID="your-client-id"
QB_CLIENT_SECRET="your-client-secret"
QB_REALM_ID="your-realm-id"
QB_REDIRECT_URI="http://localhost:3000/api/auth/quickbooks/callback"

# Stripe (for payment processing)
STRIPE_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxxxxxxxxxxxx"

# File Storage
STORAGE_TYPE="local"  # or "s3"
STORAGE_PATH="./uploads"
S3_BUCKET="avidsphere-crm-bucket"
S3_REGION="us-east-1"

# Logging
LOG_LEVEL="info"
LOG_FILE="./logs/app.log"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 4. Backend Setup

```bash
# Initialize Node.js project
npm init -y

# Install dependencies
npm install express pg bcrypt jsonwebtoken cors dotenv
npm install --save-dev nodemon jest supertest

# Create directory structure
mkdir -p src/{routes,middleware,services,models,utils,config}
mkdir -p logs uploads tests

# Copy backend implementation files
cp BACKEND_IMPLEMENTATION.js src/index.js
```

**Create `package.json` scripts:**
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --forceExit --detectOpenHandles",
    "test:watch": "jest --watch",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  }
}
```

### 5. Run Initial Tests

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
# {"status": "ok", "database": "connected", "timestamp": "2026-06-07T..."}
```

---

## Database Initialization

### Initial Data Seed

**Create `scripts/seed.js`:**
```javascript
const pool = require('../config/database');

async function seedData() {
  try {
    const client = await pool.connect();
    
    // 1. Create admin user
    const adminResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, display_name)
       VALUES (
         'admin@avidsphere.local',
         '$2b$12$...[bcrypt hash]...',
         'Admin',
         'User',
         'System Administrator'
       )
       RETURNING id`
    );
    
    // 2. Assign admin role
    const adminRoleResult = await client.query('SELECT id FROM roles WHERE name = $1', ['Admin']);
    await client.query(
      'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
      [adminResult.rows[0].id, adminRoleResult.rows[0].id, adminResult.rows[0].id]
    );
    
    console.log('✓ Seed data loaded successfully');
    client.release();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedData();
```

### Backup Strategy

**Daily backup script (`scripts/backup.sh`):**
```bash
#!/bin/bash
BACKUP_DIR="/backups/avidsphere"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U avidsphere_user avidsphere_crm \
  --format=custom \
  --file="$BACKUP_DIR/backup_$TIMESTAMP.dump" \
  --verbose

# Keep only last 30 backups
find $BACKUP_DIR -type f -name "backup_*.dump" \
  -mtime +30 -delete

echo "Backup completed: backup_$TIMESTAMP.dump"
```

**Add to crontab (run daily at 2 AM):**
```
0 2 * * * /path/to/scripts/backup.sh
```

---

## Role-Based Access Control Setup

### Create Sample Users

```sql
-- Sales Staff User
INSERT INTO users (email, password_hash, first_name, last_name, display_name)
VALUES (
  'john.sales@avidsphere.local',
  '$2b$12$...[hash]...',
  'John',
  'Salesperson',
  'John Salesperson'
);

INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  (SELECT id FROM users WHERE email = 'john.sales@avidsphere.local'),
  (SELECT id FROM roles WHERE name = 'Sales Staff'),
  (SELECT id FROM users WHERE email = 'admin@avidsphere.local');

-- Management User
INSERT INTO users (email, password_hash, first_name, last_name, display_name)
VALUES (
  'jane.mgmt@avidsphere.local',
  '$2b$12$...[hash]...',
  'Jane',
  'Manager',
  'Jane Manager'
);

INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  (SELECT id FROM users WHERE email = 'jane.mgmt@avidsphere.local'),
  (SELECT id FROM roles WHERE name = 'Management'),
  (SELECT id FROM users WHERE email = 'admin@avidsphere.local');

-- Finance User
INSERT INTO users (email, password_hash, first_name, last_name, display_name)
VALUES (
  'finance@avidsphere.local',
  '$2b$12$...[hash]...',
  'Finance',
  'Team',
  'Finance Department'
);

INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  (SELECT id FROM users WHERE email = 'finance@avidsphere.local'),
  (SELECT id FROM roles WHERE name = 'Finance'),
  (SELECT id FROM users WHERE email = 'admin@avidsphere.local');
```

---

## QuickBooks Integration Setup

### 1. OAuth 2.0 Configuration

**Get OAuth credentials:**
1. Go to [Intuit Developer Portal](https://developer.intuit.com)
2. Create app → Accounting
3. Copy Client ID & Client Secret
4. Set Redirect URI: `http://localhost:3000/api/auth/quickbooks/callback`

### 2. QB Sync Implementation

**Create `services/quickbooksIntegration.js`:**
```javascript
const axios = require('axios');
const pool = require('../config/database');

class QuickBooksIntegration {
  async authorize(authorizationCode, realmId) {
    // Exchange auth code for tokens
    const response = await axios.post('https://oauth.platform.intuit.com/oauth2/tokens/bearer', {
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: process.env.QB_REDIRECT_URI
    }, {
      auth: {
        username: process.env.QB_CLIENT_ID,
        password: process.env.QB_CLIENT_SECRET
      }
    });

    // Store tokens
    await pool.query(
      `UPDATE quickbooks_config SET
        realm_id = $1,
        access_token = $2,
        refresh_token = $3,
        token_expiry = CURRENT_TIMESTAMP + INTERVAL '1 hour'
       WHERE is_active = true`,
      [realmId, response.data.access_token, response.data.refresh_token]
    );

    return response.data;
  }

  async startSync() {
    // Run sync service
    setInterval(() => this.syncPendingItems(), 5 * 60 * 1000);
    console.log('QB sync service started (runs every 5 minutes)');
  }

  async syncPendingItems() {
    try {
      const result = await pool.query(
        `SELECT * FROM quickbooks_sync_logs
         WHERE sync_status = 'Pending'
         LIMIT 50`
      );

      for (const item of result.rows) {
        await this.processSyncItem(item);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  async processSyncItem(item) {
    // Implementation in BACKEND_IMPLEMENTATION.js
    // ...sync logic...
  }
}

module.exports = new QuickBooksIntegration();
```

---

## Monitoring & Maintenance

### 1. Query Performance Monitoring

**Enable slow query logging:**
```sql
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1 second
SELECT pg_reload_conf();
```

**Monitor long-running queries:**
```sql
SELECT 
  pid,
  usename,
  query,
  query_start,
  state,
  EXTRACT(EPOCH FROM (now() - query_start)) as duration_seconds
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start DESC;
```

### 2. Index Health Check

```sql
-- Find missing indexes
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Not used
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find slow indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

### 3. Table Statistics

```sql
-- Monitor table growth
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Auto-vacuum status
SELECT 
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum,
  vacuum_count,
  autovacuum_count
FROM pg_stat_user_tables
ORDER BY last_autovacuum DESC;
```

### 4. Disk Space Monitoring

```sql
-- Check database size
SELECT 
  datname,
  pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname = 'avidsphere_crm';

-- Check table size
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename) DESC;
```

---

## Testing Strategy

### Unit Tests

**Create `tests/auth.test.js`:**
```javascript
const request = require('supertest');
const app = require('../src/index');
const pool = require('../config/database');

describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.sales@avidsphere.local',
        password: 'correct-password',
        deviceId: 'ipad-123',
        deviceType: 'iPad'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john.sales@avidsphere.local',
        password: 'wrong-password',
        deviceId: 'ipad-123',
        deviceType: 'iPad'
      });

    expect(response.status).toBe(401);
  });
});

describe('Permission Checks', () => {
  it('should allow Sales Staff to create customers', async () => {
    const response = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        companyName: 'Test Company',
        email: 'test@company.com'
      });

    expect(response.status).toBe(201);
  });

  it('should deny Sales Staff from managing users', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        email: 'newuser@avidsphere.local',
        role: 'Admin'
      });

    expect(response.status).toBe(403);
  });
});
```

### Integration Tests

**Create `tests/integration.test.js`:**
```javascript
describe('Complete Sales Workflow', () => {
  it('should create company → sale → invoice → payment', async () => {
    // 1. Create company
    const companyRes = await request(app)
      .post('/api/companies')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        companyName: 'Integration Test Co',
        email: 'test@integration.local'
      });

    const companyId = companyRes.body.id;

    // 2. Create sale
    const saleRes = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({
        companyId,
        saleType: 'Digital',
        saleDate: '2026-06-07',
        amount: 5000,
        saleDetails: { /* ... */ }
      });

    const saleId = saleRes.body.id;

    // 3. Create invoice
    const invoiceRes = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        companyId,
        saleId,
        lineItems: [
          {
            description: 'Digital Campaign',
            quantity: 1,
            unitPrice: 5000
          }
        ]
      });

    const invoiceId = invoiceRes.body.id;

    // 4. Record payment
    const paymentRes = await request(app)
      .post('/api/invoices/payments')
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        invoiceId,
        companyId,
        amount: 5000,
        paymentMethod: 'Credit Card',
        paymentDate: '2026-06-07'
      });

    expect(paymentRes.status).toBe(201);
    expect(paymentRes.body.invoice.status).toBe('Paid');
  });
});
```

### Performance Tests

```bash
# Install k6 load testing tool
brew install k6

# Create performance test
cat > tests/load.js << 'EOF'
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up to 20 users
    { duration: '1m', target: 20 },    // Stay at 20 users
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
};

export default function() {
  let res = http.get('http://localhost:3000/api/companies', {
    headers: {
      'Authorization': `Bearer ${__ENV.TOKEN}`
    }
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
EOF

# Run load test
k6 run -e TOKEN="your-token-here" tests/load.js
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Database backups tested and verified
- [ ] SSL/TLS certificates configured
- [ ] Environment variables set for production
- [ ] API rate limiting configured
- [ ] Input validation on all endpoints
- [ ] CORS restrictions set properly
- [ ] Security headers configured (HTTPS, CSP, etc)
- [ ] Error handling doesn't leak sensitive data
- [ ] Logging configured for audit trails
- [ ] Monitoring and alerting set up

### Database

- [ ] Run `VACUUM ANALYZE` on all tables
- [ ] Verify all indexes are present
- [ ] Enable automated backups with 30-day retention
- [ ] Set up read replicas for reporting
- [ ] Configure connection pooling (max 20 connections)
- [ ] Set up cloudwatch/monitoring for:
  - Connection count
  - Disk usage
  - CPU utilization
  - Query performance

### Application

- [ ] Set `NODE_ENV=production`
- [ ] Enable gzip compression
- [ ] Set up PM2 or similar for process management
- [ ] Configure health checks
- [ ] Set up CI/CD pipeline
- [ ] Deploy to staging first
- [ ] Run full integration test suite
- [ ] Verify all QB sync functionality

### Security

- [ ] Enable WAF (Web Application Firewall)
- [ ] Configure DDoS protection
- [ ] Set up IP whitelisting if needed
- [ ] Rotate secrets/keys
- [ ] Enable audit logging
- [ ] Set up intrusion detection
- [ ] Configure database encryption at rest
- [ ] Enable connection encryption (SSL)

### Example Production Setup (AWS)

```
┌─ CloudFront (CDN, caching)
│
├─ Application Load Balancer (HTTPS, sticky sessions)
│  └─ EC2 Instances (t3.medium × 2, auto-scaling)
│     ├─ Node.js app
│     └─ PM2 process manager
│
├─ RDS PostgreSQL (Multi-AZ, backups)
│  ├─ Primary instance (db.t3.small)
│  └─ Read replica (for reports)
│
├─ ElastiCache Redis (Session store, caching)
│
├─ S3 (File storage, backups)
│
├─ CloudWatch (Monitoring, logs)
│
└─ Route 53 (DNS, failover)
```

---

## Troubleshooting

### Connection Issues

```bash
# Test DB connection
psql -U avidsphere_user -d avidsphere_crm -h localhost -c "SELECT 1;"

# Check connection pool
SELECT count(*) FROM pg_stat_activity;

# Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < CURRENT_TIMESTAMP - INTERVAL '30 minutes';
```

### Performance Issues

```sql
-- Identify missing indexes
SELECT schemaname, tablename, attname
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND histogram_bounds IS NULL
ORDER BY null_frac DESC;

-- Find table bloat
SELECT schemaname, tablename,
  round(100 * (pg_relation_size(schemaname || '.' || tablename) -
    pg_relation_size(schemaname || '.' || tablename, 'main')) / 
    pg_relation_size(schemaname || '.' || tablename)) AS bloat_percent
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY bloat_percent DESC;

-- Rebuild table to reclaim space
VACUUM FULL tablename;
```

### QB Sync Failures

```sql
-- Check failed syncs
SELECT sync_type, entity_type, error_message, retry_count, created_at
FROM quickbooks_sync_logs
WHERE sync_status = 'Failed'
ORDER BY created_at DESC;

-- Manually retry failed sync
UPDATE quickbooks_sync_logs
SET sync_status = 'Pending', retry_count = 0
WHERE id = 'specific-sync-id';
```

---

## Support & Documentation

- Schema Documentation: See `DATABASE_SCHEMA.sql`
- Architecture Guide: See `DATABASE_ARCHITECTURE.md`
- Visual ERD: See `DATABASE_ERD.txt`
- API Implementation: See `BACKEND_IMPLEMENTATION.js`
- QB Integration: See QB API docs at https://developer.intuit.com
- PostgreSQL Docs: https://www.postgresql.org/docs/15/

