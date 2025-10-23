import express from 'express';
import {
  getAllAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoriesByCategory,
  getLowStockAccessories,
  updateStock,
  getAccessoryStats
} from '../controllers/accessoryController.js';
import { accessoryValidation, stockUpdateValidation } from '../middleware/accessoryValidation.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(protect);
router.use(admin);

// GET /api/admin/accessories - Get all accessories with filtering and pagination
router.get('/', getAllAccessories);

// GET /api/admin/accessories/stats - Get accessory statistics
router.get('/stats', getAccessoryStats);

// GET /api/admin/accessories/low-stock - Get low stock accessories
router.get('/low-stock', getLowStockAccessories);

// GET /api/admin/accessories/category/:category - Get accessories by category
router.get('/category/:category', getAccessoriesByCategory);

// GET /api/admin/accessories/:id - Get single accessory by ID
router.get('/:id', getAccessoryById);

// POST /api/admin/accessories - Create new accessory (multipart form with optional image)
router.post('/', upload.single('image'), accessoryValidation, createAccessory);

// PUT /api/admin/accessories/:id - Update accessory (multipart form with optional image)
router.put('/:id', upload.single('image'), accessoryValidation, updateAccessory);

// PUT /api/admin/accessories/:id/stock - Update accessory stock
router.put('/:id/stock', stockUpdateValidation, updateStock);

// DELETE /api/admin/accessories/:id - Delete accessory (soft delete)
router.delete('/:id', deleteAccessory);

export default router;