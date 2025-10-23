import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
  getOrdersByUser,
  getOrderStats,
  deleteOrder
} from '../controllers/accessoryOrderController.js';
import { orderValidation, orderStatusValidation } from '../middleware/accessoryValidation.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(protect);
router.use(admin);

// GET /api/admin/accessory-orders - Get all orders with filtering and pagination
router.get('/', getAllOrders);

// GET /api/admin/accessory-orders/stats - Get order statistics
router.get('/stats', getOrderStats);

// GET /api/admin/accessory-orders/user/:userId - Get orders by user
router.get('/user/:userId', getOrdersByUser);

// GET /api/admin/accessory-orders/:id - Get single order by ID
router.get('/:id', getOrderById);

// POST /api/admin/accessory-orders - Create new order (for testing/manual creation)
router.post('/', orderValidation, createOrder);

// PUT /api/admin/accessory-orders/:id/status - Update order status
router.put('/:id/status', orderStatusValidation, updateOrderStatus);

// DELETE /api/admin/accessory-orders/:id - Delete order (cancel)
router.delete('/:id', deleteOrder);

export default router;
