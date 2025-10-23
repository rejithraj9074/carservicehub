import express from 'express';
import {
  createOrder,
  getOrdersByUser,
  getOrderById
} from '../controllers/accessoryOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// POST /api/accessory-orders - Create new order
router.post('/', createOrder);

// GET /api/accessory-orders/user - Get orders by user
router.get('/user', getOrdersByUser);

// GET /api/accessory-orders/:id - Get single order by ID (for invoice generation)
router.get('/:id', getOrderById);

export default router;