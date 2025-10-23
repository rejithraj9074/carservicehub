import User from '../models/User.js';

// Get all sellers
const getAllSellers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status
    } = req.query;

    // Build filter object for sellers
    const filter = { role: 'customer' }; // Assuming sellers are customers who list cars
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.isBlocked = status === 'blocked';
    }

    // Execute query with pagination
    const sellers = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password'); // Exclude password field

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: sellers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sellers',
      error: error.message
    });
  }
};

// Block seller
const blockSeller = async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      message: 'Seller blocked successfully',
      data: seller
    });
  } catch (error) {
    console.error('Error blocking seller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block seller',
      error: error.message
    });
  }
};

// Unblock seller
const unblockSeller = async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    res.json({
      success: true,
      message: 'Seller unblocked successfully',
      data: seller
    });
  } catch (error) {
    console.error('Error unblocking seller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock seller',
      error: error.message
    });
  }
};

// Get seller statistics
const getSellerStats = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: 'customer' });
    const blocked = await User.countDocuments({ role: 'customer', isBlocked: true });
    const active = total - blocked;
    
    // Top sellers by listings
    // This would require a more complex aggregation if we had a separate Seller model
    // For now, we'll just return basic stats
    
    res.json({
      success: true,
      data: {
        total,
        active,
        blocked
      }
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller statistics',
      error: error.message
    });
  }
};

export {
  getAllSellers,
  blockSeller,
  unblockSeller,
  getSellerStats
};