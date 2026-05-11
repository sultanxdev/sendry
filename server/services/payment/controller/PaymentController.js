import ResponseFormatter from '../../../shared/utils/responseFormatter.js';
import AppError from '../../../shared/utils/AppError.js';

export class PaymentController {
    constructor(paymentService) {
        if (!paymentService) {
            throw new Error("PaymentService is Required");
        }
        this.paymentService = paymentService;
    }

    /**
     * Creates a Razorpay order
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     */
    async createOrder(req, res, next) {
        try {
            const { plan } = req.body;
            if (!plan || !['pro', 'enterprise'].includes(plan)) {
                throw new AppError("Invalid plan specified", 400);
            }

            // User must be logged in and have a clientId to purchase a plan for their client
            const clientId = req.user.clientId;
            if (!clientId) {
                throw new AppError("No client associated with user", 400);
            }

            const order = await this.paymentService.createOrder(clientId, plan);
            res.status(200).json(ResponseFormatter.success(order, "Order created successfully", 200));
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verifies the Razorpay payment signature
     * @param {Request} req
     * @param {Response} res
     * @param {Function} next
     */
    async verifyPayment(req, res, next) {
        try {
            const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const clientId = req.user.clientId;

            if (!clientId) {
                throw new AppError("No client associated with user", 400);
            }

            const result = await this.paymentService.verifyPayment(clientId, plan, {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            });

            res.status(200).json(ResponseFormatter.success(result, "Payment verified successfully", 200));
        } catch (error) {
            next(error);
        }
    }
}
