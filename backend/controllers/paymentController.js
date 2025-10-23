import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import AccessoryOrder from '../models/AccessoryOrder.js';
import Payment from '../models/Payment.js';
import CarWashBooking from '../models/CarWashBooking.js';

// Load environment variables
dotenv.config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a payment order
const createPaymentOrder = async (req, res) => {
  try {
    console.log('=== CREATE PAYMENT ORDER REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { orderId } = req.body;
    
    // Find the order
    const order = await AccessoryOrder.findById(orderId).populate('user');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('Found order:', JSON.stringify(order, null, 2));
    
    // Check if order is already paid
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: order.totalAmount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_order_${orderId}`,
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
        orderDetails: {
          orderId: order._id,
          totalAmount: order.totalAmount,
          items: order.items
        }
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
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

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;
    
    console.log('=== VERIFY PAYMENT REQUEST ===');
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
    
    // Find the order
    const order = await AccessoryOrder.findById(orderId);
    
    if (!order) {
      console.log('Order not found during payment verification');
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    console.log('Found order for payment verification:', JSON.stringify(order, null, 2));
    
    // Update order payment status
    order.paymentStatus = 'Paid';
    order.paymentMethod = 'Razorpay';
    await order.save();
    
    console.log('Order updated with payment status');
    
    // Create payment record
    const payment = new Payment({
      order: orderId,
      user: order.user,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      amount: order.totalAmount,
      method: 'card', // This would typically come from the frontend
      status: 'captured',
      currency: 'INR'
    });
    
    await payment.save();
    
    console.log('Payment record created:', JSON.stringify(payment, null, 2));
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order._id,
        paymentId: payment._id
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Get payment by order ID (protected route)
const getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findOne({ order: orderId })
      .populate('order', 'orderNumber totalAmount')
      .populate('user', 'name email');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Get all payments for a user (protected route)
const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if the requesting user is authorized to view these payments
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these payments'
      });
    }
    
    // Get accessory payments
    const accessoryPayments = await Payment.find({ user: userId })
      .populate('order', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });
    
    // Get car wash bookings with payment status 'Paid'
    const carWashBookings = await CarWashBooking.find({ 
      customerId: userId, 
      paymentStatus: 'Paid' 
    }).sort({ createdAt: -1 });
    
    // Format car wash bookings as payment objects
    const carWashPayments = carWashBookings.map(booking => ({
      _id: booking._id,
      order: {
        _id: booking._id,
        orderNumber: `CW-${booking._id.toString().substring(0, 8).toUpperCase()}`,
        totalAmount: booking.payment?.amount || 0
      },
      user: booking.customerId,
      razorpayPaymentId: booking.payment?.razorpayPaymentId || '',
      razorpayOrderId: booking.payment?.razorpayOrderId || '',
      razorpaySignature: booking.payment?.razorpaySignature || '',
      amount: booking.payment?.amount || 0,
      currency: booking.payment?.currency || 'INR',
      status: 'captured',
      method: booking.payment?.method || 'card',
      description: `Car Wash Service - ${booking.serviceType}`,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      isCarWash: true
    }));
    
    // Combine and sort all payments by date
    const allPayments = [...accessoryPayments, ...carWashPayments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      data: allPayments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user payments',
      error: error.message
    });
  }
};

export {
  createPaymentOrder,
  verifyPayment,
  getPaymentByOrderId,
  getUserPayments
};