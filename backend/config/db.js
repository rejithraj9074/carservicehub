// config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Use Atlas URI from .env, otherwise fallback to local MongoDB
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smartcarservice";

    console.log("Environment variables loaded:");
    console.log("- MONGO_URI:", process.env.MONGO_URI ? "✅ Found" : "❌ Not found");
    console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Found" : "❌ Not found");
    console.log("- PORT:", process.env.PORT || "Not set");
    console.log("Using URI:", uri.includes("mongodb+srv") ? "🌐 Atlas (Cloud)" : "🏠 Local");
    console.log("Attempting to connect to MongoDB...");

    // Enable mongoose debug mode if needed
    if (process.env.MONGOOSE_DEBUG === "true") {
      mongoose.set("debug", true);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // fail fast if Mongo is unreachable
      socketTimeoutMS: 30000, // avoid long hanging sockets
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error?.message || error);
    console.error("⚠️  Continuing without database connection for testing purposes...");
    console.error("To fix: Install MongoDB locally or set MONGO_URI in .env file");
    // Don't exit the process, allow the server to start for testing
  }
};

export default connectDB;
