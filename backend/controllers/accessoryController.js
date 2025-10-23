import Accessory from '../models/Accessory.js';
import { validationResult } from 'express-validator';

// Get all accessories with filtering and pagination
const getAllAccessories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      stockStatus
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (stockStatus) {
      switch (stockStatus) {
        case 'in-stock':
          filter.stock = { $gt: 10 };
          break;
        case 'low-stock':
          filter.stock = { $gt: 0, $lte: 10 };
          break;
        case 'out-of-stock':
          filter.stock = 0;
          break;
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const accessories = await Accessory.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Accessory.countDocuments(filter);

    res.json({
      success: true,
      data: accessories,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories',
      error: error.message
    });
  }
};

// Get single accessory by ID
const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    
    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    res.json({
      success: true,
      data: accessory
    });
  } catch (error) {
    console.error('Error fetching accessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessory',
      error: error.message
    });
  }
};

// Create new accessory
const createAccessory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('Accessory validation failed:', {
        errors: errors.array(),
        body: req.body
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const accessoryData = { ...req.body };

    // Handle uploaded image
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      accessoryData.image = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // Parse arrays if passed as JSON strings
    if (typeof accessoryData.compatibility === 'string') {
      try { accessoryData.compatibility = JSON.parse(accessoryData.compatibility); } catch {}
    }
    if (typeof accessoryData.tags === 'string') {
      try { accessoryData.tags = JSON.parse(accessoryData.tags); } catch {}
    }

    // Normalize numeric fields
    if (accessoryData.price !== undefined && accessoryData.price !== '') {
      accessoryData.price = Number(accessoryData.price);
    }
    if (accessoryData.stock !== undefined && accessoryData.stock !== '') {
      accessoryData.stock = Number(accessoryData.stock);
    }

    // Remove unsupported fields (dimensions/weight if empty strings)
    if (accessoryData.dimensions) {
      const { length, width, height } = accessoryData.dimensions;
      accessoryData.dimensions = {
        ...(length ? { length: Number(length) } : {}),
        ...(width ? { width: Number(width) } : {}),
        ...(height ? { height: Number(height) } : {})
      };
    }
    if (accessoryData.weight === '' || accessoryData.weight === undefined) {
      delete accessoryData.weight;
    }

    const accessory = new Accessory(accessoryData);
    await accessory.save();

    res.status(201).json({
      success: true,
      message: 'Accessory created successfully',
      data: accessory
    });
  } catch (error) {
    console.error('Error creating accessory:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Accessory with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create accessory',
      error: error.message
    });
  }
};

// Update accessory
const updateAccessory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = { ...req.body };

    // Handle uploaded image
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      updateData.image = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // Parse arrays if passed as JSON strings
    if (typeof updateData.compatibility === 'string') {
      try { updateData.compatibility = JSON.parse(updateData.compatibility); } catch {}
    }
    if (typeof updateData.tags === 'string') {
      try { updateData.tags = JSON.parse(updateData.tags); } catch {}
    }

    // Normalize numeric fields
    if (updateData.price !== undefined && updateData.price !== '') {
      updateData.price = Number(updateData.price);
    }
    if (updateData.stock !== undefined && updateData.stock !== '') {
      updateData.stock = Number(updateData.stock);
    }

    // Remove unsupported fields (dimensions/weight if empty strings)
    if (updateData.dimensions) {
      const { length, width, height } = updateData.dimensions;
      updateData.dimensions = {
        ...(length ? { length: Number(length) } : {}),
        ...(width ? { width: Number(width) } : {}),
        ...(height ? { height: Number(height) } : {})
      };
    }
    if (updateData.weight === '' || updateData.weight === undefined) {
      delete updateData.weight;
    }

    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    res.json({
      success: true,
      message: 'Accessory updated successfully',
      data: accessory
    });
  } catch (error) {
    console.error('Error updating accessory:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Accessory with this SKU already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update accessory',
      error: error.message
    });
  }
};

// Delete accessory (soft delete)
const deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    res.json({
      success: true,
      message: 'Accessory deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting accessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete accessory',
      error: error.message
    });
  }
};

// Get accessories by category
const getAccessoriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const accessories = await Accessory.getByCategory(category);
    
    res.json({
      success: true,
      data: accessories
    });
  } catch (error) {
    console.error('Error fetching accessories by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories by category',
      error: error.message
    });
  }
};

// Get low stock accessories
const getLowStockAccessories = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const accessories = await Accessory.getLowStock(parseInt(threshold));
    
    res.json({
      success: true,
      data: accessories
    });
  } catch (error) {
    console.error('Error fetching low stock accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock accessories',
      error: error.message
    });
  }
};

// Update stock for an accessory
const updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a number'
      });
    }

    const accessory = await Accessory.findById(req.params.id);
    
    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    await accessory.updateStock(quantity);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: accessory
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// Get accessory statistics
const getAccessoryStats = async (req, res) => {
  try {
    const total = await Accessory.countDocuments({ isActive: true });
    const inStock = await Accessory.countDocuments({ isActive: true, stock: { $gt: 0 } });
    const lowStock = await Accessory.countDocuments({ isActive: true, stock: { $gt: 0, $lte: 10 } });
    const outOfStock = await Accessory.countDocuments({ isActive: true, stock: 0 });
    
    const categories = await Accessory.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const topAccessories = await Accessory.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price stock category');

    res.json({
      success: true,
      data: {
        total,
        inStock,
        lowStock,
        outOfStock,
        categories,
        topAccessories
      }
    });
  } catch (error) {
    console.error('Error fetching accessory stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessory statistics',
      error: error.message
    });
  }
};

export {
  getAllAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoriesByCategory,
  getLowStockAccessories,
  updateStock,
  getAccessoryStats
};