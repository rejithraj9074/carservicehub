import Mechanic from '../models/Mechanic.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Create a new mechanic profile
// @route   POST /api/mechanics
// @access  Private (User must be authenticated and have mechanic role)
export const createMechanic = async (req, res) => {
  try {
    const { userId, specialization, experience, hourlyRate, serviceArea, bio, certifications } = req.body;

    // Check if user exists and has mechanic role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'mechanic') {
      return res.status(400).json({ message: 'User must have mechanic role' });
    }

    // Check if mechanic profile already exists
    const existingMechanic = await Mechanic.findOne({ user: userId });
    if (existingMechanic) {
      return res.status(400).json({ message: 'Mechanic profile already exists for this user' });
    }

    const mechanic = new Mechanic({
      user: userId,
      specialization,
      experience,
      hourlyRate,
      serviceArea,
      bio,
      certifications
    });

    await mechanic.save();
    await mechanic.populate('user', 'name email phone address city state');

    res.status(201).json({
      message: 'Mechanic profile created successfully',
      mechanic
    });
  } catch (error) {
    console.error('Error creating mechanic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all mechanics with filtering and pagination
// @route   GET /api/mechanics
// @access  Public
export const getMechanics = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      serviceArea,
      minRating = 0,
      maxHourlyRate,
      isActive = true
    } = req.query;

    const query = { isActive };

    // Add filters
    if (specialization) {
      query.specialization = { $in: specialization.split(',') };
    }

    if (serviceArea) {
      query.serviceArea = { $in: serviceArea.split(',') };
    }

    if (minRating) {
      query['rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxHourlyRate) {
      query.hourlyRate = { $lte: parseFloat(maxHourlyRate) };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'user',
        select: 'name email phone address city state'
      },
      sort: { 'rating.average': -1, createdAt: -1 }
    };

    const mechanics = await Mechanic.paginate(query, options);

    res.json({
      message: 'Mechanics retrieved successfully',
      mechanics: mechanics.docs,
      pagination: {
        currentPage: mechanics.page,
        totalPages: mechanics.totalPages,
        totalMechanics: mechanics.totalDocs,
        hasNext: mechanics.hasNextPage,
        hasPrev: mechanics.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error getting mechanics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mechanic by ID
// @route   GET /api/mechanics/:id
// @access  Public
export const getMechanicById = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id)
      .populate('user', 'name email phone address city state')
      .populate({
        path: 'rating',
        populate: {
          path: 'reviews',
          select: 'rating review customer createdAt'
        }
      });

    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    res.json({
      message: 'Mechanic retrieved successfully',
      mechanic
    });
  } catch (error) {
    console.error('Error getting mechanic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update mechanic profile
// @route   PUT /api/mechanics/:id
// @access  Private (Mechanic owner or admin)
export const updateMechanic = async (req, res) => {
  try {
    const { specialization, experience, hourlyRate, availability, serviceArea, bio, certifications } = req.body;

    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // Check if user is the mechanic owner or admin
    if (req.user.id !== mechanic.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this mechanic profile' });
    }

    const updateData = {};
    if (specialization) updateData.specialization = specialization;
    if (experience !== undefined) updateData.experience = experience;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (availability) updateData.availability = availability;
    if (serviceArea) updateData.serviceArea = serviceArea;
    if (bio !== undefined) updateData.bio = bio;
    if (certifications) updateData.certifications = certifications;

    const updatedMechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone address city state');

    res.json({
      message: 'Mechanic profile updated successfully',
      mechanic: updatedMechanic
    });
  } catch (error) {
    console.error('Error updating mechanic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete mechanic profile
// @route   DELETE /api/mechanics/:id
// @access  Private (Mechanic owner or admin)
export const deleteMechanic = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // Check if user is the mechanic owner or admin
    if (req.user.id !== mechanic.user.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this mechanic profile' });
    }

    // Check if mechanic has active bookings
    const activeBookings = await Booking.countDocuments({
      mechanic: req.params.id,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        message: 'Cannot delete mechanic with active bookings. Please complete or cancel all bookings first.'
      });
    }

    await Mechanic.findByIdAndDelete(req.params.id);

    res.json({ message: 'Mechanic profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting mechanic:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get mechanic availability for a specific date
// @route   GET /api/mechanics/:id/availability
// @access  Public
export const getMechanicAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const mechanicId = req.params.id;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    const dayAvailability = mechanic.availability[dayOfWeek];
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return res.json({
        message: 'Mechanic not available on this day',
        available: false,
        availableSlots: []
      });
    }

    // Get existing bookings for the date
    const existingBookings = await Booking.findAvailableSlots(mechanicId, requestedDate);

    // Generate available time slots
    const availableSlots = generateTimeSlots(
      dayAvailability.startTime,
      dayAvailability.endTime,
      existingBookings
    );

    res.json({
      message: 'Availability retrieved successfully',
      available: true,
      availableSlots,
      workingHours: {
        start: dayAvailability.startTime,
        end: dayAvailability.endTime
      }
    });
  } catch (error) {
    console.error('Error getting mechanic availability:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update mechanic rating
// @route   POST /api/mechanics/:id/rating
// @access  Private (Customer who had booking with mechanic)
export const updateMechanicRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const mechanicId = req.params.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found' });
    }

    // Check if user has completed a booking with this mechanic
    const completedBooking = await Booking.findOne({
      customer: req.user.id,
      mechanic: mechanicId,
      status: 'completed',
      rating: { $exists: false }
    });

    if (!completedBooking) {
      return res.status(400).json({
        message: 'You can only rate mechanics after completing a booking'
      });
    }

    // Update mechanic rating
    await mechanic.updateRating(rating);

    // Update booking with rating
    completedBooking.rating = {
      value: rating,
      review,
      ratedAt: new Date()
    };
    await completedBooking.save();

    res.json({
      message: 'Rating updated successfully',
      mechanic: await Mechanic.findById(mechanicId).populate('user', 'name')
    });
  } catch (error) {
    console.error('Error updating mechanic rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to generate available time slots
const generateTimeSlots = (startTime, endTime, existingBookings) => {
  const slots = [];
  const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
  
  // Generate 1-hour slots
  for (let time = start; time < end; time += 60) {
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Check if slot conflicts with existing bookings
    const isAvailable = !existingBookings.some(booking => {
      const bookingTime = booking.scheduledTime;
      const bookingStart = parseInt(bookingTime.split(':')[0]) * 60 + parseInt(bookingTime.split(':')[1]);
      const bookingEnd = bookingStart + (booking.estimatedDuration * 60);
      
      return (time >= bookingStart && time < bookingEnd) || 
             (time + 60 > bookingStart && time + 60 <= bookingEnd);
    });
    
    if (isAvailable) {
      slots.push(timeString);
    }
  }
  
  return slots;
};
