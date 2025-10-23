import mongoose from 'mongoose';

const accessorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Accessory name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Interior', 'Exterior', 'Electronics', 'Other'],
      message: 'Category must be one of: Interior, Exterior, Electronics, Other'
    }
  },
  image: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  compatibility: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for stock status
accessorySchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock <= 10) return 'Low Stock';
  return 'In Stock';
});

// Virtual for formatted price in Indian Rupees
accessorySchema.virtual('formattedPrice').get(function() {
  // Format as Indian Rupees (₹)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(this.price);
});

// Index for better search performance
accessorySchema.index({ name: 'text', description: 'text', brand: 'text' });
accessorySchema.index({ category: 1 });
accessorySchema.index({ price: 1 });
accessorySchema.index({ stock: 1 });
accessorySchema.index({ isActive: 1 });

// Pre-save middleware to generate SKU if not provided
accessorySchema.pre('save', function(next) {
  if (!this.sku) {
    const categoryPrefix = this.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.sku = `${categoryPrefix}-${randomNum}`;
  }
  next();
});

// Static method to get accessories by category
accessorySchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to get low stock accessories
accessorySchema.statics.getLowStock = function(threshold = 10) {
  return this.find({ stock: { $lte: threshold }, isActive: true }).sort({ stock: 1 });
};

// Instance method to update stock
accessorySchema.methods.updateStock = function(quantity) {
  this.stock = Math.max(0, this.stock + quantity);
  return this.save();
};

export default mongoose.model('Accessory', accessorySchema);
