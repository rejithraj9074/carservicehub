import express from 'express';
import {
  getAllCarListings,
  getCarListingById,
  createCarListing,
  updateCarListingStatus,
  deleteCarListing,
  getCarListingStats
} from '../controllers/adminCarController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(protect);
router.use(admin);

// GET /api/admin/cars - Get all car listings with filtering and pagination
router.get('/', getAllCarListings);

// GET /api/admin/cars/stats - Get car listing statistics
router.get('/stats', getCarListingStats);

// GET /api/admin/cars/:id - Get single car listing by ID
router.get('/:id', getCarListingById);

// POST /api/admin/cars - Create new car listing (multipart form with optional images)
router.post('/', upload.array('images', 10), createCarListing);

// PUT /api/admin/cars/:id/verify - Update car listing verification status
router.put('/:id/verify', updateCarListingStatus);

// DELETE /api/admin/cars/:id - Delete car listing
router.delete('/:id', deleteCarListing);

export default router;