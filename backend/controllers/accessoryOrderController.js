import AccessoryOrder from '../models/AccessoryOrder.js';
import Accessory from '../models/Accessory.js';
import { validationResult } from 'express-validator';

// Get all accessory orders with filtering and pagination
const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (paymentStatus && paymentStatus !== 'all') {
      filter.paymentStatus = paymentStatus;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const orders = await AccessoryOrder.find(filter)
      .populate('user', 'name email phone')
      .populate('items.accessory', 'name price image category')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await AccessoryOrder.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await AccessoryOrder.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.accessory', 'name price image category description');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const order = await AccessoryOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    await order.updateStatus(status, trackingNumber);
    
    // Add notes if provided
    if (notes) {
      order.notes = notes;
      await order.save();
    }

    // If order is being cancelled, restore stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Accessory.findByIdAndUpdate(
          item.accessory,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    // Populate the updated order
    const updatedOrder = await AccessoryOrder.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.accessory', 'name price image category');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Create new order (for testing or manual order creation)
const createOrder = async (req, res) => {
  try {
    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from request:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Request validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Request validation failed',
        errors: errors.array()
      });
    }

    const orderData = req.body;
    
    // Add user from request if not provided in orderData
    if (req.user && !orderData.user) {
      orderData.user = req.user.id;
    }
    
    console.log('Order data after user assignment:', JSON.stringify(orderData, null, 2));
    
    // Validate that all accessories exist and have sufficient stock
    for (const item of orderData.items) {
      const accessory = await Accessory.findById(item.accessory);
      if (!accessory) {
        return res.status(400).json({
          success: false,
          message: `Accessory with ID ${item.accessory} not found`
        });
      }
      if (accessory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${accessory.name}. Available: ${accessory.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of orderData.items) {
      const accessory = await Accessory.findById(item.accessory);
      item.price = accessory.price;
      totalAmount += accessory.price * item.quantity;
    }
    
    orderData.totalAmount = totalAmount;
    
    console.log('Processed order data:', JSON.stringify(orderData, null, 2));

    const order = new AccessoryOrder(orderData);
    
    // Validate the order before saving
    const validationError = order.validateSync();
    if (validationError) {
      console.log('Mongoose validation errors:', JSON.stringify(validationError.errors, null, 2));
      const errorMessages = Object.values(validationError.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Mongoose validation failed',
        errors: errorMessages
      });
    }
    
    console.log('Saving order to database...');
    await order.save();
    console.log('Order saved successfully with ID:', order._id);

    // Reduce stock for each item
    for (const item of order.items) {
      await Accessory.findByIdAndUpdate(
        item.accessory,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Populate the created order
    const populatedOrder = await AccessoryOrder.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.accessory', 'name price image category');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    // More detailed error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Get orders by user
const getOrdersByUser = async (req, res) => {
  try {
    // Use the authenticated user's ID from the request object
    const userId = req.user.id;
    const orders = await AccessoryOrder.getByUser(userId);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const stats = await AccessoryOrder.getStats();
    
    // Get additional statistics
    const recentOrders = await AccessoryOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('items.accessory', 'name')
      .lean();

    const monthlyStats = await AccessoryOrder.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        ...stats,
        recentOrders,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// Delete order (soft delete by updating status to cancelled)
const deleteOrder = async (req, res) => {
  try {
    const order = await AccessoryOrder.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a delivered order'
      });
    }

    // Restore stock if order is not already cancelled
    if (order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Accessory.findByIdAndUpdate(
          item.accessory,
          { $inc: { stock: item.quantity } }
        );
      }
    }

    await order.updateStatus('Cancelled');

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

export {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
  getOrdersByUser,
  getOrderStats,
  deleteOrder
};
