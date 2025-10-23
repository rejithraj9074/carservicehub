import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  rescheduleBooking,
  completeBooking,
  getBookingStats,
  assignMechanic
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Booking CRUD operations
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/stats', getBookingStats);
router.get('/:id', getBookingById);

// Booking status management
router.put('/:id/status', updateBookingStatus);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/reschedule', rescheduleBooking);
router.put('/:id/complete', completeBooking);
router.put('/:id/assign', assignMechanic);

export default router;
