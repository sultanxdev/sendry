# 📈 Scaling Plan & Growth Strategy

## Phase 1: MVP (Current)

**Target**: 1,000 API hits/second, 100 clients

### Infrastructure

```
1 × Ingest Service (Node.js)
1 × Auth Service (Node.js)
1 × Analytics Service (Node.js)
1 × Processor Service (Node.js)

1 × MongoDB (single instance)
1 × PostgreSQL (single instance)
1 × RabbitMQ (single instance)
1 × Redis (single instance)

Load Balancer (nginx)
```

### Metrics

- **Throughput**: 1,000 events/sec = 86.4M events/day
- **Storage**: ~1.7GB/day (20KB per raw event)
- **Memory**: ~16GB total
- **CPU**: 4 cores

### Capacity Planning

```
Current: 86M events/month
At 30-day retention:
- MongoDB: 30 × 1.7GB = 51GB
- PostgreSQL: ~500MB (aggregated)
```

---

## Phase 2: Growth (10K events/sec)

**Target**: 10,000 events/sec, 1,000 clients

### Changes

#### Ingest Service

```
Before: 1 instance
After: 3 instances behind load balancer

Load Balancer
    ├─ Ingest-1
    ├─ Ingest-2
    └─ Ingest-3

Rate limiter: Redis (shared)
```

#### Processor Service

```
Before: 1 consumer
After: 5 consumers (RabbitMQ consumer group)

Benefits:
- Parallel processing
- Auto-balancing
- Consumer lag monitoring
```

#### Database Optimization

**MongoDB**:
```
Sharding Strategy:
Shard Key: { clientId: 1, timestamp: 1 }

Shard 1: Clients A-F
Shard 2: Clients G-M
Shard 3: Clients N-Z
```

**PostgreSQL**:
```
Query Optimization:
- Add read replicas (1 primary + 2 replicas)
- Connection pooling (pgBouncer)
- Query caching layer (Redis)
- Table partitioning by date
```

#### Caching Strategy

```
Redis Strategy:
- Session cache: 5 min TTL
- Query cache: 30 min TTL
- Rate limiter: 15 min window
- Leaderboard: 1 hour TTL

Memory: ~32GB
```

### Infrastructure (Phase 2)

```
3 × Ingest Service
2 × Analytics Service
5 × Processor Service
2 × Auth Service

MongoDB (3-node replica set)
PostgreSQL (1 primary + 2 replicas)
RabbitMQ (3-node cluster)
Redis (single with replication)

Load Balancer + CDN
```

### Costs Estimation

| Component | Phase 1 | Phase 2 |
|-----------|---------|---------|
| Compute | $300/mo | $1,200/mo |
| Database | $200/mo | $800/mo |
| Storage | $50/mo | $200/mo |
| Network | $100/mo | $400/mo |
| **Total** | **$650** | **$2,600** |

---

## Phase 3: Scale (100K events/sec)

**Target**: 100,000 events/sec, 10,000 clients

### Distributed Architecture

#### Multi-Region Deployment

```
US-East (Primary)
  ├─ 10 × Ingest Service
  ├─ 5 × Analytics Service
  ├─ 20 × Processor Service
  └─ MongoDB + PostgreSQL (primary)

Europe (Standby)
  ├─ 5 × Ingest Service
  ├─ 3 × Analytics Service
  ├─ 10 × Processor Service
  └─ MongoDB + PostgreSQL (replica)

Asia (Standby)
  ├─ 5 × Ingest Service
  ├─ 3 × Analytics Service
  ├─ 10 × Processor Service
  └─ MongoDB + PostgreSQL (replica)
```

#### Message Queue Scaling

```
Before: 1 RabbitMQ broker
After: 3-node RabbitMQ cluster

Topics:
- api_hits (main traffic)
- api_hits.dlq (dead letters)
- notifications
- emails
- billing
```

#### Database Sharding

**MongoDB**:
```
Sharding across 3 datacenters:
- DC1 (US-East): Shards 1-3
- DC2 (EU): Shards 4-6
- DC3 (Asia): Shards 7-9

Auto-balancer handles data distribution
```

**PostgreSQL**:
```
Replication:
Primary (US-East) → Replica (EU) → Replica (Asia)

Failover: Automated via patroni
```

#### Advanced Caching

```
Redis Cluster:
- 6 nodes × 64GB = 384GB
- Auto-sharding
- High availability
- 99.99% uptime SLA
```

### Architecture Diagram (Phase 3)

```
┌─────────────────────────────────────────┐
│         Global CDN (Cloudflare)         │
└───────────────┬───────────────────────┬─┘
                │                       │
        ┌───────▼───────┐      ┌────────▼──────┐
        │    US-East    │      │    Europe     │
        │   (Primary)   │      │  (Replica)    │
        │               │      │               │
        │ ┌──────────┐  │      │ ┌──────────┐  │
        │ │Load Bal  │  │      │ │Load Bal  │  │
        │ └────┬─────┘  │      │ └────┬─────┘  │
        │      │        │      │      │        │
        │ ┌────▼────────┐│     │ ┌────▼────┐   │
        │ │ 10×Ingest   ││     │ │ 5×Ingest│   │
        │ │ 5×Analytics ││     │ │ 3×Anal  │   │
        │ │ 20×Processor││     │ │ 10×Proc │   │
        │ └─────┬────────┘│     │ └────┬────┘   │
        │       │         │     │      │        │
        │  ┌────▼────┐    │     │  ┌───▼────┐   │
        │  │RabbitMQ │    │     │  │RabbitMQ│   │
        │  │ Cluster │    │     │  │ Cluster│   │
        │  └────┬────┘    │     │  └───┬────┘   │
        │       │         │     │      │        │
        │  ┌────▼────┐    │     │  ┌───▼─────┐  │
        │  │MongoDB  │    │     │  │MongoDB  │  │
        │  │ Shard   │    │     │  │ Shard   │  │
        │  └────┬────┘    │     │  └───┬─────┘  │
        │       │         │     │      │        │
        │  ┌────▼────┐    │     │  ┌───▼─────┐  │
        │  │PostgreSQL   │  │     │  │PostgreSQL  │
        │  │ Primary │    │     │  │ Replica │  │
        │  └─────────┘    │     │  └────────┘   │
        └────────────────┘     └───────────────┘
                │
                │ Replication
                │
        ┌───────▼──────┐
        │    Asia      │
        │  (Replica)   │
        │              │
        │ ┌──────────┐ │
        │ │Load Bal  │ │
        │ └────┬─────┘ │
        │      │       │
        │ ┌────▼───┐   │
        │ │5×Ingest│   │
        │ │ 3×Anal │   │
        │ │10×Proc │   │
        │ └────┬───┘   │
        │      │       │
        │ ┌────▼───┐   │
        │ │RabbitMQ│   │
        │ │Cluster │   │
        │ └────┬───┘   │
        │      │       │
        │ ┌────▼───┐   │
        │ │MongoDB │   │
        │ │Shard   │   │
        │ └────┬───┘   │
        │      │       │
        │ ┌────▼───┐   │
        │ │PgSQL   │   │
        │ │Replica │   │
        │ └────────┘   │
        └──────────────┘
```

### Monitoring & Auto-Scaling

```yaml
Metrics Tracked:
- Ingest Service:
  - CPU > 80% → Scale up 2 more instances
  - Latency > 100ms → Scale up
  - RabbitMQ lag > 10K → Scale up consumers

- Database:
  - Query latency > 5s → Add read replica
  - Connection pool > 80% → Increase pool size
  - Replication lag > 1s → Alert

- Cache:
  - Hit rate < 70% → Increase TTL or size
  - Memory > 90% → Evict old entries
```

---

## Optimization Strategies

### Query Optimization

**Problem**: Slow analytics queries at scale

**Solution**:
```sql
-- Materialized view for common queries
CREATE MATERIALIZED VIEW daily_stats AS
SELECT 
  client_id,
  DATE(time_bucket) as day,
  SUM(total_hits) as hits,
  SUM(error_hits) as errors,
  AVG(avg_latency) as avg_latency
FROM endpoint_metrics
GROUP BY client_id, DATE(time_bucket);

-- Refresh hourly
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;
```

### Connection Pooling

**PgBouncer Configuration**:
```ini
[databases]
sendry = host=pg-primary port=5432 dbname=sendry

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

### Batch Processing

**Before**: Process events one-by-one
```javascript
for (let event of events) {
  await mongodb.insertOne(event);  // 1000 round-trips
}
```

**After**: Batch insertion
```javascript
await mongodb.insertMany(events);  // 1 round-trip
```

**Improvement**: 100x faster

### Event Aggregation

**Before**: Store every event
```
86M events/day = 1.7GB MongoDB storage
```

**After**: Pre-aggregate in processor
```javascript
// Group events by 1-minute buckets
const aggregated = events.reduce((acc, event) => {
  const key = `${event.endpoint}_${minute}`;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});
```

**Improvement**: 99% storage reduction

---

## Bottleneck Identification

### At 10K events/sec

**Bottleneck**: RabbitMQ publish latency

**Symptoms**:
- Ingest API latency increases
- Circuit breaker opens frequently
- Queue backlog grows

**Solution**:
- Add more RabbitMQ nodes
- Enable publisher confirms (async)
- Increase buffer size

### At 100K events/sec

**Bottleneck**: MongoDB write throughput

**Symptoms**:
- Write latency > 100ms
- Storage growing too fast

**Solution**:
- Implement MongoDB sharding
- Archive old data
- Increase batch size

### At 1M events/sec

**Bottleneck**: Network bandwidth

**Symptoms**:
- Network saturation
- Replication lag increases
- Data transfer costs spike

**Solution**:
- Regional data centers
- Local caching
- Data compression

---

## Cost Optimization

### Storage Optimization

**Before**:
```
30-day retention of all raw events
= 2.5GB/day × 30 = 75GB
Cost: $150/month (S3)
```

**After**:
```
7-day retention in MongoDB (hot)
30-day retention in S3 (cold)
Cost: $50/month MongoDB + $20/month S3 = $70/month
Savings: 53%
```

### Compute Optimization

**Reserved Instances**:
```
On-demand: $0.10 per hour
Reserved (1-year): $0.06 per hour
Savings: 40%

For 100 instances:
$0.10 × 100 × 24 × 365 = $876K/year
$0.06 × 100 × 24 × 365 = $525K/year
Savings: $351K/year
```

### Data Transfer Optimization

**Compression**:
```
Raw data: 20KB per event
Compressed: 2KB per event (90% reduction)

86M events/day = 1.7GB raw
Compressed: 170MB
Savings: 90%
```

---

## High Availability

### Failover Strategy

**Primary Failure**: 
```
1. Health check detects primary down (10s)
2. Failover to replica initiated
3. Replica promoted to primary (5s)
4. Service restored (15s total)
RTO: 15 seconds
```

**Region Failure**:
```
1. Global LB detects region down (30s)
2. Traffic rerouted to standby region
3. Database replication resynchronizes
4. Service restored (2-3 minutes)
RTO: 3 minutes
```

### Disaster Recovery

**Backup Strategy**:
```
Daily: Full backup to S3
Hourly: Incremental backup
Point-in-time: Last 7 days

Recovery:
- Full restore: 1 hour
- Incremental: 15 minutes
```

---

## Monitoring at Scale

### Key Metrics

```
RED Method (Rate, Errors, Duration):
- Rate: Events/sec
- Errors: Failed events
- Duration: Latency percentiles (p50, p95, p99)

USE Method (Utilization, Saturation, Errors):
- Utilization: CPU%, Memory%, Disk%
- Saturation: Queue length, Connection pool
- Errors: Timeouts, 5xx errors
```

### Alerting Rules

```yaml
Alert: High Ingest Latency
  condition: latency_p95 > 500ms
  duration: 5 minutes
  severity: warning

Alert: Queue Backlog
  condition: queue_depth > 100K
  duration: 2 minutes
  severity: critical

Alert: Database Replication Lag
  condition: replication_lag > 5s
  duration: 1 minute
  severity: critical
```

---

## Future Optimizations

### Real-Time Processing (Phase 4)

```
Replace batch processing with stream processing:
Kafka → Apache Flink → Real-time dashboards

Benefits:
- Sub-second latency
- Windowed aggregations
- Stream joins
```

### Machine Learning (Phase 5)

```
Anomaly Detection:
- Detect unusual patterns
- Predict failures
- Auto-scaling recommendations

Implementation:
- TensorFlow models
- Batch training daily
- Real-time inference
```

### Global Edge Processing (Phase 6)

```
Cloudflare Workers + Durable Objects:
- Ingest at edge
- Pre-aggregate near client
- Reduce latency to <10ms
```

---

## References

- RabbitMQ Scaling: https://www.rabbitmq.com/clustering.html
- MongoDB Sharding: https://docs.mongodb.com/manual/sharding/
- PostgreSQL Replication: https://www.postgresql.org/docs/current/warm-standby.html
- High Availability Patterns: https://12factor.net/
