import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const mechanicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    specialization: {
      type: [String],
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
        'Battery Services'
      ]
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 50
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0
    },
    availability: {
      monday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      },
      tuesday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      },
      wednesday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      },
      thursday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      },
      friday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      },
      saturday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      },
      sunday: {
        isAvailable: { type: Boolean, default: false },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "18:00" }
      }
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    serviceArea: {
      type: [String],
      required: true
    },
    certifications: [{
      name: String,
      issuingBody: String,
      issueDate: Date,
      expiryDate: Date
    }],
    bio: {
      type: String,
      maxlength: 500
    },
    profileImage: {
      type: String
    },
    documents: [{
      type: { type: String, enum: ['license', 'insurance', 'certification', 'other'] },
      url: String,
      name: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Index for efficient searching
mechanicSchema.index({ specialization: 1 });
mechanicSchema.index({ serviceArea: 1 });
mechanicSchema.index({ rating: -1 });
mechanicSchema.index({ isActive: 1 });

// Virtual for full name
mechanicSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.name}` : '';
});

// Method to check if mechanic is available at specific time
mechanicSchema.methods.isAvailableAt = function(dayOfWeek, time) {
  const day = dayOfWeek.toLowerCase();
  const dayAvailability = this.availability[day];
  
  if (!dayAvailability || !dayAvailability.isAvailable) {
    return false;
  }
  
  const startTime = dayAvailability.startTime;
  const endTime = dayAvailability.endTime;
  
  return time >= startTime && time <= endTime;
};

// Method to update rating
mechanicSchema.methods.updateRating = function(newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

mechanicSchema.plugin(mongoosePaginate);

const Mechanic = mongoose.model("Mechanic", mechanicSchema);
export default Mechanic;
