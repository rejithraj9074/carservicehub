import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const carWashBookingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    carDetails: {
      model: { type: String, required: true },
      plateNumber: { type: String, required: true }
    },
    serviceType: {
      type: String,
      required: true,
      enum: ['Basic', 'Premium', 'Interior & Exterior', 'Exterior Only', 'Interior Deep Clean']
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    location: {
      type: String,
      required: true,
      enum: ['workshop', 'doorstep']
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Unpaid'],
      default: 'Unpaid'
    },
    // Payment information
    payment: {
      razorpayPaymentId: { type: String },
      razorpayOrderId: { type: String },
      razorpaySignature: { type: String },
      amount: { type: Number },
      currency: { type: String, default: 'INR' },
      method: { 
        type: String, 
        enum: ['card', 'netbanking', 'wallet', 'emi', 'upi'] 
      }
    },
    assignedStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  },
  { timestamps: true }
);

carWashBookingSchema.index({ customerId: 1, status: 1 });
carWashBookingSchema.index({ date: 1, timeSlot: 1, location: 1 });

carWashBookingSchema.plugin(mongoosePaginate);

const CarWashBooking = mongoose.model('CarWashBooking', carWashBookingSchema);
export default CarWashBooking;


