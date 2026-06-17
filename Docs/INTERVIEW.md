# 🎯 Sendry — Complete Interview Guide

> A comprehensive guide to confidently explain Sendry in technical interviews, covering architecture, design decisions, tradeoffs, and deep-dive questions.

---

## 🏆 60-Second Elevator Pitch

> *"Sendry is a production-grade, real-time API monitoring SaaS that I built from scratch. The core challenge was: how do you track millions of API hits per day without adding latency to the monitored services? I solved this with an event-driven architecture — a lightweight Express middleware captures each API hit and asynchronously publishes it to RabbitMQ. A separate consumer process reads from the queue, applies idempotency checks, and dual-writes to MongoDB for raw event storage and PostgreSQL for pre-aggregated time-series metrics. The system includes a circuit breaker, exponential backoff retry, and dead-letter queue for resilience. Users interact through a React dashboard with live charts built with ApexCharts and TanStack Query."*

---

## 📐 Architecture Deep Dive

### System Overview

```
Client App → POST /api/hit → API Server → RabbitMQ → Consumer → MongoDB + PostgreSQL
                                                                        ↓
                                                              Analytics API → Dashboard
```

### Component Responsibilities

| Component | Role | Why Separate? |
|-----------|------|--------------|
| **API Server** | Ingest, auth, analytics query | HTTP request handling |
| **Consumer** | Process queue messages | Decouples write throughput from ingest latency |
| **MongoDB** | Raw event store | Document flexibility, TTL indexes |
| **PostgreSQL** | Aggregated metrics | Complex time-series queries, ACID UPSERT |
| **RabbitMQ** | Message queue | Async buffer, backpressure, retry semantics |
| **Dashboard** | Visualization | Separate deployment, independent scaling |

---

## 🔑 Key Technical Decisions (With Tradeoffs)

---

### 1. Why async event pipeline instead of synchronous DB writes?

**Decision:** HTTP ingest endpoint publishes to RabbitMQ and returns 202 immediately. A separate consumer processes messages.

**Why:**
- The monitoring SDK runs inside the user's application. A synchronous DB write of 100ms adds 100ms to every request in their app.
- RabbitMQ publish takes ~1-2ms. The client gets immediate acknowledgment.
- Consumer can process at its own pace, retry independently, and scale horizontally.

**Tradeoff:**
- **Data is not immediately consistent** — there's a lag between hitting an endpoint and seeing it in the dashboard.
- **Complexity** — two processes to deploy and monitor, distributed failure modes.
- **Accepted because:** For a monitoring system, eventual consistency is acceptable. Users check dashboards minutes/hours later, not milliseconds later.

---

### 2. Why dual database (MongoDB + PostgreSQL)?

**Decision:** MongoDB stores raw API hit events. PostgreSQL stores pre-aggregated hourly metrics.

**MongoDB for raw events:**
- Schema flexibility — event data shape can evolve without migrations
- TTL index auto-deletes events after 30 days (built-in data lifecycle)
- Excellent for high-write ingestion workloads
- Compound indexes on `(clientId, serviceName, endpoint, timestamp)` for efficient range queries

**PostgreSQL for aggregated metrics:**
- UPSERT (INSERT ... ON CONFLICT DO UPDATE) is perfect for incrementally updating hourly buckets
- Time-series queries are highly efficient on indexed `time_bucket` columns
- ACID guarantees for metrics accuracy
- `avg_latency` recalculation uses running average formula

**Tradeoff:**
- Two databases = double the operational overhead
- Cross-database consistency is eventual, not transactional
- **Mitigation:** ProcessorService uses a "critical path" pattern — MongoDB write is critical (throws if fails), PostgreSQL write is best-effort (logged but not thrown)

---

### 3. Why Circuit Breaker on both producer and consumer?

**Decision:** `CircuitBreaker` class is instantiated at both the ingest layer (producer) and consumer layer.

**Three states:**
- **CLOSED** — normal operation, all requests pass through
- **OPEN** — failure threshold exceeded, all requests rejected immediately
- **HALF_OPEN** — after cooldown, allows `halfOpenMaxAttempts` test requests

**Producer-side circuit breaker:**
- Protects the ingest endpoint from hanging when RabbitMQ is unavailable
- Returns 503 instead of timing out for 30 seconds
- Config: 5 failures → OPEN, 30s cooldown, 3 half-open probes

**Consumer-side circuit breaker:**
- Protects downstream databases when they become unavailable
- Nacks and requeues messages instead of processing when OPEN
- Prevents thundering herd when DB recovers

**Tradeoff:**
- In-memory state — not shared across multiple consumer instances
- For horizontal scaling, would need Redis-backed circuit breaker
- **Accepted for current scale:** single consumer process

---

### 4. Why Retry with exponential backoff + jitter?

**Decision:** `RetryStrategy` class implements exponential backoff with a configurable jitter factor.

```js
delay(attempt) {
  const base = this.baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(base, this.maxDelayMs);
  const jitter = capped * this.jitterFactor * (Math.random() * 2 - 1);
  return Math.max(0, Math.round(capped + jitter));
}
```

**Why exponential backoff?**
- Linear retry floods a failing service at a constant rate
- Exponential gives the service progressively more time to recover

**Why jitter?**
- Without jitter, all consumers that fail simultaneously will retry at the exact same time (thundering herd)
- ±30% randomization spreads retries across time

**Why Dead Letter Queue (DLQ)?**
- After `maxRetries` exceeded, or for non-retryable errors (schema validation failure, invalid message format), message goes to `api_hits.dlq`
- DLQ messages can be inspected and replayed later without losing data

**Tradeoff:**
- Retry with delay means messages are processed out-of-order
- Max 30-second delay means worst-case a hit takes 30s to appear in dashboard

---

### 5. Why idempotency via in-memory Set?

**Decision:** Consumer tracks processed `messageId`s in a `Set` (capped at 100,000).

**Why needed?**
- RabbitMQ uses "at-least-once" delivery — messages can be delivered multiple times in crash/reconnect scenarios
- Without idempotency, a retried message would create duplicate MongoDB documents and inflate metrics

**How it works:**
- Each event is assigned a UUID `eventId` before publishing
- Consumer checks `this._processedIds.has(messageId)` before processing
- After processing, `messageId` is added to the Set
- Set is bounded — when it exceeds 100K entries, oldest entry is removed (LRU-like)

**Tradeoff:**
- **Not durable** — if consumer crashes and restarts, the Set is empty. A message processed before the crash could be re-processed.
- **Partial mitigation:** MongoDB `eventId` field has a `unique: true` index — duplicate inserts will throw a duplicate key error, which is caught and the message is ACKed (deduplicated at DB level as fallback)
- **Production fix:** Use Redis-backed idempotency store with TTL

---

### 6. Why Dependency Injection everywhere?

**Decision:** Every service, controller, and repository receives its dependencies via constructor injection.

```js
// Example: AnalyticsController
constructor({ analyticsService, authService, clientRepository }) {
  this.analyticsService = analyticsService;
  ...
}
```

**Why:**
- **Testability** — easy to inject mocks in unit tests
- **Deterministic dependency graph** — no hidden module-level singletons
- **Explicit dependencies** — if a dependency is missing, the constructor throws immediately at startup, not at runtime
- **Follows SOLID principles** — Dependency Inversion Principle

**Tradeoff:**
- More boilerplate — `Dependencies/dependencies.js` files in each service module
- No DI framework (like Awilix or tsyringe) means manual wiring
- **Accepted for simplicity:** DI frameworks add learning curve; manual wiring is transparent

---

### 7. Why time-bucketed aggregation in PostgreSQL?

**Decision:** Each event is aggregated into an hourly bucket using:
```sql
UNIQUE(client_id, service_name, endpoint, method, time_bucket)
```

With UPSERT on conflict:
```sql
INSERT INTO endpoint_metrics (...)
ON CONFLICT (client_id, service_name, endpoint, method, time_bucket)
DO UPDATE SET
  total_hits = endpoint_metrics.total_hits + 1,
  avg_latency = (endpoint_metrics.avg_latency * endpoint_metrics.total_hits + EXCLUDED.avg_latency) / (endpoint_metrics.total_hits + 1)
```

**Why pre-aggregate?**
- If you stored every raw hit in PostgreSQL, a dashboard query for "last 24 hours, all endpoints" on 1M hits would be expensive
- Pre-aggregated hourly buckets means the same query hits ~24 rows instead of 1M

**Why not just use MongoDB for analytics?**
- MongoDB's aggregation pipeline works but is less efficient for GROUP BY + time-range queries on large datasets
- PostgreSQL's query planner + indexes are better optimized for tabular time-series data

**Tradeoff:**
- Can't answer "what were the hits at 10:37:42 specifically?" — only hourly granularity
- Can add minute-level buckets as a future optimization at cost of more storage

---

## 💬 Common Interview Questions & Answers

---

### "Walk me through what happens when a client app makes an API call."

1. The client app has `monitoring.js` middleware installed
2. The middleware intercepts `res.end()` — captures latency, status code, endpoint
3. After the response is sent, `setImmediate()` fires the monitoring payload to `POST /api/hit` asynchronously
4. The Sendry server validates the `x-api-key` header — looks up the API key in MongoDB, checks if active, not expired, IP is allowed
5. `IngestController.ingestHit()` calls `IngestService.ingestApiHit(hitData)`
6. `IngestService` validates required fields (serviceName, endpoint, method, statusCode, latencyMs), creates an event with UUID, calls `EventProducer.publishApiHit()`
7. `EventProducer` checks the `CircuitBreaker` state — if OPEN, returns `{ published: false }` → controller returns 503
8. If CLOSED, publishes to RabbitMQ queue `api_hits` with persistent delivery mode
9. Controller returns `202 Accepted` with the `eventId`
10. Meanwhile, the `EventConsumer` (separate process) receives the message
11. Parses and validates schema with Zod, checks idempotency Set
12. Calls `ProcessorService.processEvent()`
13. Saves raw event to MongoDB `api_hits` collection
14. Calculates time bucket (floor to hour), upserts into PostgreSQL `endpoint_metrics`
15. ACKs the message — RabbitMQ removes it from the queue

---

### "How does the system handle RabbitMQ downtime?"

**Producer side (API server):**
- The `CircuitBreaker` opens after 5 consecutive failures
- All new ingest requests get 503 immediately — no hanging connections
- After 30-second cooldown, circuit moves to HALF_OPEN — allows 3 test messages
- If those succeed, circuit closes; if they fail, circuit reopens

**Consumer side:**
- On channel error or close event, `_reconnect()` is called with 5-second delay
- If reconnect fails, exponential backoff up to 10-second retry intervals
- Consumer gracefully handles SIGTERM/SIGINT for zero-downtime deploys

---

### "What happens if MongoDB goes down?"

- `ProcessorService.processEvent()` tries to save to MongoDB first
- If MongoDB write fails, the error is **thrown** (critical path) — message is NOT ACKed
- `EventConsumer._handleProcessingError()` is called
- `RetryStrategy.shouldRetry(retryCount)` checks if retries remain
- If retryable, message goes back to queue with incremented `x-retry-count` header and exponential delay
- After max retries, message goes to `api_hits.dlq` — **data is not lost**

---

### "What happens if PostgreSQL goes down?"

- `ProcessorService._updateMetricsWithFallback()` handles this
- MongoDB write has already succeeded at this point
- PostgreSQL write failure is caught but **not rethrown** — it's treated as non-critical
- Message is **ACKed** — MongoDB has the raw data, can be reprocessed later
- Error is logged with `logger.error()` for operator alerting

---

### "How would you scale this system?"

**Current bottleneck:** Single consumer process

**Horizontal scaling approach:**
1. Run multiple consumer instances — RabbitMQ's competing consumers pattern automatically load-balances
2. Upgrade in-memory idempotency Set to Redis (`SET NX EX`) — shared across instances
3. Upgrade in-memory CircuitBreaker to Redis-backed (using `ioredis`)
4. Use RabbitMQ publisher confirms for guaranteed delivery
5. Shard MongoDB by `clientId` for write scaling
6. Add read replicas to PostgreSQL for analytics query scaling

---

### "Why not use Redis Streams or Kafka instead of RabbitMQ?"

**RabbitMQ advantages for this use case:**
- Built-in DLQ with header forwarding
- Per-message TTL and priority queues
- Management UI out of the box
- Simpler operations than Kafka
- AMQP protocol is well-supported

**When Kafka would be better:**
- Need event log replay (Kafka retains messages by time, not just acknowledgment)
- Need exactly-once semantics with Kafka transactions
- Processing millions of events per second (Kafka has higher throughput)
- Multiple consumers need the same event stream (Kafka consumer groups)

**Tradeoff:** For current scale (thousands of hits/hour), RabbitMQ is simpler and sufficient. Kafka would require Zookeeper/KRaft setup and more operational expertise.

---

### "Explain the monitoring middleware design."

The monitoring middleware uses the **response interception pattern**:

```js
const originalEnd = res.end;
res.end = function (...args) {
  const responseTime = Date.now() - startTime;
  setImmediate(() => sendMonitoringData(...));  // non-blocking
  originalEnd.apply(res, args);                  // original response
};
```

**Key design decisions:**
1. **`setImmediate()`** — fires after the current event loop tick, after the response is sent. This means the monitoring send does NOT add to the response time of the client's API call.
2. **Fail silently** — `try/catch` in `sendMonitoringData` with only logging, never throwing. Monitoring failure must never break the monitored app.
3. **3-second timeout** — if the Sendry API is down, the monitoring request times out in 3s. `setImmediate` means this runs after the response, so it doesn't affect the client.
4. **No API key = no-op** — middleware returns a pass-through if no API key configured.

---

### "How do you handle authentication and authorization?"

**Authentication:**
- JWT tokens stored in HTTP-only cookies (not localStorage — prevents XSS token theft)
- `authenticate.js` middleware verifies JWT on every protected route
- Tokens expire in 24 hours; no refresh token (tradeoff: simpler, but users must re-login)

**Authorization — Two separate systems:**

1. **User JWT auth** for dashboard:
   - Roles: `SUPER_ADMIN` and `CLIENT`
   - Super admin can query analytics for any client or all clients
   - Client user can only view their own client's analytics
   - `AnalyticsController.resolveFinalClientId()` enforces this

2. **API key auth** for ingest endpoint:
   - `validateApiKey.js` middleware extracts `x-api-key` header
   - Looks up key in MongoDB — checks `isActive`, `expiresAt`, `permissions.canIngest`
   - IP whitelist check: if `security.allowedIPs` is set, validates `req.ip`
   - Attaches `req.client` and `req.apiKey` objects for downstream use

---

### "What would you do differently in v2?"

1. **TypeScript** — the current JS codebase lacks compile-time type safety. TS would catch type errors in the dual-DB write pattern and event contracts.

2. **Redis for distributed state** — replace in-memory circuit breaker and idempotency set with Redis for horizontal scaling.

3. **Kafka instead of RabbitMQ** — for higher throughput and event replay capability.

4. **Time-series database** — InfluxDB or TimescaleDB (PostgreSQL extension) would give better query performance for time-bucketed analytics with built-in downsampling.

5. **Webhook alerts** — notify users when error rate exceeds threshold or latency spikes.

6. **gRPC or WebSocket for real-time push** — instead of TanStack Query polling, push updates to dashboard when new events arrive.

7. **Proper distributed tracing** — integrate with OpenTelemetry for trace correlation.

---

## 📝 Resume Bullet Points

Use these in your resume (customize numbers based on actual load tested):

```
• Architected Sendry, a real-time API monitoring SaaS with an event-driven pipeline 
  (RabbitMQ + Node.js consumer) that decouples ingestion from processing, achieving 
  sub-2ms ingest response times with async event delivery.

• Designed a dual-database storage layer: MongoDB for raw API hit events with 30-day TTL 
  auto-expiry, and PostgreSQL for pre-aggregated hourly time-series metrics using UPSERT 
  conflict resolution, reducing dashboard query cost by ~99% vs. raw event scanning.

• Implemented a production-grade resilience stack including a three-state Circuit Breaker 
  (CLOSED/OPEN/HALF_OPEN), exponential backoff retry with ±30% jitter, in-memory 
  idempotency deduplication, and Dead Letter Queue (DLQ) routing for unprocessable messages.

• Built a React dashboard (Vite + TanStack Query + ApexCharts) with lazy-loaded routes, 
  JWT auth-gate, multi-theme support, and real-time analytics charts with 24-hour 
  time-series visualization and top-endpoint ranking.

• Developed a drop-in Express monitoring middleware using response interception 
  (`res.end` override) that captures latency, status codes, and endpoint metadata 
  without adding measurable overhead to the host application via setImmediate().

• Designed a Role-Based Access Control (RBAC) system with Super Admin and Client roles, 
  scoped API keys with IP allowlisting, per-environment key support, and permission-level 
  analytics access control.
```

---

## 🎖️ Key Concepts to Know Cold

| Concept | One-Line Explanation |
|---------|---------------------|
| **Circuit Breaker** | Stops cascading failures by rejecting requests when failure threshold exceeded |
| **Exponential Backoff** | Doubles retry delay after each failure: 1s → 2s → 4s → 8s |
| **Jitter** | Randomizes retry timing to prevent synchronized thundering herd |
| **Dead Letter Queue** | Queue where unprocessable messages are routed after max retries |
| **Idempotency** | Processing the same message multiple times produces the same result |
| **Time Bucket** | Rounding a timestamp to the nearest hour for metric aggregation |
| **UPSERT** | INSERT ... ON CONFLICT UPDATE — insert if new, update if exists |
| **Publisher Confirms** | RabbitMQ ACK that guarantees message was written to disk |
| **Dependency Injection** | Dependencies passed in via constructor, not imported as singletons |
| **TTL Index** | MongoDB index that auto-deletes documents after a time period |
| **At-Least-Once Delivery** | Message broker guarantee — may deliver duplicates, never loses |
| **Response Interception** | Overriding `res.end` to hook into response without modifying route handlers |
