import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mechanic'
    },
    serviceType: {
      type: String,
      required: true,
      enum: [
        'Engine Repair',
        'Brake System',
        'Transmission',
        'Electrical Systems',
        'Air Conditioning',
        'Suspension',
        'Exhaust System',
        'General Maintenance',
        'Diagnostic Services',
        'Oil Change',
        'Tire Services',
        'Battery Services',
        'Emergency Repair',
        'Inspection'
      ]
    },
    vehicleInfo: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      licensePlate: { type: String, required: true },
      vin: { type: String },
      mileage: { type: Number },
      color: { type: String }
    },
    serviceDescription: {
      type: String,
      required: true,
      maxlength: 1000
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    scheduledTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    estimatedDuration: {
      type: Number, // in hours
      required: true,
      min: 0.5,
      max: 24
    },
    estimatedCost: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'rescheduled'
      ],
      default: 'pending'
    },
    location: {
      type: {
        type: String,
        enum: ['customer_location', 'mechanic_shop', 'mobile_service'],
        default: 'customer_location'
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      }
    },
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'online', 'insurance'],
        default: 'cash'
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
      },
      amount: Number,
      paidAt: Date,
      transactionId: String
    },
    notes: {
      customer: String,
      mechanic: String,
      admin: String
    },
    images: [{
      url: String,
      description: String,
      uploadedBy: {
        type: String,
        enum: ['customer', 'mechanic']
      },
      uploadedAt: { type: Date, default: Date.now }
    }],
    rating: {
      value: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date
    },
    completionDetails: {
      actualDuration: Number,
      actualCost: Number,
      workPerformed: String,
      partsUsed: [{
        name: String,
        cost: Number,
        quantity: Number
      }],
      completedAt: Date
    },
    cancellationReason: String,
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ mechanic: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1, scheduledTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ serviceType: 1 });

// Virtual for full customer name
bookingSchema.virtual('customerName').get(function() {
  return this.customer ? this.customer.name : '';
});

// Virtual for full mechanic name
bookingSchema.virtual('mechanicName').get(function() {
  return this.mechanic ? this.mechanic.user.name : '';
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.scheduledDate);
  const timeDiff = bookingDateTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursDiff > 2;
};

// Method to check if booking can be rescheduled
bookingSchema.methods.canBeRescheduled = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.scheduledDate);
  const timeDiff = bookingDateTime - now;
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  return ['pending', 'confirmed'].includes(this.status) && hoursDiff > 4;
};

// Method to calculate total cost including parts
bookingSchema.methods.calculateTotalCost = function() {
  let total = this.estimatedCost || 0;
  if (this.completionDetails && this.completionDetails.partsUsed) {
    const partsCost = this.completionDetails.partsUsed.reduce((sum, part) => {
      return sum + (part.cost * part.quantity);
    }, 0);
    total += partsCost;
  }
  return total;
};

// Static method to find available time slots for a mechanic
bookingSchema.statics.findAvailableSlots = async function(mechanicId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingBookings = await this.find({
    mechanic: mechanicId,
    scheduledDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $in: ['confirmed', 'in_progress'] }
  }).select('scheduledTime estimatedDuration');
  
  return existingBookings;
};

// Pre-save middleware to validate booking time
bookingSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('scheduledDate')) {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare only dates, not time
    const scheduledDate = new Date(this.scheduledDate);
    scheduledDate.setHours(0, 0, 0, 0);
    
    if (scheduledDate < now) {
      return next(new Error('Cannot book appointments in the past'));
    }
  }
  next();
});

bookingSchema.plugin(mongoosePaginate);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
