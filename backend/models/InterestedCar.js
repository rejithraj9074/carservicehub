import mongoose from 'mongoose';

const interestedCarSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarListing',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
interestedCarSchema.index({ userId: 1, carId: 1 }, { unique: true });
interestedCarSchema.index({ carId: 1 });
interestedCarSchema.index({ createdAt: -1 });

export default mongoose.model('InterestedCar', interestedCarSchema);