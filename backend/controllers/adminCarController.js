import CarListing from '../models/CarListing.js';
import { validationResult } from 'express-validator';

// Get all car listings with filtering and pagination
const getAllCarListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      brand,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      status,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear);
      if (maxYear) filter.year.$lte = parseInt(maxYear);
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const carListings = await CarListing.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CarListing.countDocuments(filter);

    res.json({
      success: true,
      data: carListings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching car listings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car listings',
      error: error.message
    });
  }
};

// Get single car listing by ID
const getCarListingById = async (req, res) => {
  try {
    const carListing = await CarListing.findById(req.params.id);
    
    if (!carListing) {
      return res.status(404).json({
        success: false,
        message: 'Car listing not found'
      });
    }

    res.json({
      success: true,
      data: carListing
    });
  } catch (error) {
    console.error('Error fetching car listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car listing',
      error: error.message
    });
  }
};

// Create new car listing
const createCarListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const carListingData = { ...req.body };

    // Handle uploaded images - store relative paths instead of absolute URLs
    if (req.files && req.files.length > 0) {
      // Store only the filename, not the full URL
      carListingData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const carListing = new CarListing(carListingData);
    await carListing.save();

    res.status(201).json({
      success: true,
      message: 'Car listing created successfully',
      data: carListing
    });
  } catch (error) {
    console.error('Error creating car listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create car listing',
      error: error.message
    });
  }
};

// Update car listing verification status
const updateCarListingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const carListing = await CarListing.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!carListing) {
      return res.status(404).json({
        success: false,
        message: 'Car listing not found'
      });
    }

    res.json({
      success: true,
      message: `Car listing ${status.toLowerCase()} successfully`,
      data: carListing
    });
  } catch (error) {
    console.error('Error updating car listing status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car listing status',
      error: error.message
    });
  }
};

// Delete car listing
const deleteCarListing = async (req, res) => {
  try {
    const carListing = await CarListing.findByIdAndDelete(req.params.id);

    if (!carListing) {
      return res.status(404).json({
        success: false,
        message: 'Car listing not found'
      });
    }

    res.json({
      success: true,
      message: 'Car listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting car listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete car listing',
      error: error.message
    });
  }
};

// Get car listing statistics
const getCarListingStats = async (req, res) => {
  try {
    const total = await CarListing.countDocuments();
    const pending = await CarListing.countDocuments({ status: 'Pending' });
    const verified = await CarListing.countDocuments({ status: 'Verified' });
    const rejected = await CarListing.countDocuments({ status: 'Rejected' });
    
    // Top brands
    const topBrands = await CarListing.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Listings per month
    const monthlyStats = await CarListing.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        verified,
        rejected,
        topBrands,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching car listing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch car listing statistics',
      error: error.message
    });
  }
};

export {
  getAllCarListings,
  getCarListingById,
  createCarListing,
  updateCarListingStatus,
  deleteCarListing,
  getCarListingStats
};