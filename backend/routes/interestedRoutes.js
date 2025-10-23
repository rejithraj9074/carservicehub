import express from 'express';
import { 
  toggleInterest, 
  getInterestedByCar, 
  getAllInterests,
  getInterestedByUser
} from '../controllers/interestedController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply user authentication to all routes
router.use(protect);

// POST /api/interested - Toggle user interest in a car
router.post('/', toggleInterest);

// GET /api/interested/user - Get all cars interested by the logged-in user
router.get('/user', getInterestedByUser);

// GET /api/interested/:carId - Get all users interested in a specific car (admin)
router.get('/:carId', admin, getInterestedByCar);

// GET /api/interested - Get all interests grouped by car (admin)
router.get('/', admin, getAllInterests);

export default router;