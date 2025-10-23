import express from 'express';
import {
  createMechanic,
  getMechanics,
  getMechanicById,
  updateMechanic,
  deleteMechanic,
  getMechanicAvailability,
  updateMechanicRating
} from '../controllers/mechanicController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getMechanics);
router.get('/:id', getMechanicById);
router.get('/:id/availability', getMechanicAvailability);

// Protected routes
router.post('/', protect, createMechanic);
router.put('/:id', protect, updateMechanic);
router.delete('/:id', protect, deleteMechanic);
router.post('/:id/rating', protect, updateMechanicRating);

export default router;
