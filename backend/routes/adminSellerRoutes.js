import express from 'express';
import {
  getAllSellers,
  blockSeller,
  unblockSeller,
  getSellerStats
} from '../controllers/adminSellerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(protect);
router.use(admin);

// GET /api/admin/sellers - Get all sellers with filtering and pagination
router.get('/', getAllSellers);

// GET /api/admin/sellers/stats - Get seller statistics
router.get('/stats', getSellerStats);

// PUT /api/admin/sellers/:id/block - Block seller
router.put('/:id/block', blockSeller);

// PUT /api/admin/sellers/:id/unblock - Unblock seller
router.put('/:id/unblock', unblockSeller);

export default router;