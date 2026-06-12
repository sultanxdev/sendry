# 🗄️ Database Schema & Design

## MongoDB Schema Design

### Collection: users

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  username: String,           // unique, lowercase
  email: String,              // unique, lowercase
  password: String,           // bcrypt hashed
  
  // Role & Permissions
  role: String,               // 'super_admin' | 'client_admin' | 'client_viewer'
  clientId: ObjectId,         // ref to clients (null if super_admin)
  
  permissions: {
    canCreateApiKeys: Boolean,
    canManageUsers: Boolean,
    canViewAnalytics: Boolean,
    canExportData: Boolean,
    customPermissions: [String]
  },
  
  // Status
  isActive: Boolean,          // default: true
  lastLogin: Date,
  lastLoginIp: String,
  
  // Metadata
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    phone: String,
    timezone: String
  },
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId,        // which user created this user
  lastModifiedBy: ObjectId
}

// Indexes
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ clientId: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ isActive: 1, clientId: 1 })
```

### Collection: apiKeys

```javascript
{
  _id: ObjectId,
  
  // Key Identification
  keyId: String,              // unique, user-facing ID (sk_live_xxx)
  keyValue: String,           // unique, hashed
  keyPrefix: String,          // first 8 chars for display
  
  // Ownership
  clientId: ObjectId,         // ref to clients
  createdBy: ObjectId,        // ref to users
  
  // Metadata
  name: String,
  description: String,
  environment: String,        // 'production' | 'staging' | 'development' | 'testing'
  
  // Permissions
  permissions: {
    canIngest: Boolean,       // default: true
    canReadAnalytics: Boolean,
    canExportData: Boolean,
    allowedServices: [String], // empty = all
    rateLimit: {
      requestsPerSecond: Number,
      burstAllowed: Number
    }
  },
  
  // Security
  security: {
    allowedIPs: [String],
    allowedOrigins: [String],
    requireHttps: Boolean,
    rotationEnabled: Boolean,
    lastRotated: Date,
    rotationWarningDays: Number,
    securityScore: Number      // 0-100
  },
  
  // Expiry
  expiresAt: Date,
  willExpireIn: Number,       // days
  
  // Usage Tracking
  lastUsed: Date,
  totalApiCalls: Number,      // counter
  errorCount: Number,
  
  // Status
  isActive: Boolean,
  isRotated: Boolean,         // soft-delete with rotation
  revocationReason: String,
  revokedAt: Date,
  revokedBy: ObjectId,
  
  // Audit
  createdAt: Date,
  updatedAt: Date
}

// Indexes
db.apiKeys.createIndex({ keyId: 1 }, { unique: true })
db.apiKeys.createIndex({ keyValue: 1 }, { unique: true })
db.apiKeys.createIndex({ clientId: 1 })
db.apiKeys.createIndex({ clientId: 1, isActive: 1 })
db.apiKeys.createIndex({ expiresAt: 1 })
db.apiKeys.createIndex({ isActive: 1, environment: 1 })
```

### Collection: clients

```javascript
{
  _id: ObjectId,
  
  // Basic Info
  name: String,
  slug: String,               // unique, lowercase, kebab-case
  email: String,
  website: String,
  description: String,
  logo: String,               // S3 URL
  
  // Ownership
  createdBy: ObjectId,        // ref to users (super_admin)
  
  // Settings
  settings: {
    dataRetentionDays: Number,      // 7-365, default 30
    alertsEnabled: Boolean,
    alertEmail: String,
    timezone: String,
    theme: String,                  // 'light' | 'dark'
    
    notifications: {
      errorThreshold: Number,       // %
      latencyThreshold: Number,     // ms
      downtime: Boolean,
      dailyDigest: Boolean
    }
  },
  
  // Usage
  usage: {
    totalApiHits: Number,
    totalApiKeys: Number,
    totalUsers: Number,
    storageUsedMb: Number
  },
  
  // Subscription
  subscription: {
    plan: String,             // 'free' | 'pro' | 'enterprise'
    status: String,           // 'active' | 'past_due' | 'cancelled'
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelledAt: Date,
    cancelReason: String
  },
  
  // Billing
  billing: {
    customerId: String,       // Razorpay customer ID
    paymentMethod: String,
    nextBillingDate: Date
  },
  
  // Status
  isActive: Boolean,
  isSuspended: Boolean,
  suspensionReason: String,
  
  // Audit
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date             // soft delete
}

// Indexes
db.clients.createIndex({ slug: 1 }, { unique: true })
db.clients.createIndex({ createdBy: 1 })
db.clients.createIndex({ isActive: 1 })
db.clients.createIndex({ "subscription.status": 1 })
db.clients.createIndex({ createdAt: -1 })
```

### Collection: apiHits (TTL: 30 days)

```javascript
{
  _id: ObjectId,
  
  // Event Identification
  eventId: String,            // unique, UUID
  timestamp: Date,
  
  // Request Details
  serviceName: String,        // e.g., 'user-service'
  endpoint: String,           // e.g., '/api/users'
  method: String,             // 'GET' | 'POST' | etc.
  statusCode: Number,
  latencyMs: Number,
  
  // Client Info
  clientId: ObjectId,         // ref to clients
  apiKeyId: ObjectId,         // ref to apiKeys
  
  // Request Details
  ip: String,
  userAgent: String,
  
  // Optional
  userId: String,             // client's internal user ID
  metadata: Object,           // custom fields
  
  // Audit
  createdAt: Date
}

// Indexes
db.api_hits.createIndex({ clientId: 1, timestamp: -1 })
db.api_hits.createIndex({ clientId: 1, serviceName: 1, endpoint: 1 })
db.api_hits.createIndex({ apiKeyId: 1, timestamp: -1 })
db.api_hits.createIndex({ eventId: 1 }, { unique: true })
// TTL Index
db.api_hits.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })
```

### Collection: auditLogs

```javascript
{
  _id: ObjectId,
  
  // Action Info
  action: String,             // 'user_created', 'api_key_rotated', etc.
  resource: String,           // 'user', 'apiKey', 'client'
  resourceId: ObjectId,
  
  // Actor
  userId: ObjectId,           // who did it
  userEmail: String,
  
  // Details
  changes: {
    before: Object,
    after: Object
  },
  
  // Context
  ip: String,
  userAgent: String,
  status: String,             // 'success' | 'failure'
  
  timestamp: Date
}

// Indexes
db.audit_logs.createIndex({ userId: 1, timestamp: -1 })
db.audit_logs.createIndex({ resourceId: 1 })
db.audit_logs.createIndex({ timestamp: -1 })
db.audit_logs.createIndex({ action: 1 })
```

---

## PostgreSQL Schema Design

### Table: endpoint_metrics

```sql
CREATE TABLE endpoint_metrics (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identification
  client_id UUID NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(1024) NOT NULL,
  method VARCHAR(10) NOT NULL,
  
  -- Metrics
  total_hits BIGINT NOT NULL DEFAULT 0,
  error_hits BIGINT NOT NULL DEFAULT 0,
  success_hits BIGINT NOT NULL DEFAULT 0,
  
  -- Latency
  avg_latency FLOAT NOT NULL DEFAULT 0,
  min_latency FLOAT NOT NULL DEFAULT 0,
  max_latency FLOAT NOT NULL DEFAULT 0,
  p50_latency FLOAT,
  p95_latency FLOAT,
  p99_latency FLOAT,
  
  -- Grouping
  time_bucket TIMESTAMP NOT NULL,  -- hourly bucket
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(client_id, service_name, endpoint, method, time_bucket),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Indexes for common queries
CREATE INDEX idx_endpoint_metrics_client_time 
  ON endpoint_metrics(client_id, time_bucket DESC);

CREATE INDEX idx_endpoint_metrics_service_endpoint 
  ON endpoint_metrics(client_id, service_name, endpoint, time_bucket DESC);

CREATE INDEX idx_endpoint_metrics_status
  ON endpoint_metrics(client_id, time_bucket DESC);
```

### Table: error_summary

```sql
CREATE TABLE error_summary (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identification
  client_id UUID NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(1024) NOT NULL,
  status_code INT NOT NULL,
  
  -- Metrics
  error_count BIGINT NOT NULL DEFAULT 0,
  
  -- Grouping
  time_bucket TIMESTAMP NOT NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, service_name, endpoint, status_code, time_bucket),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE INDEX idx_error_summary_client_status
  ON error_summary(client_id, status_code, time_bucket DESC);
```

### Table: latency_distribution

```sql
CREATE TABLE latency_distribution (
  id BIGSERIAL PRIMARY KEY,
  
  -- Identification
  client_id UUID NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(1024) NOT NULL,
  
  -- Buckets
  bucket_0_100ms BIGINT DEFAULT 0,
  bucket_100_500ms BIGINT DEFAULT 0,
  bucket_500_1000ms BIGINT DEFAULT 0,
  bucket_1000_5000ms BIGINT DEFAULT 0,
  bucket_5000_plus BIGINT DEFAULT 0,
  
  -- Grouping
  time_bucket TIMESTAMP NOT NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, service_name, endpoint, time_bucket)
);
```

### Table: clients

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_clients_active ON clients(is_active),
  INDEX idx_clients_created ON clients(created_at DESC)
);
```

---

## Data Partitioning Strategy

### MongoDB Sharding

**Shard Key**: `{ clientId: 1, timestamp: 1 }`

**Rationale**:
- Ensures even distribution across shards
- Enables range queries by time
- Clients isolated to specific shards

### PostgreSQL Partitioning

**Partition Strategy**: Time-based (monthly)

```sql
-- Create partition for May 2026
CREATE TABLE endpoint_metrics_2026_05 PARTITION OF endpoint_metrics
  FOR VALUES FROM ('2026-05-01'::timestamp) TO ('2026-06-01'::timestamp);
```

**Benefits**:
- Faster queries on recent data
- Easier archiving of old data
- Better index performance

---

## Backup & Recovery

### MongoDB

**Backup Strategy**:
- Daily full backups
- Point-in-time recovery enabled
- Replication across regions

**Recovery Time Objective (RTO)**: 1 hour
**Recovery Point Objective (RPO)**: 1 hour

### PostgreSQL

**Backup Strategy**:
- Continuous WAL archiving
- Weekly full backups
- Point-in-time recovery

**RTO**: 30 minutes
**RPO**: 15 minutes

---

## Data Retention Policies

| Collection | Retention | Strategy |
|-----------|-----------|----------|
| api_hits | 30 days | TTL Index (auto-delete) |
| endpoint_metrics | 2 years | Manual archival to S3 |
| error_summary | 1 year | Manual archival to S3 |
| audit_logs | 7 years | Compliance requirement |
| users | Indefinite | Soft delete |

---

## Query Performance

### Common Queries & Indexes

**Get top endpoints for a client**:
```sql
SELECT service_name, endpoint, method, SUM(total_hits) as hits
FROM endpoint_metrics
WHERE client_id = $1 AND time_bucket >= $2 AND time_bucket <= $3
GROUP BY service_name, endpoint, method
ORDER BY hits DESC
LIMIT 10;

-- Uses index: idx_endpoint_metrics_service_endpoint
```

**Get error rate for a time period**:
```sql
SELECT 
  SUM(error_hits)::float / SUM(total_hits) * 100 as error_rate
FROM endpoint_metrics
WHERE client_id = $1 AND time_bucket >= $2 AND time_bucket <= $3;

-- Uses index: idx_endpoint_metrics_client_time
```

**Get latency percentiles**:
```sql
SELECT percentile_cont(0.95) WITHIN GROUP (ORDER BY avg_latency) as p95
FROM endpoint_metrics
WHERE client_id = $1 AND time_bucket >= $2 AND time_bucket <= $3;
```

---

## Consistency & ACID Guarantees

### MongoDB

**Transactions** (Multi-document):
```javascript
// Update user and log action atomically
session.startTransaction();
await users.updateOne({ _id }, { $set: {...} }, { session });
await auditLogs.insertOne({ ... }, { session });
session.commitTransaction();
```

### PostgreSQL

**Transactions**:
```sql
BEGIN;
  UPDATE endpoint_metrics SET total_hits = total_hits + 1 WHERE ...;
  INSERT INTO audit_logs VALUES (...);
COMMIT;
```

**Isolation Level**: `READ_COMMITTED` (default)

---

## Schema Evolution

### Versioning

MongoDB documents have implicit versioning via `updatedAt` field.

For breaking changes:
1. Create new collection with `_v2` suffix
2. Run migration script
3. Update application code
4. Remove old collection after verification

### Migration Example

```javascript
// Migration script
db.users.updateMany(
  { deletedAt: { $exists: false } },
  { $set: { status: 'active' } }
);
```

---

## References

- MongoDB Best Practices: https://docs.mongodb.com/manual/core/data-models/
- PostgreSQL Performance: https://www.postgresql.org/docs/current/performance.html
- Designing Time-Series Data: https://docs.mongodb.com/manual/core/timeseries/
