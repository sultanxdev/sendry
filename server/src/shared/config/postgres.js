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
                connectionTimeoutMillis: 5000,
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
            const result = await client.query("SELECT NOW()")
            client.release();

            logger.info(`PG connected successfully at ${result.rows[0].now}`)
        } catch (error) {
            logger.error("Failed to connect to PG", error)
            throw error
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