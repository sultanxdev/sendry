import pg from "pg"
import config from "./index.js"
import logger from "./logger.js"

const { Pool } = pg;

class PostgresConnection {
    constructor() {
        this.pool = null;
    }

    getPool() {
        if (!this.pool) {
            const poolConfig = {
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 15000,
            };

            let connectionString = config.postgres.connectionString;

            // Check if connection string is mistakenly placed in PG_HOST (e.g. from copy-pasting command lines)
            if (!connectionString && config.postgres.host && config.postgres.host.includes('postgresql://')) {
                const match = config.postgres.host.match(/postgresql:\/\/[^']+/);
                if (match) {
                    connectionString = match[0];
                } else {
                    connectionString = config.postgres.host;
                }
            }

            if (connectionString) {
                // Strip channel_binding which causes socket resets in pg library with Neon pooler
                connectionString = connectionString.replace(/([?&])channel_binding=[^&]*/g, '$1').replace(/[?&]$/, '');
                poolConfig.connectionString = connectionString;
                // Neon and other cloud providers usually require SSL
                if (connectionString.includes('neon.tech') || connectionString.includes('sslmode=require')) {
                    poolConfig.ssl = { rejectUnauthorized: false };
                }
            } else {
                poolConfig.host = config.postgres.host;
                poolConfig.port = config.postgres.port;
                poolConfig.database = config.postgres.database;
                poolConfig.user = config.postgres.user;
                poolConfig.password = config.postgres.password;
            }

            this.pool = new Pool(poolConfig);

            this.pool.on("error", err => {
                logger.error("Unexpected error on idle PG client", err)
            })

            logger.info("PG Pool Created")
        }
        return this.pool;
    }

    async testConnection() {
        try {
            const pool = this.getPool();
            const client = await pool.connect();
            const result = await client.query("SELECT NOW()");
            client.release();

            logger.info(`PG connected successfully at ${result.rows[0].now}`);
            await this.ensureTables();
        } catch (error) {
            logger.error("Failed to connect to PG", error);
            throw error;
        }
    }

    async ensureTables() {
        const ddl = `
        CREATE TABLE IF NOT EXISTS endpoint_metrics (
            id SERIAL PRIMARY KEY,
            client_id VARCHAR(24) NOT NULL,
            service_name VARCHAR(255) NOT NULL,
            endpoint VARCHAR(500) NOT NULL,
            method VARCHAR(10) NOT NULL,
            time_bucket TIMESTAMP NOT NULL,
            total_hits INTEGER DEFAULT 0,
            error_hits INTEGER DEFAULT 0,
            avg_latency NUMERIC(10,3) DEFAULT 0.000,
            min_latency NUMERIC(10,3) DEFAULT 0.000,
            max_latency NUMERIC(10,3) DEFAULT 0.000,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(client_id, service_name, endpoint, method, time_bucket)
        );

        CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_client_id ON endpoint_metrics(client_id);
        CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_service ON endpoint_metrics(client_id, service_name);
        CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_time ON endpoint_metrics(time_bucket);
        CREATE INDEX IF NOT EXISTS idx_endpoint_metrics_endpoint ON endpoint_metrics(client_id, service_name, endpoint);
        `;
        try {
            await this.query(ddl);
            logger.info('Postgres endpoint_metrics table and indexes verified');
        } catch (err) {
            logger.warn('Could not auto-create endpoint_metrics table:', err.message);
        }
    }

    async query(text, params) {
        const pool = this.getPool()
        const start = Date.now();
        try {
            const result = await pool.query(text, params);
            const duration = Date.now() - start
            logger.debug('Executed query', { text, duration, rows: result.rowCount });
            return result;
        }
        catch (error) {
            logger.error('Query error:', { text, error: error.message });
            throw error;
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            logger.info("PG pool closed!")
        }
    }
}

export default new PostgresConnection()