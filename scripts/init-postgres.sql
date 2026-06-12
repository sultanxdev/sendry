-- =============================================================================
-- Sendry - PostgreSQL Database Initialization Script
-- =============================================================================
-- This script runs automatically when the PostgreSQL Docker container starts for
-- the first time. It creates all required tables, indexes, and constraints.
-- =============================================================================

-- Enable timing extension for better query analysis (optional, dev only)
-- \timing

-- =============================================================================
-- endpoint_metrics
-- Stores aggregated API performance metrics per endpoint per hour.
-- Written by the processor service after consuming RabbitMQ events.
-- Read by the analytics service to generate dashboards.
-- =============================================================================

CREATE TABLE IF NOT EXISTS endpoint_metrics (
    id              BIGSERIAL PRIMARY KEY,

    -- Tenant isolation - matches MongoDB Client._id (stored as text)
    client_id       TEXT        NOT NULL,

    -- Endpoint identity
    service_name    TEXT        NOT NULL,
    endpoint        TEXT        NOT NULL,
    method          VARCHAR(10) NOT NULL CHECK (method IN ('GET','POST','PUT','PATCH','DELETE','OPTIONS','HEAD')),

    -- Aggregated counters (incremented on UPSERT)
    total_hits      BIGINT      NOT NULL DEFAULT 0,
    error_hits      BIGINT      NOT NULL DEFAULT 0,

    -- Aggregated latency (in milliseconds)
    avg_latency     DOUBLE PRECISION NOT NULL DEFAULT 0,
    min_latency     DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_latency     DOUBLE PRECISION NOT NULL DEFAULT 0,

    -- Time bucket (hour granularity - rounded to start of hour)
    time_bucket     TIMESTAMPTZ NOT NULL,

    -- Audit timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Uniqueness constraint enables ON CONFLICT upsert in the processor
    CONSTRAINT uq_endpoint_metrics
        UNIQUE (client_id, service_name, endpoint, method, time_bucket)
);

-- ─── Indexes for analytics queries ────────────────────────────────────────────

-- Primary analytics query: stats for a client over a time range
CREATE INDEX IF NOT EXISTS idx_em_client_bucket
    ON endpoint_metrics (client_id, time_bucket DESC);

-- Top endpoints query: group by endpoint, order by hits
CREATE INDEX IF NOT EXISTS idx_em_client_service_endpoint
    ON endpoint_metrics (client_id, service_name, endpoint, method);

-- Time series query: filter by service/endpoint within time range
CREATE INDEX IF NOT EXISTS idx_em_bucket_service
    ON endpoint_metrics (time_bucket DESC, service_name, endpoint);

-- ─── Trigger: keep updated_at current ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_em_updated_at ON endpoint_metrics;

CREATE TRIGGER trg_em_updated_at
    BEFORE UPDATE ON endpoint_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Verify setup
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Sendry database initialized successfully.';
    RAISE NOTICE 'Tables: endpoint_metrics';
END $$;
