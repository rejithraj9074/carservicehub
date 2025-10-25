import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Mechanic from "../models/Mechanic.js";
import Booking from "../models/Booking.js";
import CarWashBooking from "../models/CarWashBooking.js";

const router = express.Router();

const generateToken = (adminId) => {
  return jwt.sign({ id: adminId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// POST /api/admin/register - DISABLED for security
// Only admins should be created manually or through a secure process
router.post("/register", async (req, res) => {
  return res.status(403).json({ 
    message: "Admin registration is disabled. Admin accounts must be created manually by system administrators." 
  });
});

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If a role is specified and it's not 'admin', this is an error
    if (role && role !== 'admin') {
      return res.status(401).json({ message: `Invalid credentials for ${role}. This endpoint is for admin users only.` });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id);
    return res.status(200).json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Simple middleware for admin protect
const adminProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) return res.status(401).json({ message: "Not authorized" });
      req.admin = admin;
      next();
    } catch (e) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// GET /api/admin/overview - counts
router.get("/overview", adminProtect, async (req, res) => {
  try {
    const [usersCount, mechanicsCount, bookingsCount, carWashBookingsCount, revenueResult] = await Promise.all([
      User.countDocuments({}),
      Mechanic.countDocuments({}),
      Booking.countDocuments({}),
      CarWashBooking.countDocuments({}),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$estimatedCost' } } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return res.status(200).json({
      stats: {
        users: usersCount,
        mechanics: mechanicsCount,
        bookings: bookingsCount,
        carWashBookings: carWashBookingsCount,
        revenue: totalRevenue
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/test - simple test endpoint
router.get("/test", adminProtect, async (req, res) => {
  try {
    return res.status(200).json({
      message: "Admin API is working correctly",
      timestamp: new Date().toISOString(),
      admin: req.admin ? { id: req.admin._id, email: req.admin.email } : null
    });
  } catch (error) {
    console.error("Admin test error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/admin/users - list basic user info for admin management
router.get("/users", adminProtect, async (req, res) => {
  try {
    const users = await User.find({}, "name email phone createdAt").sort({ createdAt: -1 }).limit(500);
    return res.status(200).json({ users });
  } catch (error) {
    console.error("Admin users list error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

// POST /api/admin/mechanics/createAccount - create mechanic login (admin only)
router.post("/mechanics/createAccount", adminProtect, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ message: "Name and password are required" });
    }
    // Create a unique mechanicId (e.g., MCH-YYYYMMDD-XXXX)
    const datePart = new Date().toISOString().slice(0,10).replace(/-/g,"");
    let mechanicId;
    while (true) {
      const rand = Math.random().toString(36).slice(2,6).toUpperCase();
      mechanicId = `MCH-${datePart}-${rand}`;
      const exists = await User.findOne({ mechanicId });
      if (!exists) break;
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'mechanic',
      mechanicId,
      mustChangePassword: true
    });

    return res.status(201).json({
      mechanic: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        mechanicId: user.mechanicId,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Create mechanic account error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});