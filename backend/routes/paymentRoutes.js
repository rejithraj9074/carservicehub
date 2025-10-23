import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentByOrderId,
  getUserPayments
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// POST /api/payments/order - Create a payment order
router.post('/order', createPaymentOrder);

// POST /api/payments/verify - Verify payment
router.post('/verify', verifyPayment);

// GET /api/payments/order/:orderId - Get payment by order ID
router.get('/order/:orderId', getPaymentByOrderId);

// GET /api/payments/user/:userId - Get all payments for a user
router.get('/user/:userId', getUserPayments);

export default router;