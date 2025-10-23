import CarListing from '../models/CarListing.js';

// Get all verified car listings with filtering and pagination (public)
export const getAllCarListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      brand,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      search
    } = req.query;

    // Build filter object - only show verified cars to public
    const filter = { status: 'Verified' };
    
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

// Get single verified car listing by ID (public)
export const getCarListingById = async (req, res) => {
  try {
    const carListing = await CarListing.findOne({ 
      _id: req.params.id, 
      status: 'Verified' 
    });
    
    if (!carListing) {
      return res.status(404).json({
        success: false,
        message: 'Car listing not found or not verified'
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