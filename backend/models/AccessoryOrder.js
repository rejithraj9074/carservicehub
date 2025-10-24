import mongoose from 'mongoose';

const accessoryOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  items: [{
    accessory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Accessory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      message: 'Status must be one of: Pending, Processing, Shipped, Delivered, Cancelled'
    },
    default: 'Pending'
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'USA' }
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total items count
accessoryOrderSchema.virtual('totalItems').get(function() {
  // Ensure items is an array before using reduce
  if (!Array.isArray(this.items)) {
    return 0;
  }
  return this.items.reduce((total, item) => total + (item?.quantity || 0), 0);
});

// Virtual for formatted total amount
accessoryOrderSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(this.totalAmount);
});

// Virtual for order age
accessoryOrderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for better query performance
accessoryOrderSchema.index({ orderNumber: 1 }, { unique: true });
accessoryOrderSchema.index({ user: 1 });
accessoryOrderSchema.index({ status: 1 });
accessoryOrderSchema.index({ createdAt: -1 });
accessoryOrderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to generate order number
accessoryOrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const sequence = (count + 1).toString().padStart(4, '0');
      this.orderNumber = `ACC-${year}${month}${day}-${sequence}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      return next(error);
    }
  }
  next();
});

// Static method to get orders by status
accessoryOrderSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('user', 'name email phone').populate('items.accessory', 'name price image');
};

// Static method to get orders by user
accessoryOrderSchema.statics.getByUser = function(userId) {
  return this.find({ user: userId }).populate('items.accessory', 'name price image').sort({ createdAt: -1 });
};

// Static method to get order statistics
accessoryOrderSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  const totalOrders = await this.countDocuments();
  const totalRevenue = await this.aggregate([
    { $match: { status: { $in: ['Delivered'] } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  return {
    byStatus: stats,
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0
  };
};

// Instance method to update status
accessoryOrderSchema.methods.updateStatus = function(newStatus, trackingNumber = null) {
  this.status = newStatus;
  if (trackingNumber) {
    this.trackingNumber = trackingNumber;
  }
  
  if (newStatus === 'Delivered') {
    this.actualDelivery = new Date();
  }
  
  return this.save();
};

export default mongoose.model('AccessoryOrder', accessoryOrderSchema);