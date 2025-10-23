import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createCarWashBooking,
  listCarWashBookings,
  getCarWashBookingById,
  updateCarWashBookingStatus,
  assignCarWashStaff,
  markCarWashPayment,
  getCarWashStats,
  createCarWashPaymentOrder,
  verifyCarWashPayment
} from '../controllers/carWashController.js';

const router = express.Router();

router.use(protect);

// Customer create & view
router.post('/', createCarWashBooking);
router.get('/', listCarWashBookings);
router.get('/:id', getCarWashBookingById);

// Admin actions
router.put('/:id/status', updateCarWashBookingStatus);
router.put('/:id/assign', assignCarWashStaff);
router.put('/:id/payment', markCarWashPayment);

// Admin stats (protected by admin middleware in controller)
router.get('/stats', getCarWashStats);

// Payment routes
router.post('/payment/order', createCarWashPaymentOrder);
router.post('/payment/verify', verifyCarWashPayment);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Car wash API is working', 
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user._id, role: req.user.role } : null
  });
});

export default router;