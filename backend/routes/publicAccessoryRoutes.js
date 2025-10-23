import express from 'express';
import {
  getAllAccessories,
  getAccessoryById
} from '../controllers/accessoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/accessories - Get all accessories with filtering and pagination (public)
router.get('/', getAllAccessories);

// GET /api/accessories/:id - Get single accessory by ID (public)
router.get('/:id', getAccessoryById);

export default router;