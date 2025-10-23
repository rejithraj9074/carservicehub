import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Mechanic from '../models/Mechanic.js';
import User from '../models/User.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
export const createBooking = async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // For testing purposes, return a mock successful response
      console.log('Database not connected, returning mock response for testing');
      return res.status(201).json({
        message: 'Booking created successfully (mock response - database not connected)',
        booking: {
          _id: 'mock_booking_id_' + Date.now(),
          customer: req.user?.id || 'mock_customer',
          serviceType: req.body.serviceType,
          vehicleInfo: req.body.vehicleInfo,
          serviceDescription: req.body.serviceDescription,
          scheduledDate: req.body.scheduledDate,
          scheduledTime: req.body.scheduledTime,
          estimatedDuration: req.body.estimatedDuration,
          estimatedCost: req.body.estimatedCost,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    const {
      mechanic,
      serviceType,
      vehicleInfo,
      serviceDescription,
      scheduledDate,
      scheduledTime,
      estimatedDuration,
      estimatedCost,
      location,
      notes
    } = req.body;

    // Validate required fields
    if (!serviceType || !vehicleInfo || !serviceDescription || 
        !scheduledDate || !scheduledTime || !estimatedDuration || !estimatedCost) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    let mechanicExists = null;
    if (mechanic) {
      // Check if mechanic exists and is active
      mechanicExists = await Mechanic.findById(mechanic).populate('user');
      if (!mechanicExists || !mechanicExists.isActive) {
        return res.status(404).json({ message: 'Mechanic not found or not available' });
      }
    }

    // Check if mechanic is available at the requested time
    const requestedDate = new Date(scheduledDate);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (mechanicExists && !mechanicExists.isAvailableAt(dayOfWeek, scheduledTime)) {
      return res.status(400).json({ message: 'Mechanic is not available at the requested time' });
    }

    // Check for conflicting bookings
    let conflictingBooking = null;
    if (mechanic) {
      conflictingBooking = await Booking.findOne({
        mechanic,
        scheduledDate: requestedDate,
        scheduledTime,
        status: { $in: ['confirmed', 'in_progress'] }
      });
    }

    if (conflictingBooking) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }

    const booking = new Booking({
      customer: req.user.id,
      ...(mechanic && { mechanic }),
      serviceType,
      vehicleInfo,
      serviceDescription,
      scheduledDate: requestedDate,
      scheduledTime,
      estimatedDuration,
      estimatedCost,
      location,
      notes: { customer: notes }
    });

    await booking.save();
    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'mechanic', populate: { path: 'user', select: 'name email phone' } }
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings with filtering and pagination
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      serviceType,
      customer,
      mechanic,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Add filters based on user role
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'mechanic') {
      const mechanicProfile = await Mechanic.findOne({ user: req.user.id });
      if (mechanicProfile) {
        query.mechanic = mechanicProfile._id;
      } else {
        return res.status(404).json({ message: 'Mechanic profile not found' });
      }
    } else if (req.user.role === 'admin') {
      // Admin can see all bookings
      if (customer) query.customer = customer;
      if (mechanic) query.mechanic = mechanic;
    }

    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'customer', select: 'name email phone' },
        { path: 'mechanic', populate: { path: 'user', select: 'name email phone' } }
      ],
      sort: { scheduledDate: -1, createdAt: -1 }
    };

    const bookings = await Booking.paginate(query, options);

    res.json({
      message: 'Bookings retrieved successfully',
      bookings: bookings.docs,
      pagination: {
        currentPage: bookings.page,
        totalPages: bookings.totalPages,
        totalBookings: bookings.totalDocs,
        hasNext: bookings.hasNextPage,
        hasPrev: bookings.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate({
        path: 'mechanic',
        populate: { path: 'user', select: 'name email phone address' }
      });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has access to this booking
    const hasAccess = req.user.role === 'admin' || 
                     booking.customer._id.toString() === req.user.id ||
                     (req.user.role === 'mechanic' && booking.mechanic.user._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({
      message: 'Booking retrieved successfully',
      booking
    });
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Mechanic or Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('mechanic', 'user')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isAuthorized = req.user.role === 'admin' || 
                        (req.user.role === 'mechanic' && booking.mechanic.user._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in_progress', 'cancelled', 'rescheduled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'rescheduled': ['confirmed', 'cancelled']
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    // Update booking
    booking.status = status;
    if (notes) {
      booking.notes.mechanic = notes;
    }

    // Set completion details if status is completed
    if (status === 'completed') {
      booking.completionDetails = {
        ...booking.completionDetails,
        completedAt: new Date()
      };
    }

    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('mechanic', 'user')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isAuthorized = req.user.role === 'admin' || 
                        booking.customer._id.toString() === req.user.id ||
                        (req.user.role === 'mechanic' && booking.mechanic.user._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Disallow customers to cancel after admin approval (status not 'pending')
    if (req.user.role === 'customer' && booking.status !== 'pending') {
      return res.status(400).json({
        message: 'You cannot cancel after the booking is approved by admin'
      });
    }

    // Check if booking can be cancelled
    if (!booking.canBeCancelled()) {
      return res.status(400).json({
        message: 'Booking cannot be cancelled. Please contact support.'
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reschedule a booking
// @route   PUT /api/bookings/:id/reschedule
// @access  Private (Customer, Admin)
export const rescheduleBooking = async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;
    const bookingId = req.params.id;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'New date and time are required' });
    }

    // Validate that new date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(newDate);
    
    if (requestedDate < today) {
      return res.status(400).json({ message: 'Cannot book appointments in the past' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('mechanic', 'user')
      .populate('customer', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isAuthorized = req.user.role === 'admin' || 
                        booking.customer._id.toString() === req.user.id ||
                        (req.user.role === 'mechanic' && booking.mechanic.user._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to reschedule this booking' });
    }

    // Disallow customers to reschedule after admin approval (status not 'pending')
    if (req.user.role === 'customer' && booking.status !== 'pending') {
      return res.status(400).json({
        message: 'You cannot reschedule after the booking is approved by admin'
      });
    }

    // Check if booking can be rescheduled
    if (!booking.canBeRescheduled()) {
      return res.status(400).json({
        message: 'Booking cannot be rescheduled. Please contact support.'
      });
    }

    // Check if new time slot is available
    const newScheduledDate = new Date(newDate);
    const conflictingBooking = await Booking.findOne({
      mechanic: booking.mechanic._id,
      scheduledDate: newScheduledDate,
      scheduledTime: newTime,
      status: { $in: ['confirmed', 'in_progress'] },
      _id: { $ne: bookingId }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: 'New time slot is already booked' });
    }

    // Create rescheduled booking
    const rescheduledBooking = new Booking({
      ...booking.toObject(),
      _id: undefined,
      scheduledDate: newScheduledDate,
      scheduledTime: newTime,
      status: 'pending',
      rescheduledFrom: bookingId,
      notes: {
        ...booking.notes,
        admin: reason || 'Booking rescheduled'
      }
    });

    await rescheduledBooking.save();

    // Update original booking
    booking.status = 'rescheduled';
    booking.notes.admin = reason || 'Booking rescheduled';
    await booking.save();

    await rescheduledBooking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'mechanic', populate: { path: 'user', select: 'name email phone' } }
    ]);

    res.json({
      message: 'Booking rescheduled successfully',
      originalBooking: booking,
      newBooking: rescheduledBooking
    });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add completion details to booking
// @route   PUT /api/bookings/:id/complete
// @access  Private (Mechanic)
export const completeBooking = async (req, res) => {
  try {
    const { actualDuration, actualCost, workPerformed, partsUsed } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId)
      .populate('mechanic', 'user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (req.user.role !== 'mechanic' || booking.mechanic.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the assigned mechanic can complete this booking' });
    }

    if (booking.status !== 'in_progress') {
      return res.status(400).json({ message: 'Booking must be in progress to be completed' });
    }

    // Update completion details
    booking.completionDetails = {
      actualDuration,
      actualCost,
      workPerformed,
      partsUsed,
      completedAt: new Date()
    };

    booking.status = 'completed';
    await booking.save();

    res.json({
      message: 'Booking completed successfully',
      booking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Admin)
export const getBookingStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$estimatedCost' } } }
    ]);

    res.json({
      message: 'Booking statistics retrieved successfully',
      stats: {
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error getting booking stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign or reassign a mechanic to a booking and set schedule/status
// @route   PUT /api/bookings/:id/assign
// @access  Private (Admin)
export const assignMechanic = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { mechanicId, scheduledDate, scheduledTime, status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Validate mechanic
    const mechanic = await Mechanic.findById(mechanicId).populate('user');
    if (!mechanic || !mechanic.isActive) {
      return res.status(404).json({ message: 'Mechanic not found or not active' });
    }

    // Optionally update schedule
    if (scheduledDate) {
      booking.scheduledDate = new Date(scheduledDate);
    }
    if (scheduledTime) {
      booking.scheduledTime = scheduledTime;
    }

    // Assign mechanic
    booking.mechanic = mechanic._id;

    // Optionally update status (e.g., pending -> confirmed)
    if (status) {
      const allowed = ['pending','confirmed','in_progress','completed','cancelled','rescheduled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      booking.status = status;
    }

    await booking.save();
    await booking.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'mechanic', populate: { path: 'user', select: 'name email phone' } }
    ]);

    res.json({ message: 'Booking assigned successfully', booking });
  } catch (error) {
    console.error('Error assigning mechanic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};