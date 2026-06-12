# 🏗️ Sendry Architecture

## System Overview

Sendry is a **real-time API monitoring and analytics SaaS platform** designed for scalability, reliability, and real-time event processing.

### Core Philosophy
- **Event-Driven**: Decoupled services via message queues
- **Multi-Tenant**: Complete data isolation per client
- **Resilient**: Circuit breakers, retries, dead-letter queues
- **Observable**: Structured logging, metrics, distributed tracing ready
- **Scalable**: Horizontal scaling for all components

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL CLIENTS                             │
│              (Send API hits with API keys)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────▼──────────────┐
        │  API Gateway / Load Balancer  │
        │  (Rate Limiting, Auth)        │
        └────────────────┬──────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼─────┐       ┌─────▼────┐       ┌──────▼──────┐
│ Ingest  │       │  Auth    │       │ Analytics  │
│Service  │       │ Service  │       │ Service    │
└───┬─────┘       └──────────┘       └────────────┘
    │
    │ Publish Events
    │ (with Circuit Breaker + Retry)
    │
┌───▼─────────────────────────────────┐
│      RabbitMQ Message Queue         │
│  • api_hits (main queue)            │
│  • api_hits.dlq (dead-letter)       │
│  • email_queue                      │
│  • notification_queue               │
└───┬─────────────────────────────────┘
    │
    ├─────────────────┬──────────────┐
    │                 │              │
┌───▼──────┐  ┌─────▼────┐  ┌──────▼──────┐
│Processor │  │ Email    │  │Notification│
│Service   │  │ Worker   │  │ Worker     │
│(Consume) │  │(BullMQ)  │  │(BullMQ)    │
└───┬──────┘  └──────────┘  └────────────┘
    │
    ├──────────────────┬──────────────┐
    │                  │              │
┌───▼──────┐     ┌────▼─────┐    ┌──▼────┐
│MongoDB   │     │PostgreSQL│    │ Redis │
│(Raw Data)│     │(Analytics)    │(Cache)│
└──────────┘     └──────────┘    └───────┘
```

---

## Service Architecture

### 1. Ingest Service
**Purpose**: Accept and queue API hit events from external clients

**Responsibilities**:
- Validate API keys
- Enforce rate limiting
- Validate incoming data
- Publish events to RabbitMQ
- Handle circuit breaker failures

**Scalability**:
- Stateless, can scale horizontally
- Load balance across multiple instances
- Rate limiter per IP

**Reliability**:
- Circuit breaker prevents cascading failures
- Retry logic with exponential backoff
- Publish confirms for message durability

### 2. Auth Service
**Purpose**: User authentication, authorization, and account management

**Responsibilities**:
- User registration/login
- JWT token generation
- Role-based access control
- API key management
- Permission validation

**Scalability**:
- Stateless HTTP service
- Session/JWT stored in cookies (client-side state)
- Database queries cached with Redis

### 3. Analytics Service
**Purpose**: Retrieve and visualize metrics

**Responsibilities**:
- Query aggregated metrics from PostgreSQL
- Calculate statistics and trends
- Permission-based data filtering
- Dashboard data generation

**Scalability**:
- Query optimization with PostgreSQL indexes
- Redis caching for frequent queries
- Lazy evaluation of complex aggregations

### 4. Processor Service
**Purpose**: Consume events and aggregate metrics

**Responsibilities**:
- Consume events from RabbitMQ
- Store raw events in MongoDB
- Aggregate metrics to PostgreSQL
- Manage TTL for old data

**Scalability**:
- Process events in batches
- Parallel processing with multiple workers
- Connection pooling for both databases

### 5. Email Service (Worker)
**Purpose**: Send transactional emails asynchronously

**Responsibilities**:
- Process email jobs from queue
- Retry on failure
- Track delivery status

**Scalability**:
- Multiple worker instances
- Configurable concurrency

### 6. Notification Service (Worker)
**Purpose**: Push notifications for alerts

**Responsibilities**:
- Process notification jobs
- Push to WebSocket or external services
- Track delivery

---

## Data Flow

### Event Ingestion Flow
```
1. Client → POST /api/ingest
   {
     serviceName: "user-api",
     endpoint: "/api/users",
     method: "GET",
     statusCode: 200,
     latencyMs: 45,
     clientId: "...",
     apiKeyId: "..."
   }

2. validateApiKey middleware:
   - Verify API key exists
   - Check permissions
   - Check expiry
   - Check IP whitelist
   → Attach req.client, req.apiKey

3. IngestController.ingestHit():
   - Extract client & API key from request
   - Prepare hit data

4. IngestService.ingestApiHit():
   - Validate required fields
   - Create event with eventId (UUID)
   - Call EventProducer.publishApiHit()

5. EventProducer.publishApiHit():
   - Check CircuitBreaker.allowRequest()
     → If OPEN: return false (503 response)
   - Publish to RabbitMQ
   - Handle acks/nacks
   - Retry with exponential backoff
   → Return true/false

6. IngestController response:
   - If accepted: 202 Accepted
   - If rejected: 503 Service Unavailable

7. RabbitMQ:
   - Message in api_hits queue
   - Multiple processors consume

8. ProcessorService:
   - Receive event
   - Save raw hit to MongoDB
   - Aggregate metrics (group by service/endpoint)
   - Upsert to PostgreSQL with conflict resolution
   - Cache invalidation in Redis

9. AnalyticsService:
   - Query PostgreSQL (cache first in Redis)
   - Return to authenticated users
```

---

## Database Schema

### MongoDB (Raw Events & Master Data)

**Collection: api_hits**
```javascript
{
  _id: ObjectId,
  eventId: String (unique),
  timestamp: Date,
  serviceName: String,
  endpoint: String,
  method: String,
  statusCode: Number,
  latencyMs: Number,
  clientId: ObjectId,
  apiKeyId: ObjectId,
  ip: String,
  userAgent: String,
  createdAt: Date
}

// TTL Index: expires after 30 days
db.api_hits.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })
```

**Collection: users**
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (super_admin | client_admin | client_viewer),
  clientId: ObjectId,
  permissions: {
    canCreateApiKeys: Boolean,
    canManageUsers: Boolean,
    canViewAnalytics: Boolean,
    canExportData: Boolean
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Collection: apiKeys**
```javascript
{
  _id: ObjectId,
  keyId: String (unique),
  keyValue: String (unique, hashed),
  clientId: ObjectId,
  name: String,
  environment: String,
  permissions: {
    canIngest: Boolean,
    canReadAnalytics: Boolean,
    allowedServices: [String]
  },
  security: {
    allowedIPs: [String],
    allowedOrigins: [String],
    lastRotated: Date,
    rotationWarningDays: Number
  },
  expiresAt: Date,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

**Collection: clients**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  email: String,
  description: String,
  createdBy: ObjectId,
  settings: {
    dataRetentionDays: Number (7-365),
    alertsEnabled: Boolean,
    timezone: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### PostgreSQL (Aggregated Metrics)

**Table: endpoint_metrics**
```sql
CREATE TABLE endpoint_metrics (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(1024) NOT NULL,
  method VARCHAR(10) NOT NULL,
  total_hits BIGINT NOT NULL DEFAULT 0,
  error_hits BIGINT NOT NULL DEFAULT 0,
  avg_latency FLOAT NOT NULL DEFAULT 0,
  min_latency FLOAT NOT NULL DEFAULT 0,
  max_latency FLOAT NOT NULL DEFAULT 0,
  time_bucket TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, service_name, endpoint, method, time_bucket),
  INDEX idx_client_time (client_id, time_bucket DESC),
  INDEX idx_service_endpoint (client_id, service_name, endpoint)
);
```

**Table: error_summary**
```sql
CREATE TABLE error_summary (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  endpoint VARCHAR(1024) NOT NULL,
  status_code INT NOT NULL,
  error_count BIGINT NOT NULL DEFAULT 0,
  time_bucket TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id, service_name, endpoint, status_code, time_bucket),
  INDEX idx_client_status (client_id, status_code, time_bucket DESC)
);
```

### Redis (Cache)

```
Keys:
- cache:analytics:stats:{clientId}:{startTime}:{endTime}
- cache:endpoints:top:{clientId}:{limit}
- rate_limit:{ip}
- session:{sessionId}
```

---

## Scaling Strategy

### Horizontal Scaling

**Ingest Service**:
- Deploy multiple instances behind load balancer
- Each instance stateless
- Shared rate limiter (Redis)

**Analytics Service**:
- Deploy multiple instances
- Read replicas for PostgreSQL
- Redis caching for hot data

**Processor Service**:
- Multiple consumer instances (auto-balanced by RabbitMQ)
- Batch processing for throughput
- Connection pooling

### Vertical Scaling

**Database**:
- PostgreSQL: Read replicas, connection pooling, query optimization
- MongoDB: Sharding by clientId
- Redis: Cluster mode for high availability

### Caching Layer

- **Query Cache**: Analytics queries cached in Redis (30min TTL)
- **Session Cache**: JWT tokens validated with cache
- **Rate Limit Cache**: Per-IP counters in Redis

### Database Optimization

**Indexes**:
```sql
-- endpoint_metrics
CREATE INDEX idx_client_time ON endpoint_metrics(client_id, time_bucket DESC);
CREATE INDEX idx_service_endpoint ON endpoint_metrics(client_id, service_name, endpoint);

-- api_hits (MongoDB)
db.api_hits.createIndex({ clientId: 1, timestamp: -1, statusCode: 1 });
db.api_hits.createIndex({ apiKeyId: 1, timestamp: -1 });
```

**Query Optimization**:
- Aggregation pipeline in PostgreSQL
- Partition by date for large tables
- Archive old data to separate storage

---

## Reliability Patterns

### Circuit Breaker

**States**:
- **CLOSED**: Normal operation, all requests pass through
- **OPEN**: Failure threshold exceeded, reject requests
- **HALF_OPEN**: After cooldown, allow test requests

**Configuration**:
```javascript
failureThreshold: 5,        // Failures before OPEN
cooldownMs: 30000,          // Wait before HALF_OPEN
halfOpenMaxAttempts: 3,     // Test requests in HALF_OPEN
```

**Transitions**:
```
CLOSED --[5 failures]--> OPEN
  ↑                        │
  └---[3 successes]-- HALF_OPEN
                           │
                    [1 failure or timeout]
                           ↓
                         OPEN
```

### Retry Strategy

**Exponential Backoff with Jitter**:
```javascript
delay = min(baseDelay * (2 ^ attempt) + jitter, maxDelay)
// Example: 100ms, 200ms, 400ms, 800ms, 1600ms (capped at 5s)
```

**Retryable Errors**:
- Network timeouts
- 5xx server errors
- Connection failures

**Non-Retryable Errors**:
- 4xx client errors
- Invalid data
- Authentication failures

### Dead Letter Queue (DLQ)

**Flow**:
```
api_hits queue
    ↓
Failed after N retries
    ↓
api_hits.dlq
    ↓
Manual review/reprocessing
```

---

## Security Architecture

### Authentication

**JWT Flow**:
```
1. User login: POST /api/auth/login
2. Validate credentials
3. Generate JWT (24h expiry)
4. Set httpOnly cookie
5. Client automatic auth on subsequent requests
```

**API Key Authentication**:
```
1. Client: POST /api/ingest
   Header: X-API-Key: sk_live_xxxx
2. Validate against database
3. Check permissions, expiry, IP whitelist
4. Attach client & apiKey to request
```

### Authorization

**Role-Based Access Control (RBAC)**:
- Super Admin: All permissions, all clients
- Client Admin: Manage own client, users, API keys
- Client Viewer: Read-only analytics

### Data Security

- Passwords: Bcrypt hashing (12 rounds)
- API Keys: Hashed with PBKDF2, partially masked
- Secrets: Environment variables, never in code
- Rate Limiting: 1000 req/15min per IP

### API Key Security

```
Features:
- IP whitelist
- CORS origin whitelist
- Expiry tracking
- Permission scoping
- Environment tagging (prod/staging/dev)
```

---

## Monitoring & Observability

### Structured Logging

```javascript
// Example log format
{
  timestamp: "2026-05-18T10:30:45.123Z",
  level: "info",
  service: "ingest",
  requestId: "req_abc123",
  clientId: "client_123",
  message: "API hit ingested",
  eventId: "evt_xyz789",
  latencyMs: 45,
  metadata: { endpoint: "/api/users", method: "GET" }
}
```

### Key Metrics

**Ingest Service**:
- Requests per second
- Circuit breaker state
- Average latency
- Error rate

**Processor Service**:
- Events processed per second
- Processing latency
- DLQ messages
- MongoDB insert latency
- PostgreSQL upsert latency

**Analytics Service**:
- Query latency
- Cache hit rate
- Database connection pool usage

### Alerts

```
- Circuit breaker OPEN for 5+ minutes
- DLQ backlog > 1000 messages
- Database query latency > 5s
- Error rate > 5%
- Memory usage > 80%
```

---

## Deployment Architecture

### Environments

**Development**:
- Local Docker Compose
- SQLite for testing
- In-memory queue

**Staging**:
- Cloud infrastructure (DigitalOcean/AWS)
- Real databases
- Production configuration

**Production**:
- Load balancers
- Multiple replicas
- Database replication
- CDN for static assets

### Deployment Process

```
1. Feature branch → code review → merge to develop
2. Staging deployment → integration tests
3. Manual QA
4. Tag release → build artifacts
5. Production deployment (blue-green or canary)
6. Health checks
7. Rollback plan if needed
```

---

## Future Scaling

### Phase 1 (Current)
- Single region
- Shared queue
- Basic monitoring

### Phase 2
- Multi-region failover
- Distributed tracing
- Advanced metrics
- Real-time alerts

### Phase 3
- Kubernetes deployment
- Auto-scaling
- ML-based anomaly detection
- Global CDN

---

## Technology Decisions

### Why PostgreSQL for metrics?
- ACID guarantees
- Better for time-series aggregation
- Cost-effective at scale
- SQL for complex queries

### Why MongoDB for raw events?
- Flexible schema
- High write throughput
- Natural TTL support
- Horizontal scaling (sharding)

### Why RabbitMQ?
- Durable queues
- Dead-letter support
- Confirm channels (reliability)
- Language-agnostic
- Proven in production

### Why Redis?
- Sub-millisecond latency
- Perfect for rate limiting
- Session/cache storage
- Atomic operations (critical for concurrency)

---

## Concurrency Handling

### Race Conditions Prevented

**Double Booking/Duplicate Events**:
```sql
-- PostgreSQL: UPSERT with conflict resolution
INSERT INTO endpoint_metrics (...) 
ON CONFLICT (client_id, service_name, endpoint, method, time_bucket)
DO UPDATE SET total_hits = total_hits + EXCLUDED.total_hits
```

**Payment Processing**:
- Idempotency keys
- Database transactions
- Row locks on payment records

**Cache Invalidation**:
- Cache versioning
- Timestamp-based invalidation
- Manual cache busting

---

## API Versioning

**Current**: `/api/v1`

**Pattern**:
```
/api/v1/ingest           (POST)
/api/v1/analytics/stats  (GET)
/api/v1/auth/login       (POST)
/api/v1/payment/create   (POST)
```

---

## Error Handling

**Standardized Response Format**:
```javascript
{
  success: false,
  message: "Invalid API key",
  statusCode: 403,
  errors: [
    { field: "apiKey", message: "Key not found" }
  ],
  requestId: "req_abc123"
}
```

---

## References

- Circuit Breaker Pattern: https://martinfowler.com/bliki/CircuitBreaker.html
- Event Sourcing: https://martinfowler.com/eaaDev/EventSourcing.html
- CQRS: https://martinfowler.com/bliki/CQRS.html
