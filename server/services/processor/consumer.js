/**
 * consumer.js - Standalone RabbitMQ consumer entry point.
 *
 * This file is used as the Docker CMD for the 'consumer' service defined in
 * Dockerfile.consumer. It runs independently from the main Express API server
 * and continuously consumes messages from the RabbitMQ queue.
 *
 * Run via:  npm run consumer
 *          node server/services/processor/consumer.js
 */

import rabbitmq from '../../shared/config/rabbitmq.js';
import mongodb from '../../shared/config/mongodb.js';
import postgres from '../../shared/config/postgres.js';
import processorContainer from './Dependencies/dependencies.js';
import config from '../../shared/config/index.js';
import logger from '../../shared/config/logger.js';

const { processorService } = processorContainer.services;

/**
 * Main entry point for the consumer process.
 * Establishes connections, then starts consuming.
 */
async function startConsumer() {
    logger.info('[Consumer] Starting consumer process...');

    try {
        // Connect to all data stores
        await mongodb.connect();
        logger.info('[Consumer] MongoDB connected');

        await postgres.testConnection();
        logger.info('[Consumer] PostgreSQL connected');

        const channel = await rabbitmq.connect();
        logger.info('[Consumer] RabbitMQ connected');

        // Set prefetch so we process one message at a time per consumer
        // This prevents overloading the processor during bursts
        channel.prefetch(10);

        logger.info(`[Consumer] Listening on queue: ${config.rabbitmq.queue}`);

        // Start consuming
        await channel.consume(
            config.rabbitmq.queue,
            async (msg) => {
                if (!msg) {
                    // Consumer was cancelled (e.g. queue deleted)
                    logger.warn('[Consumer] Received null message - consumer may have been cancelled');
                    return;
                }

                await processorService.processMessage(msg, channel);
            },
            {
                // Manual acknowledgement: processor acks/nacks each message explicitly
                noAck: false,
            }
        );

        logger.info('[Consumer] Ready and waiting for messages...');

    } catch (error) {
        logger.error('[Consumer] Failed to start:', error);
        process.exit(1);
    }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal) {
    logger.info(`[Consumer] ${signal} received — shutting down gracefully...`);

    try {
        await rabbitmq.close();
        await mongodb.disconnect();
        await postgres.close();
        logger.info('[Consumer] Shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error('[Consumer] Error during shutdown:', error);
        process.exit(1);
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger.error('[Consumer] Uncaught exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger.error('[Consumer] Unhandled promise rejection:', reason);
    process.exit(1);
});

// Start
startConsumer();
