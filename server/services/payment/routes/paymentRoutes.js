import express from 'express';
import paymentDependencies from '../Dependencies/dependencies.js';
import authenticate from '../../../shared/middlewares/authenticate.js';
import requestLogger from '../../../shared/middlewares/requestLogger.js';

const router = express.Router();
const { paymentController } = paymentDependencies.controller;

router.use(authenticate);
router.use(requestLogger);

router.post('/create-order', (req, res, next) => paymentController.createOrder(req, res, next));
router.post('/verify', (req, res, next) => paymentController.verifyPayment(req, res, next));

export default router;
