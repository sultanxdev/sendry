import amqp from "amqplib";
import { EventEmitter } from "events";
import config from "./index.js";
import logger from "./logger.js";

/**
 * In-memory channel fallback when RabbitMQ broker is unreachable.
 * Mimics amqplib confirm channel interface.
 */
class InMemoryChannel extends EventEmitter {
    constructor() {
        super();
        this.queues = new Map();
        this.consumers = new Map();
        this.prefetchCount = 10;
        this._keepAlive = setInterval(() => {}, 60000);
    }

    async assertQueue(name, options = {}) {
        if (!this.queues.has(name)) this.queues.set(name, []);
        return { queue: name, messageCount: this.queues.get(name).length, consumerCount: 0 };
    }

    publish(exchange, queue, content, options = {}, callback) {
        if (!this.queues.has(queue)) this.queues.set(queue, []);
        const msg = {
            content,
            properties: options,
            fields: { routingKey: queue, deliveryTag: Date.now() }
        };
        this.queues.get(queue).push(msg);

        const consumer = this.consumers.get(queue);
        if (consumer) {
            setImmediate(() => {
                Promise.resolve(consumer(msg)).catch(err => logger.error('[InMemoryQueue] Consumer error:', err));
            });
        }

        if (typeof callback === 'function') {
            setImmediate(() => callback(null));
        }
        return true;
    }

    sendToQueue(queue, content, options = {}) {
        return this.publish('', queue, content, options, () => {});
    }

    prefetch(count) {
        this.prefetchCount = count;
    }

    ack(msg) {}

    nack(msg, allUpTo, requeue) {
        if (requeue && msg?.fields?.routingKey) {
            this.sendToQueue(msg.fields.routingKey, msg.content, msg.properties);
        }
    }

    async consume(queue, callback, options = {}) {
        this.consumers.set(queue, callback);
        const pending = this.queues.get(queue) || [];
        while (pending.length > 0) {
            const msg = pending.shift();
            setImmediate(() => {
                Promise.resolve(callback(msg)).catch(err => logger.error('[InMemoryQueue] Consumer error:', err));
            });
        }
        return { consumerTag: `in-memory-consumer-${Date.now()}` };
    }

    async close() {
        if (this._keepAlive) clearInterval(this._keepAlive);
        this.emit('close');
    }
}

class RabbitMQConnection {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
        this.isFallback = false;
    }

    async connect() {
        if (this.channel) {
            return this.channel;
        }

        if (this.isConnecting) {
            await new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
            return this.channel;
        }

        try {
            this.isConnecting = true;

            const safeUrl = config.rabbitmq.url.replace(/:[^:@]+@/, ':***@');
            logger.info("Connecting to RabbitMQ", { url: safeUrl });

            this.connection = await amqp.connect(config.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            const dlqName = `${config.rabbitmq.queue}.dlq`;

            await this.channel.assertQueue(dlqName, { durable: true });

            await this.channel.assertQueue(config.rabbitmq.queue, {
                durable: true,
                arguments: {
                    "x-dead-letter-exchange": "",
                    "x-dead-letter-routing-key": dlqName
                }
            });

            logger.info("RabbitMQ connected, queue:", config.rabbitmq.queue);

            this.connection.on("close", () => {
                logger.warn('RabbitMQ connection closed');
                this.connection = null;
                this.channel = null;
            });

            this.connection.on("error", (err) => {
                logger.error('RabbitMQ connection error', err);
                this.connection = null;
                this.channel = null;
            });

            this.isConnecting = false;
            return this.channel;
        } catch (error) {
            this.isConnecting = false;
            logger.warn(`RabbitMQ broker connection failed (${error.message}). Activating in-memory event queue fallback for local operations.`);
            
            this.channel = new InMemoryChannel();
            this.isFallback = true;
            this.connection = {
                createConfirmChannel: async () => this.channel,
                createChannel: async () => this.channel,
                on: () => {},
                close: async () => { await this.channel.close(); }
            };
            return this.channel;
        }
    }

    getChannel() {
        return this.channel;
    }

    getStatus() {
        if (this.isFallback) return "fallback_in_memory";
        if (!this.connection || !this.channel) return "disconnected";
        if (this.connection.closing) return "closing";
        return "connected";
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection && typeof this.connection.close === 'function') {
                await this.connection.close();
                this.connection = null;
            }
            logger.info("RabbitMQ connection closed");
        } catch (error) {
            logger.error("Error in closing RabbitMQ connection:", error);
        }
    }
}

export default new RabbitMQConnection();
