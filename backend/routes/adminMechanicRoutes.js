import express from 'express';
import {
  createMechanicByAdmin,
  listMechanicsByAdmin,
  getMechanicByAdmin,
  updateMechanicByAdmin,
  deleteMechanicByAdmin,
  getMechanicStats
} from '../controllers/adminMechanicController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin authentication to all routes
router.use(protect);
router.use(admin);

// GET /api/admin/mechanics - Get all mechanics with filtering and pagination
router.get('/', listMechanicsByAdmin);

// GET /api/admin/mechanics/stats - Get mechanic statistics
router.get('/stats', getMechanicStats);

// GET /api/admin/mechanics/:id - Get single mechanic by ID
router.get('/:id', getMechanicByAdmin);

// POST /api/admin/mechanics - Create new mechanic
router.post('/', createMechanicByAdmin);

// PUT /api/admin/mechanics/:id - Update mechanic
router.put('/:id', updateMechanicByAdmin);

// DELETE /api/admin/mechanics/:id - Delete mechanic
router.delete('/:id', deleteMechanicByAdmin);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admin mechanic API is working', 
    timestamp: new Date().toISOString(),
    admin: req.admin ? { id: req.admin._id, email: req.admin.email } : null
  });
});

export default router;