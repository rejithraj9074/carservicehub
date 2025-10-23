import express from 'express';
import { 
  getAllCarListings, 
  getCarListingById 
} from '../controllers/publicCarController.js';

const router = express.Router();

// GET /api/cars - Get all verified car listings with filtering and pagination (public)
router.get('/', getAllCarListings);

// GET /api/cars/:id - Get single verified car listing by ID (public)
router.get('/:id', getCarListingById);

export default router;