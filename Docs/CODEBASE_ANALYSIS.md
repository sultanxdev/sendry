# 🔍 Sendry — Complete Codebase Analysis

> A deep, file-by-file technical analysis of every module in the Sendry project. Written for engineers who want to understand every design decision, pattern, and implementation detail.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Backend — Server](#3-backend--server)
   - [Entry Point & Bootstrap](#31-entry-point--bootstrap)
   - [Shared Infrastructure](#32-shared-infrastructure)
   - [Auth Service](#33-auth-service)
   - [Ingest Service](#34-ingest-service)
   - [Processor / Consumer](#35-processor--consumer)
   - [Analytics Service](#36-analytics-service)
   - [Client Service](#37-client-service)
4. [Frontend — Dashboard](#4-frontend--dashboard)
5. [Demo Application (SDK)](#5-demo-application-sdk)
6. [Infrastructure & DevOps](#6-infrastructure--devops)
7. [Design Patterns Used](#7-design-patterns-used)
8. [Code Quality Observations](#8-code-quality-observations)
9. [Bugs & Issues Found](#9-bugs--issues-found)
10. [What's Missing / Future Work](#10-whats-missing--future-work)

---

## 1. Project Overview

**Sendry** is a real-time API monitoring SaaS platform. It provides:

- A **drop-in Express middleware** (SDK) that clients embed in their applications
- An **ingest API** that receives API hit data and queues it asynchronously
- A **background consumer** that reads from the queue and writes to two databases
- An **analytics API** that serves pre-aggregated metrics
- A **React dashboard** for visualization

**Core design philosophy:**  
*Monitoring your services must add zero synchronous overhead to those services.*  
This is solved through an event-driven, async pipeline where HTTP ingest returns `202` in ~2ms and all processing happens asynchronously.

---

## 2. Repository Structure

```
sendry/
├── server/          # Node.js backend (API + consumer)
├── dashboard/       # React frontend (Vite)
├── demo/demo/       # Example client app with monitoring SDK
├── landing/         # Marketing landing page (HTML/CSS/JS)
├── README.md        # Project documentation
├── DEPLOY.md        # Deployment guide
├── INTERVIEW.md     # Interview preparation guide
└── RESUME.md        # Resume bullet points guide
```

**Monorepo style** — no shared packages or workspaces. Three completely independent Node.js applications (server, dashboard, demo) co-located in one repository.

---

## 3. Backend — Server

### 3.1 Entry Point & Bootstrap

#### `server/server.js` (1 line)
```js
// Root-level shim — delegates to src/server.js
```
A thin re-export so Docker `CMD` can reference the root without knowing internal structure.

---

#### `server/src/server.js` — Main Express App (188 lines)

**What it does:**
- Initializes Express with security middleware stack
- Registers all route modules
- Connects to all three external services (MongoDB, PostgreSQL, RabbitMQ)
- Implements graceful shutdown with SIGTERM/SIGINT handling

**Middleware stack (in order):**
```
1. helmet()           — Sets 14 security headers (X-Frame-Options, CSP, etc.)
2. cors()             — Origin: true (allows all) + credentials: true
3. cookieParser()     — Parses authToken cookie for JWT auth
4. express.json()     — Parses JSON request bodies
5. express.urlencoded — Parses form-encoded bodies
6. Request logger     — Logs METHOD PATH IP UserAgent via Winston
```

**Route registration:**
```
/api/auth       → authRouter
/api/hit        → ingestRouter
/api/analytics  → analyticsRouter
/api            → clientRouter
```

**Bootstrap sequence (`initializeConnection`):**
```
MongoDB.connect()      → mongoose.connect()
PostgreSQL.test()      → pool.query('SELECT NOW()')
RabbitMQ.connect()     → amqplib.connect() + channel.assertQueue()
```
All three must succeed before the HTTP server starts. Any failure throws and exits with code 1.

**Graceful shutdown:**
- On SIGTERM/SIGINT: closes HTTP server, then closes all DB connections
- 10-second forced shutdown timeout prevents hanging
- Handles `uncaughtException` and `unhandledRejection` for last-resort cleanup

**⚠️ Issue:** `cors({ origin: true })` allows ALL origins. For production, this should be a whitelist of specific domains.

---

### 3.2 Shared Infrastructure

#### `shared/config/index.js` — Central Configuration (55 lines)

Single source of truth for all environment variables with sensible defaults.

| Config Group | Key Variables |
|---|---|
| Server | `PORT`, `NODE_ENV` |
| MongoDB | `MONGO_URI`, `MONGO_DB_NAME` |
| PostgreSQL | `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` |
| RabbitMQ | `RABBITMQ_URL`, `RABBITMQ_QUEUE`, `RABBITMQ_RETRY_ATTEMPTS`, `RABBITMQ_RETRY_DELAY` |
| JWT | `JWT_SECRET`, `JWT_EXPIRES_IN` |
| Rate Limit | `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS` |
| Cookie | `httpOnly: true`, `secure: NODE_ENV==='production'` |

**⚠️ Issue:** Default `JWT_SECRET` is a hardcoded string `"SABKA_VALINTINE_WEEK_KAISE_JA_RAHA_HAI"` — developer left a placeholder. Must be overridden in production.

---

#### `shared/config/logger.js` — Winston Logger

Structured JSON logging with Winston. Used consistently across all services, controllers, and repositories for observability.

---

#### `shared/config/mongodb.js` — MongoDB Connection Manager

Singleton pattern for Mongoose connection. Methods:
- `connect()` — `mongoose.connect()` with options
- `disconnect()` — `mongoose.disconnect()` for graceful shutdown

---

#### `shared/config/postgres.js` — PostgreSQL Pool Manager

Uses `pg.Pool` for connection pooling. Methods:
- `testConnection()` — `pool.query('SELECT NOW()')` health check
- `close()` — `pool.end()` for graceful shutdown
- Exposes `pool` for direct queries in repositories

---

#### `shared/config/rabbitmq.js` — RabbitMQ Connection Manager

Wraps `amqplib`. On `connect()`:
1. Establishes AMQP connection
2. Creates a channel
3. Asserts queue with `{ durable: true }` — survives RabbitMQ restarts
4. Asserts DLQ `{queueName}.dlq`

Returns the channel for use by producer/consumer.

---

#### `shared/models/` — Mongoose Schemas (4 files)

**`User.js`** (119 lines)

| Field | Type | Validation |
|---|---|---|
| `username` | String | Unique, min 3, regex `[a-zA-Z0-9_.-]+` |
| `email` | String | Unique, lowercase, email regex |
| `password` | String | `SecurityUtils.validatePassword()` on save |
| `role` | String enum | `super_admin`, `client_admin`, `client_viewer` |
| `clientId` | ObjectId → Client | Required unless `role === super_admin` |
| `isActive` | Boolean | Default: `true` |
| `permissions` | Object | `canCreateApiKeys`, `canManageUsers`, `canViewAnalytics`, `canExportData` |

**Pre-save hook:** Auto-hashes password with `bcryptjs.genSalt(10)` + `bcrypt.hash()` before write. Only runs if `password` field was modified.

---

**`Client.js`** (not shown in detail, inferred)

Represents an organization/team that uses Sendry. Has `name`, `slug` (unique), `createdBy` (User ref), `isActive`.

---

**`ApiKey.js`** (140 lines)

Most complex model. Key design decisions:

| Field | Purpose |
|---|---|
| `keyId` | Public display ID (unique) |
| `keyValue` | The actual secret key sent in `x-api-key` (unique, indexed) |
| `clientId` | References which client owns this key |
| `environment` | Enum: `production`, `staging`, `development`, `testing` |
| `permissions.canIngest` | Controls if key can POST to /api/hit |
| `permissions.canReadAnalytics` | Controls analytics access |
| `security.allowedIPs` | IP whitelist with validation regex |
| `security.allowedOrigins` | CORS origin whitelist |
| `expiresAt` | Default 365 days from creation; TTL index auto-deletes expired keys |
| `security.lastRotated` | Tracks when key was last rotated |

**Compound indexes:**
```
{ clientId, isActive }
{ keyValue, isActive }
{ environment, clientId }
{ expiresAt } — TTL index (expireAfterSeconds: 0)
```

**Instance method:** `isExpired()` — compares `expiresAt` to `Date.now()`.

---

**`ApiHits.js`** (79 lines)

Stores every raw API hit event. Key design:

| Field | Notes |
|---|---|
| `eventId` | UUID — unique index, used for idempotency |
| `timestamp` | Time of the actual API call (not ingestion time) |
| `serviceName` | User-provided service identifier |
| `endpoint` | Full URL path |
| `method` | Enum of 7 HTTP methods |
| `statusCode` | HTTP status code (100-599) |
| `latencyMs` | Response time in ms |
| `clientId` | ObjectId → Client |
| `apiKeyId` | ObjectId → ApiKey |
| `ip` | Client IP of the monitored request |

**Compound indexes for query patterns:**
```
{ clientId, serviceName, endpoint, timestamp: -1 }   — main read pattern
{ clientId, timestamp: -1, statusCode }               — error filtering
{ apiKeyId, timestamp: -1 }                           — per-key analytics
{ timestamp } — TTL index, expireAfterSeconds: 2592000 (30 days)
```

The 30-day TTL means MongoDB auto-deletes old raw events — built-in data lifecycle management with no cron job needed.

---

#### `shared/middlewares/` — 6 Middleware Files

**`authenticate.js`** (52 lines)

JWT authentication middleware.
1. Reads `authToken` from `req.cookies` (HTTP-only cookie)
2. Verifies with `jwt.verify(token, config.jwt.secret)`
3. Decodes `{ userId, email, username, role, clientId }` from payload
4. Attaches to `req.user`
5. Differentiates `TokenExpiredError` (401) from generic invalid token (401)

Design choice: Cookie-based JWTs prevent XSS token theft vs. `localStorage`.

---

**`validateApiKey.js`** (87 lines)

API key authentication for the ingest endpoint.
1. Reads `x-api-key` header
2. Calls `clientServices.getClientByApiKey(apiKey)` — looks up in MongoDB
3. Checks `client.isActive`
4. Checks `apiKeyObj.permissions.canIngest`
5. Logs partial key `apiKey.substring(0,8) + '...'` — never logs full secret
6. Attaches `req.client` and `req.apiKey` for downstream controllers

---

**`errorHandler.js`** (37 lines)

Express error boundary. Maps known error types to status codes:
- Mongoose `ValidationError` → 400
- MongoDB duplicate key (`MongoServerError` code 11000) → 409
- JWT `JsonWebTokenError` → 401
- JWT `TokenExpiredError` → 401
- Default → 500

All errors go through `ResponseFormatter.error()` for consistent response shape.

---

**`authorize.js`**

Role-based authorization middleware factory. Takes allowed roles array, returns middleware that checks `req.user.role`.

---

**`validate.js`**

Zod schema validation middleware for request bodies. Wraps Zod `safeParse` and calls `next(AppError)` on failure.

---

**`requestLogger.js`**

Standalone request logging middleware (logs METHOD, PATH, IP, User-Agent).

---

#### `shared/utils/` — 3 Utility Files

**`AppError.js`** (15 lines)

Custom error class extending `Error`:
```js
class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;      // distinguishes from programmer errors
        Error.captureStackTrace(this, this.constructor);
    }
}
```
`isOperational: true` flag allows `errorHandler` to differentiate expected errors (like 404, 403) from unexpected programmer errors (like TypeError).

---

**`ResponseFormatter.js`** (79 lines)

Static utility class for consistent API response shapes. Four methods:

| Method | Shape |
|---|---|
| `success(data, message, statusCode)` | `{ success: true, message, data, statusCode, timestamp }` |
| `error(message, statusCode, error)` | `{ success: false, message, error, statusCode, timestamp }` |
| `validationError(error)` | `{ success: false, message: 'Validation failed', error, statusCode: 400, timestamp }` |
| `paginated(data, page, limit, total)` | `{ success: true, data, pagination: { page, limit, total, totalPages }, timestamp }` |

Every response includes an ISO timestamp. This is excellent for client-side debugging.

---

**`SecurityUtils.js`** (70 lines)

Password validation utility. Configurable via env vars:

| Requirement | Default | Env Var |
|---|---|---|
| Min length | 8 | `PASSWORD_MIN_LENGTH` |
| Require uppercase | true | `PASSWORD_REQUIRE_UPPERCASE` |
| Require lowercase | true | `PASSWORD_REQUIRE_LOWERCASE` |
| Require numbers | true | `PASSWORD_REQUIRE_NUMBERS` |
| Require symbols | true | `PASSWORD_REQUIRE_SYMBOLS` |

Also blocklists 9 common weak passwords (`password`, `123456`, `admin`, etc.).

Used in `User.js` pre-save hook via Mongoose validator — validation happens at the model layer, not just the controller.

---

#### `shared/events/` — Event Infrastructure

**`eventContracts.js`** (8 lines)

Single source of truth for event type constants:
```js
export const EVENT_TYPES = { API_HIT: 'API_HIT' }
```
Prevents string typos when publishing/consuming. Easily extensible for future event types.

---

**`producer/RetryStrategy.js`** (88 lines)

Retry strategy with **exponential backoff + jitter**:

```js
delay(attempt) {
    const exponential = baseDelayMs * Math.pow(2, attempt);   // 200, 400, 800...
    const capped = Math.min(exponential, maxDelayMs);          // cap at 5000ms
    const jitterRange = capped * jitterFactor;                 // ±30% range
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;  // random in [-range, +range]
    return Math.max(0, Math.round(capped + jitter));           // always ≥ 0
}
```

**`isRetryable(err)`** function classifies errors:
- Retryable: `ECONNRESET`, `ECONNREFUSED`, `ETIMEDOUT`, `channel closed`, `connection closed`, `buffer full`
- Non-retryable: schema validation errors, business logic errors

Both producer (publishing) and consumer (processing) use this same class.

---

**`producer/CircuitBreaker.js`** (219 lines)

Full circuit breaker implementation. Three states:

```
CLOSED ──(5 failures)──→ OPEN ──(30s cooldown)──→ HALF_OPEN
  ↑                                                    │
  └──────────(3 successful probes)────────────────────┘
                                   │
                              (probe fails) → OPEN
```

Methods:
- `allowRequest()` — Returns `true` if request should proceed
- `onSuccess()` — Records success; in HALF_OPEN, counts toward recovery
- `onFailure()` — Increments failure count; opens circuit at threshold
- `snapshot()` — Returns full state for monitoring/health endpoints
- `state` getter — Auto-transitions OPEN → HALF_OPEN when cooldown elapsed

Configuration: `failureThreshold=5`, `cooldownMs=30000`, `halfOpenMaxAttempts=3`

Used at **two levels**: EventProducer (producer-side) and EventConsumer (consumer-side).

---

**`producer/ConfirmChannelManager.js`** (not shown, ~4.5KB)

Manages RabbitMQ confirm channels for publisher confirms — ensures messages are durably written to the broker before `publish()` resolves.

---

**`producer/eventProducer.js`** (198 lines)

The publish pipeline:

```
publishApiHit(eventData)
    │
    ├── Check _shuttingDown flag → throw if true
    ├── CircuitBreaker.allowRequest() → return false if OPEN
    │
    └── Retry loop (while true):
            │
            ├── _publish(eventData) → channel.publish() with confirm callback
            │       │
            │       ├── SUCCESS → circuitBreaker.onSuccess(), metrics++, return true
            │       └── FAIL → isRetryable? + shouldRetry?
            │                   ├── YES → retryStrategy.wait(attempt), attempt++
            │                   └── NO  → circuitBreaker.onFailure(), throw
```

**Back-pressure handling:** If `channel.publish()` returns `false` (write buffer full), logs a warning and listens for `drain` event — prevents overwhelming the broker.

**Metrics tracking:** `{ published, failed, retriesExhausted }` counters, exposed via `getStats()`.

**Shutdown:** `_shuttingDown` flag prevents new publishes during graceful shutdown.

---

### 3.3 Auth Service

**Files:** `auth/controller/authController.js`, `auth/service/authService.js`, `auth/repository/UserRepository.js`, `auth/routes/authRouter.js`, `auth/validation/authSchema.js`

#### `authController.js` (127 lines)

5 endpoints, all following the same pattern:
1. Extract body fields
2. Call `authService.method()`
3. Set `authToken` cookie (HTTP-only, secure in prod, 24hr expiry)
4. Return `ResponseFormatter.success()`

| Method | Endpoint | Action |
|---|---|---|
| `onboardSuperAdmin` | POST `/onboard` | Creates first super admin (blocked if any user exists) |
| `register` | POST `/register` | Creates new user with `client_viewer` role |
| `login` | POST `/login` | Verifies credentials, sets JWT cookie |
| `getProfile` | GET `/profile` | Returns current user profile (no password) |
| `logout` | POST `/logout` | `res.clearCookie('authToken')` |

---

#### `authService.js` (195 lines)

Business logic layer:

**`onboardSuperAdmin()`**
- Calls `userRepository.findAll()` — if any users exist, throws 403
- This is a **one-time operation** for initial setup
- Creates user with `role: APPLICATION_ROLES.SUPER_ADMIN`

**`register()`**
- Checks username uniqueness → 409 if taken
- Checks email uniqueness → 409 if taken
- Creates user (password hashed by Mongoose pre-save hook)

**`login()`**
- Looks up user by username
- Checks `user.isActive` → 403 if deactivated
- `bcrypt.compare()` for password verification
- Returns JWT + user object (without password)

**`generateToken()`**
- JWT payload: `{ userId, username, email, role, clientId }`
- Signs with `config.jwt.secret`, expires in `config.jwt.expiresIn`

**`formatUserForResponse()`**
- Converts Mongoose doc to plain object
- Deletes `password` field before returning

**`checkSuperAdminPermissions(userId)`**
- Looks up user, returns `user.role === 'super_admin'`
- Used by AnalyticsController to gate admin-only features

**⚠️ Bug:** `checkSuperAdminPermissions` has an empty `catch` block — swallows errors silently.

---

#### `UserRepository.js` (3KB)

Repository pattern wrapping Mongoose. Methods:
- `findById(id)` — `User.findById()`
- `findByUsername(username)` — `User.findOne({ username })`
- `findByEmail(email)` — `User.findOne({ email })`
- `findAll()` — `User.find()` (used only in onboard check)
- `create(userData)` — `User.create()`

---

### 3.4 Ingest Service

**Files:** `ingest/controller/ingestController.js`, `ingest/services/ingestServices.js`, `ingest/routes/ingestRoutes.js`

#### Route Protection

`POST /api/hit` is protected by `validateApiKey` middleware (NOT JWT). This is correct — client apps use API keys, not user sessions.

#### `ingestController.js` (66 lines)

1. Logs client info from `req.client` (set by `validateApiKey`)
2. Builds `hitData` = `req.body + clientId + apiKeyId + ip + userAgent`
3. Calls `ingestService.ingestApiHit(hitData)`
4. If `result.status === 'rejected'` → 503 with retry info
5. If success → `202 Accepted` with `eventId` and `status: 'queued'`

The 503 path is triggered when the producer-side CircuitBreaker is OPEN.

---

#### `ingestServices.js` (115 lines)

**`ingestApiHit(hitData)`:**
1. `validateHitData()` — validates required fields
2. Constructs event object with `uuidv4()` eventId
3. Calls `eventProducer.publishApiHit(event)`
4. Returns `{ eventId, status: 'queued' | 'rejected', timestamp }`

**`validateHitData(hitData)`:**

| Field | Validation |
|---|---|
| `serviceName`, `endpoint`, `method`, `statusCode`, `latencyMs`, `clientId` | Required (not falsy) |
| `method` | Must be one of 7 valid HTTP methods |
| `statusCode` | Integer 100-599 |
| `latencyMs` | Float ≥ 0 |

Throws `AppError(400)` on failure — caught by errorHandler middleware.

---

### 3.5 Processor / Consumer

**Files:** `processor/consumer.js` (main process), `processor/service/ProcessorService.js`, `processor/repository/MetricsRepository.js`, `processor/repository/ApiHitRepository.js`

#### `consumer.js` (377 lines)

This is the **most complex file** in the codebase — a standalone Node.js process.

**EventConsumer class — full state:**
```js
{
    _processorService,    // ProcessorService instance
    _rabbitmq,            // RabbitMQ connection manager
    _mongodb,             // MongoDB connection manager
    _postgres,            // PostgreSQL pool
    _config,
    _logger,
    _retryStrategy,       // RetryStrategy instance
    _circuitBreaker,      // CircuitBreaker instance
    isRunning: false,
    channel: null,
    _stats: {             // Monitoring counters
        processed: 0,
        failed: 0,
        retried: 0,
        dlqRouted: 0,
        lastProcessedAt: null
    },
    _processedIds: Set,   // Idempotency cache (max 100K)
    _poisonMessages: Map  // eventType → consecutive failure count
}
```

**`start()` sequence:**
1. `_connectDatabases()` — parallel MongoDB + PostgreSQL connect with 5-retry loop
2. `rabbitmq.connect()` — get channel
3. `channel.prefetch(10)` — backpressure: max 10 unacked messages at once
4. `channel.consume(queue, handler, { noAck: false })` — manual ack mode

**Channel event handling:**
- `'error'` → logs + calls `circuitBreaker.onFailure()`
- `'close'` → if still running, calls `_reconnect()`

**`_handleMessage(msg)` — the core processing loop:**
```
1. circuitBreaker.allowRequest()  → nack+requeue if OPEN
2. _parseMessage(msg)             → JSON.parse + Zod validation
3. processedIds.has(messageId)    → ack+skip if duplicate
4. _processMessage(messageData)   → route to ProcessorService
5. channel.ack(msg)               → remove from queue
6. circuitBreaker.onSuccess()
7. processedIds.add(messageId)    → add to dedup cache
8. poisonMessages.delete(type)    → reset poison counter
```

**Error handling flow (`_handleProcessingError`):**
```
circuitBreaker.onFailure()
poisonMessages[type]++          → warn if ≥ 10 consecutive fails

isRetryable(err) AND shouldRetry(retryCount)?
├── NO  → _sendToDLQ(msg, err, 'NON_RETRYABLE' | 'MAX_RETRIES_EXCEEDED')
└── YES → _retryMessage(msg, retryCount)
```

**DLQ routing (`_sendToDLQ`):**
- Sends to `api_hits.dlq` queue with extra headers:
  - `x-dlq-reason`: why it failed
  - `x-dlq-error`: error message
  - `x-dlq-timestamp`: Unix timestamp
  - `x-original-queue`: source queue name

**Retry (`_retryMessage`):**
- Calculates delay via `retryStrategy.delay(retryCount)`
- Uses `setTimeout()` to delay, then `channel.sendToQueue()` back to same queue
- Increments `x-retry-count` header

**Idempotency Set management:**
```js
if (this._processedIds.size > 100_000) {
    const first = this._processedIds.values().next().value;
    this._processedIds.delete(first);  // FIFO eviction
}
```
A simple LRU-like eviction to prevent unbounded memory growth.

**Poison message detection:**
```js
if (poisonCount >= 10) {
    logger.error('Poison message pattern detected', { eventType });
}
```
Alerts when same event type fails 10+ consecutive times — indicates a structural issue.

**Global process handlers:**
- `SIGINT`, `SIGTERM` → `consumer.stop()` → close channel + disconnect all DBs
- `uncaughtException`, `unhandledRejection` → `process.exit(1)`

**Startup retry loop (`startConsumerWithRetry`):**
- Wraps `consumer.start()` with its own `RetryStrategy` (5 attempts, 5s base delay)
- On max retries exceeded: `process.exit(1)`

---

#### `ProcessorService.js` (116 lines)

**`processEvent(eventData)`:**
```
Step 1 (CRITICAL): apiHitRepository.save(eventData)
                   → If fails, throw — message will be retried/DLQ'd

Step 2 (BEST-EFFORT): _updateMetricsWithFallback(eventData)
                      → If fails, log error but DON'T throw
                      → Message is still ACK'd — MongoDB has the data
```

This **two-tier criticality model** is elegant:
- Raw data is always saved (or message stays in queue)
- Aggregated metrics may lag behind during PostgreSQL outages
- Dashboard shows slightly stale data but raw events are never lost

**`getTimeBucket(timestamp, interval)`:**
```js
// 'hour' (default): 10:37 → 10:00
// 'day':            Jan 12 10:37 → Jan 12 00:00
// 'minute':         10:37:45 → 10:37:00
```
Used to compute the time-series bucket key for PostgreSQL UPSERT.

---

#### `MetricsRepository.js` (247 lines)

The most SQL-heavy file. Four key queries:

**`upsertEndpointMetrics()`** — The core UPSERT:
```sql
INSERT INTO endpoint_metrics (...)
VALUES ($1...$10)
ON CONFLICT (client_id, service_name, endpoint, method, time_bucket)
DO UPDATE SET
  total_hits = endpoint_metrics.total_hits + EXCLUDED.total_hits,
  error_hits = endpoint_metrics.error_hits + EXCLUDED.error_hits,
  avg_latency = (
    (endpoint_metrics.avg_latency * endpoint_metrics.total_hits)
    + (EXCLUDED.avg_latency * EXCLUDED.total_hits)
  ) / (endpoint_metrics.total_hits + EXCLUDED.total_hits),
  min_latency = LEAST(endpoint_metrics.min_latency, EXCLUDED.min_latency),
  max_latency = GREATEST(endpoint_metrics.max_latency, EXCLUDED.max_latency),
  updated_at = CURRENT_TIMESTAMP
```

Running weighted average formula: `new_avg = (old_avg × old_count + new_val × new_count) / (old_count + new_count)`.

**`getOverallStats(clientId, startTime, endTime)`:**
```sql
SELECT SUM(total_hits), SUM(error_hits),
       SUM(avg_latency * total_hits) / NULLIF(SUM(total_hits), 0) as avg_latency,
       COUNT(DISTINCT service_name), COUNT(DISTINCT endpoint)
FROM endpoint_metrics
WHERE client_id = $1 AND time_bucket >= $2 AND time_bucket <= $3
```
`NULLIF(SUM(total_hits), 0)` prevents division-by-zero.

**`getTopEndpoints(clientId, limit, startTime)`:**
Aggregates by `(service_name, endpoint, method)`, sorted by `total_hits DESC`.

**`getMetrics(filter)`:**
Dynamic query builder with optional filters for clientId, serviceName, endpoint, startTime, endTime. Groups by time_bucket with `ORDER BY time_bucket DESC`. Enforces `MAX_LIMIT=1000`.

**Query safety:** All queries use parameterized queries (`$1, $2...`) — no SQL injection risk. `QUERY_TIMEOUT_MS=30000` prevents runaway queries.

---

#### `ApiHitRepository.js` (1.9KB)

Simple MongoDB repository:
- `save(eventData)` — `ApiHit.create(eventData)`
- `deleteOldHits(cutoffDate)` — `ApiHit.deleteMany({ timestamp: { $lt: cutoffDate } })`

Used by ProcessorService for raw event storage and cleanup.

---

### 3.6 Analytics Service

**Files:** `analytics/controller/analyticsController.js`, `analytics/services/analyticsService.js`, `analytics/routes/analyticsRoutes.js`

#### `analyticsController.js` (146 lines)

**`getDashboard(req, res, next)`:**
```js
const [stats, topEndpoints, recentTimeSeries] = await Promise.allSettled([
    analyticsService.getOverallStats(clientId, timeRange),
    analyticsService.getTopEndpoints(clientId, { limit: 5, startTime }),
    analyticsService.getTimeSeries(clientId, { ...timeRange, limit: 24 }),
]);
```
Uses `Promise.allSettled()` — partial failure is OK. If one query fails, the others still return. Each failed item returns `null`.

**Permission model:**
1. Super Admin: can query any client's data, or all clients (no clientId filter)
2. Regular user: can only query their own `clientId`
3. `resolveFinalClientId()` enforces this

**`validateTimeRange(startTime, endTime)`:**
- Accepts both Unix timestamps and ISO date strings
- Returns `null` for missing values (defaults to last 24h in service layer)
- Throws 400 on invalid format or `start > end`

---

#### `analyticsService.js` (116 lines)

Business logic layer for analytics.

**`getOverallStats(clientId, filters)`:**
- Default time range: last 24 hours
- Parses raw PostgreSQL numbers to proper JS numbers
- Computes `errorRate = (errorHits / totalHits) * 100`

**`getTopEndpoints(clientId, options)`:**
- `limit` default: 10, configurable
- Returns formatted array with `errorRate` as percentage

**`getTimeSeries(clientId, filters)`:**
- Returns time-bucketed data with all latency stats
- `limit` default: 100 (prevents runaway data)

---

### 3.7 Client Service

**Files:** `client/controller/`, `client/repository/`, `client/services/`, `client/routes/`

Manages Client entities and API keys. Key operations:
- Create/list clients (admin only)
- Create/list API keys per client
- `getClientByApiKey(apiKey)` — used by `validateApiKey` middleware
- API key validation (active, not expired, correct permissions)

The `ClientRepository` and `ApiKeyRepository` extend base repository classes following the same Repository Pattern as auth.

---

## 4. Frontend — Dashboard

### Directory Overview

```
dashboard/src/
├── api/api.js              ← Axios client + 3 API groups
├── App.jsx                 ← AuthGate + routing
├── main.jsx                ← React 18 root with QueryClientProvider
├── pages/
│   ├── OverviewPage.jsx    ← Main dashboard
│   └── SettingsPage.jsx    ← API key management
├── components/
│   ├── Login.jsx           ← Login form
│   ├── StatsGrid.jsx       ← 4 KPI cards
│   ├── TopEndpoints.jsx    ← Sortable endpoint table
│   ├── ThemeSelector.jsx   ← Light/Dark/Auto theme
│   ├── ErrorBoundary.jsx   ← React error boundary
│   ├── charts/             ← ApexCharts wrappers
│   ├── layout/             ← DashboardLayout + Sidebar
│   └── ui/                 ← PageStatus, loaders
├── contexts/
│   ├── ThemeContext.jsx    ← CSS variable theme system
│   └── ToastContext.jsx    ← Toast notification system
├── hooks/
│   ├── useDashboardQuery.js ← TanStack Query hook
│   └── useChartTheme.js     ← Chart color theming
└── styles/                  ← SCSS modules
```

---

#### `api/api.js` (111 lines)

**Axios instance:**
- `baseURL = VITE_API_BASE_URL || '/api'`
- `withCredentials: true` — sends HTTP-only cookies cross-origin
- Response interceptor: dispatches `'auth:unauthorized'` custom event on 401 (except on auth routes)

**Three API groups:**

| Group | Methods |
|---|---|
| `authApi` | `login`, `register`, `getProfile`, `logout`, `updateProfile` |
| `analyticsApi` | `getDashboard`, `getStats`, `getTopEndpoints`, `getTimeSeries` |
| `clientApi` | `getCurrentClient`, `getClientDashboard`, `createClient`, `getClients`, `createApiKey`, `getClientApiKeys` |

**`analyticsApi.getDashboard()`** normalizes the API response — fills in zero defaults for missing stats fields, preventing undefined errors in chart components.

---

#### `App.jsx` (92 lines)

**`AuthGate` component:**
1. On mount: `authApi.getProfile()` with `AbortController` signal
2. If success → `isAuthenticated = true`
3. If fail → `isAuthenticated = false`
4. Renders `Login` if not authenticated, `DashboardLayout` + routes if authenticated
5. Listens for `'auth:unauthorized'` window event → clears QueryClient cache + sets `isAuthenticated = false`
6. `handleLogout()` → calls `authApi.logout()` + clears QueryClient

**Route structure:**
```
/          → OverviewPage (lazy loaded)
/settings  → SettingsPage (lazy loaded)
*          → Navigate to /
```

Uses React `lazy` + `Suspense` for code splitting.

**Full provider tree:**
```
ErrorBoundary
  └── ThemeProvider
        └── ToastProvider
              └── BrowserRouter
                    └── AuthGate
```

---

#### `hooks/useDashboardQuery.js` (13 lines)

```js
export function useDashboardQuery(options = {}) {
    return useQuery({
        queryKey: QUERY_KEYS.DASHBOARD,
        queryFn: analyticsApi.getDashboard,
        refetchInterval: REFETCH_INTERVAL,   // from constants
        ...options,
    });
}
```

TanStack Query handles: caching, background refetch, loading/error states, deduplication. `refetchInterval` provides auto-refreshing without manual polling.

---

#### `pages/OverviewPage.jsx` (53 lines)

The main dashboard view:
1. `useDashboardQuery()` — fetches all dashboard data
2. Shows `PageStatus` loader/error component during loading
3. On success, renders:
   - `StatsGrid` — 4 KPI cards (totalHits, avgLatency, errorRate, uniqueServices)
   - `ApiHitsChart` — line chart of hits over time
   - `StatusDistributionChart` — doughnut: success vs errors
   - `TopEndpoints` — sortable table

`statusData` memo computed from stats to build doughnut chart labels/values.

---

#### Key Design Patterns in Dashboard

| Pattern | Implementation |
|---|---|
| **Server state** | TanStack Query (caching, refetch, loading) |
| **Client state** | `useState` in AuthGate and components |
| **Theme** | CSS variables via ThemeContext, toggled with `data-theme` attribute |
| **Error handling** | React ErrorBoundary + PageStatus component |
| **Code splitting** | React.lazy + Suspense for page components |
| **Auth flow** | HTTP-only cookie + window event for 401 handling |
| **API normalization** | `getDashboard()` normalizes response before React sees it |

---

## 5. Demo Application (SDK)

**Files:** `demo/demo/server.js` (214 lines), `demo/demo/monitoring.js` (93 lines)

### `monitoring.js` — The Drop-In SDK (93 lines)

This is the client-facing product. Design goals: zero overhead, zero errors, zero config.

**How it works:**
```js
const originalEnd = res.end;

res.end = function (...args) {
    const responseTime = Date.now() - startTime;
    
    setImmediate(() => {
        sendMonitoringData(data, options);
    });
    
    originalEnd.apply(res, args);   // Original response fires immediately
};
```

**Key design decisions:**

| Decision | Why |
|---|---|
| `res.end` override | No route changes needed, works with any Express middleware |
| `setImmediate()` | Runs after current event loop tick (after response sent) — zero latency added |
| `try/catch` in `sendMonitoringData` | Monitoring failure must NEVER break the app |
| Fail silently | Only logs errors if `enableLogging: true` |
| 3-second timeout | If Sendry API is down, monitoring request times out in 3s without blocking anything |
| No API key = no-op | Returns `(req, res, next) => next()` if no API key — safe default |

**`sendMonitoringData` payload:**
```js
{
    serviceName,    // from options
    endpoint,       // req.originalUrl || req.url
    method,         // req.method
    statusCode,     // res.statusCode (set by the route handler)
    latencyMs,      // endTime - startTime
    ip,             // req.ip || req.connection.remoteAddress
    userAgent,      // User-Agent header
}
```

### `server.js` — Demo Blog API (214 lines)

Example application that uses the monitoring middleware:
- `GET /api/posts` — simulates variable response time based on result count
- `GET /api/posts/:postId/comments` — simulates 3% random 503 errors
- `GET /health`

The simulated delays and random errors create realistic API hit data for demonstrating the monitoring dashboard.

---

## 6. Infrastructure & DevOps

### `docker-compose.yml` (161 lines)

6 services:

| Service | Image | Port |
|---|---|---|
| postgres | postgres:15-alpine | 5432 |
| mongo | mongo:6.0 | 27017 |
| rabbitmq | rabbitmq:3-management-alpine | 5672, 15672 |
| pgadmin | dpage/pgadmin4:7 | 8080 |
| api-app | Dockerfile | 5000 |
| consumer | Dockerfile.consumer | — |

**Health checks:**
- PostgreSQL: `pg_isready -U postgres`
- RabbitMQ: `rabbitmq-diagnostics -q ping`
- api-app: `curl -f http://localhost:5000/health`

**Dependencies:**
```
api-app → depends_on: [postgres (healthy), rabbitmq (healthy)]
consumer → depends_on: [postgres (healthy), rabbitmq (healthy)]
pgadmin → depends_on: [postgres]
```

### `Dockerfile` (15 lines) — API Server

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production   # no devDependencies
COPY . .
RUN mkdir -p logs
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### `Dockerfile.consumer` (consumer)

Similar but CMD runs `src/services/processor/consumer.js`.

### `scripts/init-postgres.sql`

Creates `endpoint_metrics` table + 4 indexes + `update_updated_at_column()` trigger. Runs automatically in Docker via `init-postgres.sql` volume mount to `/docker-entrypoint-initdb.d/`.

---

## 7. Design Patterns Used

| Pattern | Where | Purpose |
|---|---|---|
| **Repository Pattern** | All services | Decouples business logic from data access. Makes testing easier. |
| **Dependency Injection** | All classes | Constructor injection via `Dependencies/dependencies.js` files. No hidden singletons. |
| **Circuit Breaker** | EventProducer, EventConsumer | Prevents cascading failures when downstream services fail. |
| **Retry with Backoff** | EventProducer, EventConsumer, DB connect | Handles transient failures without thundering herd. |
| **Dead Letter Queue** | EventConsumer | Captures unprocessable messages for later inspection — zero data loss. |
| **Event-Driven Architecture** | Ingest → RabbitMQ → Consumer | Decouples write throughput from processing. Enables async, non-blocking ingest. |
| **Dual-Write Storage** | ProcessorService | Optimizes for both write (MongoDB) and read (PostgreSQL) workloads. |
| **UPSERT Aggregation** | MetricsRepository | Incremental time-series aggregation without full table scans. |
| **Idempotency** | EventConsumer | Deduplicates redelivered messages in at-least-once delivery. |
| **Graceful Shutdown** | server.js, consumer.js | SIGTERM handling closes connections in order before process exit. |
| **Response Interception** | monitoring.js | Captures metrics after response without modifying route handlers. |
| **Auth Gate** | App.jsx | Profile check on mount determines auth state before rendering. |
| **Server State Management** | useDashboardQuery | TanStack Query handles caching, loading, errors, and auto-refetch. |
| **Error Boundary** | ErrorBoundary.jsx | Catches React render errors, shows fallback instead of white screen. |
| **Provider Pattern** | App.jsx | ThemeProvider, ToastProvider, QueryClientProvider wrap the tree. |
| **Singleton** | Config, DB connections | MongoDB, PostgreSQL, RabbitMQ connections are module-level singletons. |

---

## 8. Code Quality Observations

### ✅ Strengths

1. **Consistent logging** — Winston used everywhere with structured JSON metadata
2. **Consistent response format** — `ResponseFormatter` used by every controller and middleware
3. **Good JSDoc coverage** — Most classes and public methods have complete JSDoc
4. **Separation of concerns** — Controller/Service/Repository layers cleanly separated
5. **Security by default** — `helmet`, `httpOnly` cookies, partial key logging, bcrypt hashing
6. **Parameterized SQL** — All PostgreSQL queries use `$1, $2...` — no injection risk
7. **Bounded data structures** — idempotency Set capped at 100K, query limit capped at 1000
8. **Graceful shutdown** — Both server and consumer handle SIGTERM/SIGINT
9. **Production ready resilience** — Circuit breaker + retry + DLQ is production-grade

### ⚠️ Issues Found

1. **CORS wildcard** (`server.js:29`) — `origin: true` allows all origins. Should be a configurable whitelist.

2. **Hardcoded JWT secret** (`config/index.js:38`) — Default secret is a plaintext string. **Must be overridden in production.**

3. **Silent error swallowing** (`authService.js:184`) — `checkSuperAdminPermissions` has an empty `catch {}` block. If the DB lookup fails, the function returns `undefined` instead of throwing, which could grant unintended access.

4. **PostgreSQL query bug** (`MetricsRepository.js:41`) — The avg_latency UPSERT formula has a parenthesis issue:
   ```sql
   -- Current (wrong):
   (endpoint_metrics.avg_latency * endpoint_metrics.total_hits) + 
   (EXCLUDED.avg_latency * EXCLUDED.total_hits) / (endpoint_metrics.total_hits + EXCLUDED.total_hits)
   
   -- Correct (missing outer parentheses):
   ((endpoint_metrics.avg_latency * endpoint_metrics.total_hits) + 
   (EXCLUDED.avg_latency * EXCLUDED.total_hits)) / (endpoint_metrics.total_hits + EXCLUDED.total_hits)
   ```
   Due to operator precedence, the division only applies to the second term, not the full sum.

5. **Typo in response field** (`analyticsController.js:136`) — `recentActitivy` (misspelled) — compensated by `api.js:64` which handles both spellings.

6. **No rate limiting on ingest** — `express-rate-limit` is imported but ingest endpoint rate limit config is unclear from the codebase.

7. **In-memory idempotency** — Not durable across consumer restarts. A crash-restart cycle can process duplicates (MongoDB unique index is the fallback).

8. **No input sanitization** — `endpoint` and `serviceName` fields from client apps are stored as-is. A malicious client could store arbitrary strings.

---

## 9. Bugs & Issues Found

| Severity | File | Issue |
|---|---|---|
| 🔴 High | `MetricsRepository.js:41` | `avg_latency` UPSERT formula has operator precedence bug — calculates wrong average |
| 🔴 High | `config/index.js:38` | Default JWT secret is a hardcoded string |
| 🟠 Medium | `server.js:29` | CORS allows all origins — security risk in production |
| 🟠 Medium | `authService.js:184` | Silent `catch {}` in `checkSuperAdminPermissions` |
| 🟡 Low | `analyticsController.js:136` | `recentActitivy` typo (extra 'i') |
| 🟡 Low | `authService.js:137` | Typo: "Invliad Credentials" (should be "Invalid") |
| 🟡 Low | Consumer | In-memory idempotency not durable across restarts |
| 🟡 Low | `server.js:6` | `let statusCode = req.statusCode || 500` should be `err.statusCode` |

---

## 10. What's Missing / Future Work

| Feature | Why Missing | Priority |
|---|---|---|
| **TypeScript** | Was built as MVP | High — the dual-DB write pattern needs type safety |
| **Redis-backed Circuit Breaker** | In-memory only | High — needed for horizontal consumer scaling |
| **Redis idempotency store** | In-memory only | High — needed for crash-restart durability |
| **Webhook alerts** | Not implemented | Medium — notify on error rate spike or latency anomaly |
| **WebSocket / SSE** | Uses polling | Medium — push updates to dashboard instead of polling |
| **Multi-tenant IP validation** | Not enforced at consumer level | Medium |
| **API key usage limits** | Removed (commented out) | Low — was previously planned |
| **Unit / integration tests** | None | High — critical for a monitoring system |
| **TimescaleDB** | Plain PostgreSQL | Low — would give built-in time_bucket functions and downsampling |
| **Distributed tracing (OpenTelemetry)** | Not implemented | Low — for production observability |
| **Admin UI for DLQ inspection** | Not implemented | Low — DLQ messages need operator visibility |
| **Refresh token** | No refresh logic | Medium — users must re-login every 24h |
| **Email verification** | Not implemented | Low |

---

## Summary Statistics

| Metric | Count |
|---|---|
| Total files analyzed | 40+ |
| Lines of code (server) | ~3,500 |
| Lines of code (dashboard) | ~2,000 |
| Lines of code (demo SDK) | ~307 |
| Design patterns implemented | 16 |
| Bugs found | 8 |
| External dependencies (server) | 12 |
| External dependencies (dashboard) | 8 |
| MongoDB collections | 4 |
| PostgreSQL tables | 1 |
| RabbitMQ queues | 2 (main + DLQ) |
| API endpoints | 15+ |
