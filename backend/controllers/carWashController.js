import CarWashBooking from "../models/CarWashBooking.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createCarWashBooking = async (req, res) => {
  try {
    const { carDetails, serviceType, date, timeSlot, location } = req.body;
    if (!carDetails?.model || !carDetails?.plateNumber || !serviceType || !date || !timeSlot || !location) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const booking = await CarWashBooking.create({
      customerId: req.user.id,
      carDetails,
      serviceType,
      date: new Date(date),
      timeSlot,
      location,
      status: 'Pending',
      paymentStatus: 'Unpaid'
    });
    return res.status(201).json({ message: 'Car wash booking created', booking });
  } catch (e) {
    console.error('createCarWashBooking error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const listCarWashBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, customerId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (customerId) query.customerId = customerId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    // Restrict for non-admins
    if (req.user.role !== 'admin') {
      query.customerId = req.user.id;
    }
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'customerId', select: 'name email phone' },
        { path: 'assignedStaffId', select: 'name email phone' }
      ],
      sort: { createdAt: -1 }
    };
    const result = await CarWashBooking.paginate(query, options);
    return res.json({ bookings: result.docs, pagination: { currentPage: result.page, totalPages: result.totalPages, total: result.totalDocs } });
  } catch (e) {
    console.error('listCarWashBookings error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const getCarWashBookingById = async (req, res) => {
  try {
    const booking = await CarWashBooking.findById(req.params.id).populate('customerId', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = booking.customerId._id.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) return res.status(403).json({ message: 'Not authorized' });
    return res.json({ booking });
  } catch (e) {
    console.error('getCarWashBookingById error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const updateCarWashBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { status } = req.body;
    const allowed = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const booking = await CarWashBooking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customerId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.json({ message: 'Status updated', booking });
  } catch (e) {
    console.error('updateCarWashBookingStatus error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const assignCarWashStaff = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    const { staffId } = req.body;
    const booking = await CarWashBooking.findByIdAndUpdate(
      req.params.id,
      { assignedStaffId: staffId },
      { new: true }
    ).populate('customerId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    return res.json({ message: 'Staff assigned', booking });
  } catch (e) {
    console.error('assignCarWashStaff error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

export const markCarWashPayment = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!['Paid', 'Unpaid'].includes(paymentStatus)) return res.status(400).json({ message: 'Invalid payment status' });
    // Owner or admin can update payment status
    const booking = await CarWashBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = booking.customerId.toString() === req.user.id;
    if (req.user.role !== 'admin' && !isOwner) return res.status(403).json({ message: 'Not authorized' });
    booking.paymentStatus = paymentStatus;
    await booking.save();
    return res.json({ message: 'Payment status updated', booking });
  } catch (e) {
    console.error('markCarWashPayment error:', e);
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
};

// Create a payment order for car wash booking
export const createCarWashPaymentOrder = async (req, res) => {
  try {
    console.log('=== CREATE CAR WASH PAYMENT ORDER REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { bookingId } = req.body;
    
    // Find the booking
    const booking = await CarWashBooking.findById(bookingId).populate('customerId');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    console.log('Found booking:', JSON.stringify(booking, null, 2));
    
    // Check if booking is already paid
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }
    
    // Define service prices
    const servicePrices = {
      'Basic': 399,
      'Premium': 799,
      'Interior & Exterior': 999,
      'Exterior Only': 499,
      'Interior Deep Clean': 1299
    };
    
    // Calculate amount based on service type
    const amount = servicePrices[booking.serviceType] || 0;
    
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service type or price'
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_carwash_${bookingId}`,
      payment_capture: 1 // Auto capture
    };
    
    console.log('Creating Razorpay order with options:', JSON.stringify(options, null, 2));
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    console.log('Razorpay order created:', JSON.stringify(razorpayOrder, null, 2));
    
    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        bookingDetails: {
          bookingId: booking._id,
          serviceType: booking.serviceType,
          amount: amount
        }
      }
    });
  } catch (error) {
    console.error('Error creating car wash payment order:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.statusCode);
    
    // Specific error handling for authentication issues
    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: 'Payment service authentication failed - Invalid API keys'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify car wash payment
export const verifyCarWashPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, bookingId } = req.body;
    
    console.log('=== VERIFY CAR WASH PAYMENT REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Verify the payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');
    
    console.log('Generated signature:', generatedSignature);
    console.log('Received signature:', razorpaySignature);
    
    if (generatedSignature !== razorpaySignature) {
      console.log('Payment verification failed - signature mismatch');
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - signature mismatch'
      });
    }
    
    // Find the booking
    const booking = await CarWashBooking.findById(bookingId);
    
    if (!booking) {
      console.log('Booking not found during payment verification');
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    console.log('Found booking for payment verification:', JSON.stringify(booking, null, 2));
    
    // Define service prices
    const servicePrices = {
      'Basic': 399,
      'Premium': 799,
      'Interior & Exterior': 999,
      'Exterior Only': 499,
      'Interior Deep Clean': 1299
    };
    
    // Calculate amount based on service type
    const amount = servicePrices[booking.serviceType] || 0;
    
    // Update booking payment status and information
    booking.paymentStatus = 'Paid';
    booking.payment = {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      amount,
      currency: 'INR'
    };
    await booking.save();
    
    console.log('Booking updated with payment status');
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        bookingId: booking._id
      }
    });
  } catch (error) {
    console.error('Error verifying car wash payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get car wash statistics
export const getCarWashStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    console.log('Fetching car wash stats...');
    
    // Get count by status
    const statusStats = await CarWashBooking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Status stats:', statusStats);

    // Get count by service type
    const serviceTypeStats = await CarWashBooking.aggregate([
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Service type stats:', serviceTypeStats);

    // Get count by location
    const locationStats = await CarWashBooking.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Location stats:', locationStats);

    // Get monthly stats
    const monthlyStats = await CarWashBooking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    console.log('Monthly stats:', monthlyStats);

    // Get total bookings
    const totalBookings = await CarWashBooking.countDocuments();
    console.log('Total bookings:', totalBookings);

    res.json({
      success: true,
      data: {
        totalBookings,
        statusStats,
        serviceTypeStats,
        locationStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching car wash stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car wash statistics',
      error: error.message
    });
  }
};
