/**
 * RetryStrategy - Exponential backoff with configurable jitter.
 * Used by EventProducer to determine whether and how long to wait between publish retries.
 */
export class RetryStrategy {
    /**
     * @param {Object} opts
     * @param {number} [opts.maxRetries=3]       Max number of retry attempts (0 = no retries)
     * @param {number} [opts.baseDelayMs=1000]   Initial delay between retries in ms
     * @param {number} [opts.maxDelayMs=30000]   Maximum delay cap in ms
     * @param {number} [opts.jitterFactor=0.3]   Random jitter fraction (0 = no jitter, 1 = 100% jitter)
     */
    constructor(opts = {}) {
        this.maxRetries = opts.maxRetries ?? 3;
        this.baseDelayMs = opts.baseDelayMs ?? 1000;
        this.maxDelayMs = opts.maxDelayMs ?? 30_000;
        this.jitterFactor = opts.jitterFactor ?? 0.3;
    }

    /**
     * Whether the producer should attempt another retry after the given attempt number.
     * @param {number} attempt - Zero-based attempt index (0 = first try failed)
     * @returns {boolean}
     */
    shouldRetry(attempt) {
        return attempt < this.maxRetries;
    }

    /**
     * Calculates the delay for a given attempt using exponential backoff + jitter,
     * then sleeps for that duration.
     * @param {number} attempt - Zero-based attempt index
     * @returns {Promise<void>}
     */
    async wait(attempt) {
        const delay = this._calcDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Calculates the backoff delay (with jitter) for a given attempt.
     * Formula: min(baseDelay * 2^attempt, maxDelay) +/- jitter
     * @param {number} attempt
     * @returns {number} delay in ms
     * @private
     */
    _calcDelay(attempt) {
        const exponential = this.baseDelayMs * Math.pow(2, attempt);
        const capped = Math.min(exponential, this.maxDelayMs);
        const jitter = capped * this.jitterFactor * (Math.random() * 2 - 1); // +/- jitter%
        return Math.max(0, Math.floor(capped + jitter));
    }
}

/**
 * Determines whether an error is retryable (transient) vs fatal.
 * Transient errors include network issues and AMQP channel-level problems.
 * Fatal errors (validation failures, auth) should NOT be retried.
 * @param {Error} error
 * @returns {boolean}
 */
export function isRetryable(error) {
    if (!error) return false;

    // Non-retryable shutdown signal
    if (error.code === 'SHUTDOWN_IN_PROGRESS') return false;

    // Network / connection errors — always retryable
    const networkErrors = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EPIPE'];
    if (error.code && networkErrors.includes(error.code)) return true;

    // AMQP-level errors that indicate transient channel failures
    const retryableMessages = [
        'channel closed',
        'connection closed',
        'publish nacked',
        'not connected',
        'socket closed',
    ];

    const msg = (error.message || '').toLowerCase();
    return retryableMessages.some(pattern => msg.includes(pattern));
}
