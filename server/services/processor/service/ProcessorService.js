import logger from '../../../shared/config/logger.js';
import AppError from '../../../shared/utils/AppError.js';

/**
 * ProcessorService - consumes API hit events from RabbitMQ and persists them.
 *
 * Flow for each message:
 *  1. Parse the raw RabbitMQ message buffer as JSON.
 *  2. Save the raw event to MongoDB (via ApiHitRepository) for audit / replay.
 *  3. Upsert aggregated metrics to PostgreSQL (via MetricsRepository) for analytics.
 *  4. Acknowledge the message so it is removed from the queue.
 *
 * If an unrecoverable error occurs the message is negatively acknowledged (nack'd)
 * without requeue so it flows to the dead-letter queue for later inspection.
 */
export class ProcessorService {
    /**
     * @param {Object} repositories
     * @param {import('../repository/ApiHitRepository.js').ApiHitRepository} repositories.apiHitRepository
     * @param {import('../repository/MetricsRepository.js').MetricsRepository} repositories.metricsRepository
     */
    constructor({ apiHitRepository, metricsRepository } = {}) {
        if (!apiHitRepository) throw new Error('ProcessorService requires apiHitRepository');
        if (!metricsRepository) throw new Error('ProcessorService requires metricsRepository');

        this.apiHitRepository = apiHitRepository;
        this.metricsRepository = metricsRepository;
    }

    /**
     * Processes a single raw RabbitMQ message.
     * Called by the consumer for every message delivered from the queue.
     *
     * @param {import('amqplib').ConsumeMessage} rawMsg - Raw amqplib message
     * @param {import('amqplib').Channel} channel - The channel to ack/nack on
     * @returns {Promise<void>}
     */
    async processMessage(rawMsg, channel) {
        let parsed = null;

        try {
            parsed = JSON.parse(rawMsg.content.toString());
        } catch (parseError) {
            logger.error('[ProcessorService] Failed to parse message JSON', {
                error: parseError.message,
                raw: rawMsg.content.toString().substring(0, 200),
            });
            // Non-parseable message → send to DLQ immediately
            channel.nack(rawMsg, false, false);
            return;
        }

        const eventData = parsed.data ?? parsed;

        try {
            await this._persistEvent(eventData);
            channel.ack(rawMsg);
            logger.info('[ProcessorService] Message processed successfully', {
                eventId: eventData.eventId,
                endpoint: eventData.endpoint,
            });
        } catch (error) {
            logger.error('[ProcessorService] Failed to process message', {
                eventId: eventData?.eventId,
                error: error.message,
            });
            // Nack without requeue → goes to DLQ
            channel.nack(rawMsg, false, false);
        }
    }

    /**
     * Persists an API hit event to both MongoDB (raw) and PostgreSQL (aggregated).
     * @param {Object} eventData
     * @returns {Promise<void>}
     * @private
     */
    async _persistEvent(eventData) {
        this._validateEventData(eventData);

        const timeBucket = this._roundToHour(eventData.timestamp);
        const isError = eventData.statusCode >= 400;

        // Run MongoDB save and PostgreSQL upsert in parallel for throughput
        await Promise.all([
            this.apiHitRepository.save({
                eventId: eventData.eventId,
                timestamp: new Date(eventData.timestamp),
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
                statusCode: eventData.statusCode,
                latencyMs: eventData.latencyMs,
                clientId: eventData.clientId,
                apiKeyId: eventData.apiKeyId,
                ip: eventData.ip || 'unknown',
                userAgent: eventData.userAgent || '',
            }),

            this.metricsRepository.upsertEndpointMetrics({
                clientId: eventData.clientId,
                serviceName: eventData.serviceName,
                endpoint: eventData.endpoint,
                method: eventData.method,
                totalHits: 1,
                errorHits: isError ? 1 : 0,
                avgLatency: eventData.latencyMs,
                minLatency: eventData.latencyMs,
                maxLatency: eventData.latencyMs,
                timeBucket,
            }),
        ]);
    }

    /**
     * Validates required fields are present in the event data.
     * @param {Object} eventData
     * @private
     */
    _validateEventData(eventData) {
        const required = ['eventId', 'serviceName', 'endpoint', 'method', 'statusCode', 'latencyMs', 'clientId'];
        const missing = required.filter(f => eventData[f] === undefined || eventData[f] === null);
        if (missing.length > 0) {
            throw new AppError(`Missing required event fields: ${missing.join(', ')}`, 400);
        }
    }

    /**
     * Rounds a timestamp to the start of its hour for time-bucket aggregation.
     * @param {string|Date|number} timestamp
     * @returns {Date}
     * @private
     */
    _roundToHour(timestamp) {
        const d = new Date(timestamp);
        d.setMinutes(0, 0, 0);
        return d;
    }
}
