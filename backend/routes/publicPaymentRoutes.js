import express from 'express';
import {
  createPaymentOrder,
  verifyPayment
} from '../controllers/paymentController.js';

const router = express.Router();

// Public routes (no authentication required)
// POST /api/payment/order - Create a payment order
router.post('/order', createPaymentOrder);

// POST /api/payment/verify - Verify payment
router.post('/verify', verifyPayment);

export default router;