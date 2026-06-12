import crypto from 'crypto';
import AppError from '../../../shared/utils/AppError.js';
import logger from '../../../shared/config/logger.js';

/**
 * Razorpay pricing plans.
 * Amounts are in the smallest currency unit (paise for INR).
 */
const PLANS = {
    pro: {
        name: 'Pro',
        amount: 99900,       // ₹999/month
        currency: 'INR',
        description: 'Pro Plan - Up to 10K events/sec, advanced analytics',
    },
    enterprise: {
        name: 'Enterprise',
        amount: 299900,      // ₹2999/month
        currency: 'INR',
        description: 'Enterprise Plan - Unlimited events, dedicated support',
    },
};

/**
 * PaymentService - Razorpay integration for subscription management.
 *
 * Razorpay flow:
 *  1. Client calls createOrder → server creates a Razorpay order and returns order details.
 *  2. Client pays via Razorpay SDK on the frontend.
 *  3. Client sends payment details (order_id, payment_id, signature) to verifyPayment.
 *  4. Server verifies the HMAC signature and activates the subscription.
 */
export class PaymentService {
    constructor() {
        this.keyId = process.env.RAZORPAY_KEY_ID;
        this.keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!this.keyId || !this.keySecret) {
            logger.warn('[PaymentService] Razorpay credentials not configured — payment features will fail at runtime');
        }
    }

    /**
     * Creates a Razorpay order for the given plan.
     * @param {string} clientId - The client purchasing the plan
     * @param {'pro'|'enterprise'} plan
     * @returns {Promise<Object>} Razorpay order object
     */
    async createOrder(clientId, plan) {
        const planConfig = PLANS[plan];
        if (!planConfig) throw new AppError(`Invalid plan: ${plan}`, 400);

        this._assertCredentials();

        try {
            // Dynamically import Razorpay (optional peer dependency)
            const { default: Razorpay } = await import('razorpay').catch(() => {
                throw new AppError('Razorpay package not installed. Run: npm install razorpay', 500);
            });

            const razorpay = new Razorpay({
                key_id: this.keyId,
                key_secret: this.keySecret,
            });

            const order = await razorpay.orders.create({
                amount: planConfig.amount,
                currency: planConfig.currency,
                receipt: `receipt_${clientId}_${Date.now()}`,
                notes: {
                    clientId: clientId.toString(),
                    plan,
                    description: planConfig.description,
                },
            });

            logger.info('[PaymentService] Order created', {
                orderId: order.id,
                clientId,
                plan,
                amount: planConfig.amount,
            });

            return {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                plan,
                planName: planConfig.name,
                keyId: this.keyId,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            logger.error('[PaymentService] Failed to create Razorpay order', error);
            throw new AppError('Failed to create payment order', 502);
        }
    }

    /**
     * Verifies a Razorpay payment signature.
     * The signature is an HMAC-SHA256 of `${orderId}|${paymentId}` using the key secret.
     *
     * @param {string} clientId
     * @param {'pro'|'enterprise'} plan
     * @param {Object} paymentData
     * @param {string} paymentData.razorpay_order_id
     * @param {string} paymentData.razorpay_payment_id
     * @param {string} paymentData.razorpay_signature
     * @returns {Promise<Object>} Verification result
     */
    async verifyPayment(clientId, plan, paymentData) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            throw new AppError('Missing payment verification fields', 400);
        }

        this._assertCredentials();

        const expectedSignature = crypto
            .createHmac('sha256', this.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            logger.warn('[PaymentService] Invalid payment signature', { clientId, razorpay_order_id });
            throw new AppError('Invalid payment signature', 400);
        }

        logger.info('[PaymentService] Payment verified', {
            clientId,
            plan,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
        });

        // TODO: Update client subscription in DB when subscription model is added
        // await clientRepository.updateSubscription(clientId, { plan, activatedAt: new Date() });

        return {
            verified: true,
            plan,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            message: `${plan} plan activated successfully`,
        };
    }

    /**
     * @private
     */
    _assertCredentials() {
        if (!this.keyId || !this.keySecret) {
            throw new AppError('Payment service not configured — missing Razorpay credentials', 503);
        }
    }
}
