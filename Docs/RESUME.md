# 📄 Sendry — Resume Writing Guide

> How to present Sendry on your resume in the **best possible way** using STAR format, strong action verbs, and quantified impact statements. Tailored for SDE, Backend, and Full-Stack roles.

---

## 🧠 The Formula Every Strong Bullet Follows

```
[Strong Action Verb] + [What You Built/Did] + [How (tech/method)] + [Result/Impact (number or outcome)]
```

The biggest mistake developers make: writing **what the project does** instead of **what YOU achieved by building it**.

❌ Weak: *"Built an API monitoring system using Node.js, MongoDB, and RabbitMQ"*
✅ Strong: *"Architected an event-driven API monitoring pipeline achieving ~2ms ingest latency by decoupling HTTP ingestion from processing via RabbitMQ, eliminating synchronous DB write overhead on monitored services"*

---

## ✅ Best Resume Bullet Points (Copy-Paste Ready)

### 🔥 TIER 1 — Top Bullets (Use These First)

> These highlight the most complex, impressive technical decisions. Use them if the role is backend-heavy or system-design focused.

---

**1. Event-Driven Architecture / Decoupling**
```
Designed an async event-driven ingestion pipeline (RabbitMQ + Node.js) that decouples
API hit capture from storage, reducing ingest response time from ~150ms (sync DB write)
to ~2ms, ensuring zero added latency to monitored services.
```

---

**2. Dual-DB Storage Strategy**
```
Implemented a dual-database storage strategy — MongoDB for raw API hit events with
30-day TTL auto-expiry, and PostgreSQL for pre-aggregated hourly time-series metrics
using UPSERT conflict resolution — cutting dashboard query cost by ~99% compared to
scanning raw event collections.
```

---

**3. Circuit Breaker Pattern**
```
Built a production-grade three-state Circuit Breaker (CLOSED → OPEN → HALF_OPEN) from
scratch in Node.js — applied at both the producer (ingest API) and consumer layers —
preventing cascading failures during RabbitMQ or database outages with configurable
failure thresholds and 30-second cooldown periods.
```

---

**4. Retry + DLQ (Reliability)**
```
Engineered a message reliability system with exponential backoff retry (±30% jitter to
prevent thundering herd) and Dead Letter Queue (DLQ) routing for non-retryable errors,
achieving zero message data loss across the event processing pipeline.
```

---

**5. Idempotency**
```
Implemented in-memory idempotency deduplication using a bounded Set (capped at 100K
entries) in the RabbitMQ consumer, preventing duplicate event processing on message
redelivery in at-least-once delivery scenarios — with MongoDB unique index as a
fallback safety net.
```

---

### 🟡 TIER 2 — Supporting Bullets (Add 2–3 of these)

> Use these to round out the project entry with frontend, auth, and tooling work.

---

**6. React Dashboard**
```
Built a real-time analytics dashboard (React 18 + Vite + TanStack Query + ApexCharts)
with lazy-loaded routes, auth-gate, multi-theme support, and auto-refreshing charts
displaying live time-series, error rate distribution, and top-endpoint rankings.
```

---

**7. RBAC & API Key Auth**
```
Designed a dual-authentication system: JWT (HTTP-only cookies) for dashboard users with
role-based access control (Super Admin / Client roles), and scoped API keys with IP
allowlisting, per-environment support, and configurable TTL for ingest endpoints.
```

---

**8. Drop-In SDK Middleware**
```
Developed a zero-config Express monitoring middleware using response interception
(res.end override + setImmediate) that captures endpoint, latency, and status code
data after the response is sent — adding measurably zero overhead to host applications.
```

---

**9. Docker / DevOps**
```
Containerized the full stack (API server, background consumer, PostgreSQL, MongoDB,
RabbitMQ, pgAdmin) using Docker Compose with health checks, dependency ordering, and
graceful shutdown handlers — reducing local dev environment setup to a single command.
```

---

**10. Dependency Injection / Clean Architecture**
```
Applied Dependency Injection throughout the codebase (constructor-injected services,
repositories, and controllers) following SOLID principles — enabling fully isolated
unit testing and deterministic dependency graphs with zero hidden module-level singletons.
```

---

## 📋 How to Structure the Project Entry on Your Resume

```
─────────────────────────────────────────────────────────────────
PROJECTS
─────────────────────────────────────────────────────────────────

Sendry — Real-Time API Monitoring Platform               [Month Year – Month Year]
GitHub: github.com/sultanxdev/sendry                     Node.js · React · RabbitMQ · MongoDB · PostgreSQL

• [Bullet 1 — Architecture / biggest technical decision]
• [Bullet 2 — Storage strategy OR reliability pattern]
• [Bullet 3 — Frontend OR auth OR SDK]
• [Bullet 4 — Optional: DevOps OR clean code]
```

### Example Filled Entry:

```
Sendry — Real-Time API Monitoring SaaS                        Jun 2026
github.com/sultanxdev/sendry          Node.js · React · RabbitMQ · MongoDB · PostgreSQL · Docker

• Architected async event-driven pipeline (RabbitMQ + Node.js consumer) achieving ~2ms
  ingest latency, decoupling HTTP capture from DB writes to avoid adding overhead to
  monitored services.

• Implemented dual-database strategy: MongoDB (raw events, 30-day TTL) + PostgreSQL
  (pre-aggregated hourly UPSERT metrics), reducing analytics query cost by ~99% vs
  scanning raw collections.

• Built three-state Circuit Breaker + exponential backoff retry with DLQ routing,
  ensuring zero message loss and cascading failure prevention across the pipeline.

• Developed React dashboard (TanStack Query · ApexCharts) with RBAC, JWT auth-gate,
  scoped API keys with IP allowlisting, and real-time time-series visualization.
```

---

## 🌟 STAR Format (For Interviews When Asked "Tell Me About a Project")

> STAR = **S**ituation → **T**ask → **A**ction → **R**esult

---

### STAR #1 — "Why did you build this?"

| | |
|--|--|
| **S** | Developers often add monitoring as an afterthought, using synchronous DB writes that add 100–200ms latency to every request in the monitored application. |
| **T** | I wanted to build a monitoring system that adds **zero observable latency** to the host application while still capturing rich observability data. |
| **A** | I used RabbitMQ as an async buffer. The monitoring middleware calls `setImmediate()` after the response is sent, then POSTs to the ingest endpoint, which publishes to the queue and returns 202 in ~2ms. The consumer processes independently. |
| **R** | The monitored app experiences zero synchronous overhead. The system processes events asynchronously with full retry, DLQ, and circuit breaker resilience. |

---

### STAR #2 — "Hardest technical decision you made"

| | |
|--|--|
| **S** | I needed a storage layer that handles both high-volume raw event ingestion AND fast time-series dashboard queries — these two workloads have opposite optimization profiles. |
| **T** | Choose a single database or accept the complexity of multiple. |
| **A** | I used **MongoDB** for raw events (schema flexibility, TTL indexes, high-write throughput) and **PostgreSQL** for pre-aggregated hourly buckets via UPSERT. The consumer dual-writes: MongoDB write is critical (throws on failure), PostgreSQL write is best-effort (logged but not thrown). |
| **R** | Dashboard queries for "last 24 hours" hit ~24 PostgreSQL rows instead of scanning potentially millions of MongoDB documents. The tradeoff is eventual consistency between raw events and aggregated metrics, which is acceptable for a monitoring system. |

---

### STAR #3 — "How did you handle failures?"

| | |
|--|--|
| **S** | In a distributed pipeline with RabbitMQ and two databases, any component can fail independently. |
| **T** | Design the system so that a failure in one component doesn't cascade into a complete outage or data loss. |
| **A** | I implemented three resilience layers: (1) **Circuit Breaker** — opens after 5 failures, rejects requests during OPEN state, probes with 3 half-open attempts after 30s cooldown. (2) **Retry with exponential backoff** — 1s → 2s → 4s with ±30% jitter to prevent thundering herd. (3) **DLQ routing** — messages that exceed max retries or have non-retryable errors (schema validation failures) go to `api_hits.dlq` for later inspection, never discarded. |
| **R** | Zero message loss in the pipeline. When RabbitMQ is unavailable, the circuit breaker returns 503 to clients in < 1ms instead of hanging for 30 seconds. |

---

### STAR #4 — "What would you do differently?"

| | |
|--|--|
| **S** | Building Sendry as a solo project, I made pragmatic choices to ship a working system. |
| **T** | Reflect on the tradeoffs with a production mindset. |
| **A** | I'd replace three things: (1) **TypeScript** — the dual-DB write pattern and event contracts need compile-time type safety. (2) **Redis-backed circuit breaker + idempotency** — current in-memory state doesn't survive restarts and can't be shared across multiple consumer instances for horizontal scaling. (3) **TimescaleDB** (PostgreSQL extension) instead of plain PostgreSQL — gives built-in time-bucket functions and downsampling without a separate aggregation step. |
| **R** | These changes would make Sendry production-ready for horizontal scaling and zero-downtime deploys. |

---

## 🎯 Action Verbs That Hit Hard (Use These)

| Category | Verbs |
|----------|-------|
| **Architecture** | Architected, Designed, Engineered, Devised |
| **Building** | Implemented, Built, Developed, Constructed |
| **Optimization** | Reduced, Eliminated, Optimized, Accelerated |
| **Reliability** | Engineered, Ensured, Prevented, Achieved |
| **Leadership** | Led, Drove, Established, Introduced |

---

## 📊 Numbers to Memorize (Quantify Everything)

| Metric | Value | Context |
|--------|-------|---------|
| Ingest latency | **~2ms** | vs ~150ms with sync DB write |
| Query cost reduction | **~99%** | 24 rows vs millions (pre-aggregation) |
| Circuit breaker threshold | **5 failures** | then OPEN state |
| Cooldown period | **30 seconds** | before HALF-OPEN |
| Retry jitter | **±30%** | prevents thundering herd |
| Idempotency cap | **100,000 entries** | bounded memory |
| TTL auto-expiry | **30 days** | MongoDB raw events |
| Time bucket granularity | **1 hour** | PostgreSQL aggregation |
| Consumer prefetch | **10 messages** | backpressure control |
| Stack components | **6** | Express, React, RabbitMQ, MongoDB, PostgreSQL, Docker |

---

## 📝 LinkedIn Project Description (Copy-Paste)

```
🚀 Sendry — Real-Time API Monitoring Platform

Built a production-grade API monitoring SaaS from scratch using an event-driven 
architecture. Drop one middleware into any Node.js app, and every API hit is 
asynchronously tracked through a RabbitMQ pipeline — with zero added latency to 
your services.

Key technical highlights:
⚡ ~2ms ingest latency via async RabbitMQ publish (vs ~150ms sync DB write)
🗄️ Dual-DB: MongoDB for raw events (30-day TTL) + PostgreSQL for time-series metrics
🛡️ Three-state Circuit Breaker + Retry with exponential backoff + Dead Letter Queue
🔑 RBAC with JWT auth + scoped API keys with IP allowlisting
📊 React dashboard with TanStack Query, ApexCharts, and multi-theme support
🐳 Fully containerized with Docker Compose

Tech: Node.js · Express · React · RabbitMQ · MongoDB · PostgreSQL · JWT · Docker · Vite

GitHub: github.com/sultanxdev/sendry
```

---

## 🏆 Which Bullets to Use Based on the Job

| Job Role | Priority Bullets |
|----------|-----------------|
| **Backend SDE** | #1 (Event pipeline), #2 (Dual-DB), #3 (Circuit Breaker), #4 (DLQ + Retry) |
| **Full-Stack SDE** | #1 (Event pipeline), #2 (Dual-DB), #6 (Dashboard), #7 (RBAC) |
| **DevOps / SRE** | #3 (Circuit Breaker), #4 (DLQ), #9 (Docker), #5 (Idempotency) |
| **Startup (generalist)** | #1, #6, #8 (SDK), #9 (Docker) |
| **FAANG / top-tier** | #1, #2, #3, #4, #5 — all the resilience patterns |
