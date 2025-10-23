import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // For testing purposes, create a mock user if database is not connected
      if (mongoose.connection.readyState !== 1) {
        console.log('Database not connected, using mock user for testing');
        req.user = {
          id: decoded.id || 'mock_user_id',
          name: 'Test User',
          email: 'test@example.com',
          role: decoded.role || 'customer',
        };
        return next();
      }
      
      // Support both User and Admin tokens. Admin tokens embed role: 'admin'.
      if (decoded.role === 'admin') {
        const admin = await Admin.findById(decoded.id).select("-password");
        if (!admin) {
          return res.status(401).json({ message: "Not authorized, admin not found" });
        }
        // Normalize to req.user with a minimal shape expected by downstream code
        req.user = {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: 'admin',
        };
      } else {
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
          return res.status(401).json({ message: "Not authorized, user not found" });
        }
        req.user = user;
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to check if user is admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Middleware to check if user is mechanic
export const mechanic = (req, res, next) => {
  if (req.user && req.user.role === 'mechanic') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a mechanic' });
  }
};

// Middleware to check if user is customer
export const customer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a customer' });
  }
};
