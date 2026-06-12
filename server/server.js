/**
 * server.js - Main Express application entry point for Sendry API.
 *
 * Startup sequence:
 *  1. Load environment variables
 *  2. Connect to MongoDB, PostgreSQL, RabbitMQ
 *  3. Register routes + middlewares
 *  4. Start listening
 *  5. Graceful shutdown on SIGTERM/SIGINT
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Shared infrastructure
import config from './shared/config/index.js';
import logger from './shared/config/logger.js';
import mongodb from './shared/config/mongodb.js';
import postgres from './shared/config/postgres.js';
import rabbitmq from './shared/config/rabbitmq.js';

// Middlewares
import errorHandler from './shared/middlewares/errorHandler.js';
import requestLogger from './shared/middlewares/requestLogger.js';

// Routes
import authRoutes from './services/auth/routes/authRoutes.js';
import clientRoutes from './services/client/routes/clientRoutes.js';
import ingestRoutes from './services/ingest/routes/ingestRoutes.js';
import analyticsRoutes from './services/analytics/routes/analyticsRoutes.js';
import paymentRoutes from './services/payment/routes/paymentRoutes.js';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();

// Security headers
app.use(helmet());

// CORS - allow all origins in dev, configure via env in prod
app.use(cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for JWT httpOnly cookies)
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        statusCode: 429,
    },
});
app.use('/api/', globalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'sendry-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: config.node_env,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/ingest', ingestRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/payments', paymentRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        statusCode: 404,
        timestamp: new Date().toISOString(),
    });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be the LAST middleware registered

app.use(errorHandler);

// ─── Startup ──────────────────────────────────────────────────────────────────

async function startServer() {
    try {
        // Connect to databases
        logger.info('Connecting to databases...');

        await mongodb.connect();
        logger.info('✓ MongoDB connected');

        await postgres.testConnection();
        logger.info('✓ PostgreSQL connected');

        // RabbitMQ connection is lazy - established on first publish
        // Connect eagerly to surface config errors at startup
        try {
            await rabbitmq.connect();
            logger.info('✓ RabbitMQ connected');
        } catch (err) {
            logger.warn('RabbitMQ connection failed at startup — ingest will be unavailable', {
                error: err.message,
            });
        }

        // Start listening
        const server = app.listen(config.port, () => {
            logger.info(`🚀 Sendry API running on port ${config.port} [${config.node_env}]`);
            logger.info(`   Health: http://localhost:${config.port}/health`);
            logger.info(`   API:    http://localhost:${config.port}/api/v1`);
        });

        // ─── Graceful Shutdown ────────────────────────────────────────────────

        const shutdown = async (signal) => {
            logger.info(`${signal} received — shutting down gracefully...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await rabbitmq.close();
                    await mongodb.disconnect();
                    await postgres.close();
                    logger.info('All connections closed — exiting');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force exit after timeout
            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10_000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
    process.exit(1);
});

startServer();

export default app;