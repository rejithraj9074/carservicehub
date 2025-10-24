import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import mechanicRoutes from "./routes/mechanicRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import carWashRoutes from "./routes/carWashRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminMechanicRoutes from "./routes/adminMechanicRoutes.js";
import accessoryRoutes from "./routes/accessoryRoutes.js";
import accessoryOrderRoutes from "./routes/accessoryOrderRoutes.js";
import publicAccessoryRoutes from "./routes/publicAccessoryRoutes.js";
import adminCarRoutes from "./routes/adminCarRoutes.js";
import adminSellerRoutes from "./routes/adminSellerRoutes.js";
import interestedRoutes from "./routes/interestedRoutes.js";
import publicCarRoutes from "./routes/publicCarRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import publicPaymentRoutes from "./routes/publicPaymentRoutes.js";
import publicAccessoryOrderRoutes from "./routes/publicAccessoryOrderRoutes.js";

// Load environment variables
// In production, Render will set NODE_ENV to 'production'
const environment = process.env.NODE_ENV || 'development';
console.log(`Loading environment: ${environment}`);

// Load the appropriate .env file
if (environment === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}

// Debug: confirm .env is loaded
console.log("Loaded Mongo URI:", process.env.MONGO_URI || "❌ Not found");
console.log("FIREBASE_PROJECT_ID:", process.env.FIREBASE_PROJECT_ID || "❌ Not found");
console.log("FIREBASE_CLIENT_EMAIL:", process.env.FIREBASE_CLIENT_EMAIL || "❌ Not found");
console.log("FIREBASE_PRIVATE_KEY_ID:", process.env.FIREBASE_PRIVATE_KEY_ID || "❌ Not found");
console.log("FIREBASE_PRIVATE_KEY:", process.env.FIREBASE_PRIVATE_KEY ? "✅ Found (length: " + process.env.FIREBASE_PRIVATE_KEY.length + ")" : "❌ Not found");
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID || "❌ Not found");
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET ? "✅ Found (length: " + process.env.RAZORPAY_KEY_SECRET.length + ")" : "❌ Not found");

// Initialize app
const app = express();

// Middleware
app.use(express.json()); // parse JSON
// Configure CORS for production
if (environment === 'production') {
  // In production, only allow requests from your frontend domain
  // You'll need to replace 'your-frontend-url.onrender.com' with your actual frontend URL
  const allowedOrigins = [
    process.env.FRONTEND_URL || "https://your-frontend-url.onrender.com",
    "http://localhost:3000", // For local development
    "http://localhost:5000"  // For local backend testing
  ];
  
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  // In development, allow all origins
  app.use(cors());
}

// Serve uploaded images statically
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// Initialize Firebase Admin after environment variables are loaded
import { initializeFirebaseAdmin } from './config/firebaseAdmin.js';
initializeFirebaseAdmin();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mechanics", mechanicRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/carwash", carWashRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/mechanics", adminMechanicRoutes);
app.use("/api/admin/accessories", accessoryRoutes);
app.use("/api/admin/accessory-orders", accessoryOrderRoutes);
app.use("/api/accessories", publicAccessoryRoutes);
app.use("/api/admin/cars", adminCarRoutes);
app.use("/api/admin/sellers", adminSellerRoutes);
app.use("/api/interested", interestedRoutes);
app.use("/api/cars", publicCarRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment", publicPaymentRoutes);
app.use("/api/accessory-orders", publicAccessoryOrderRoutes);

// Health check / default route
app.get("/", (req, res) => {
  res.send("🚀 CarvoHub Backend API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} in ${environment} mode`)
);