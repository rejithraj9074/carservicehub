import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import admin from "../config/firebaseAdmin.js";

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// POST /api/auth/firebase/google - Handle Firebase Google authentication (login and registration)
router.post("/firebase/google", async (req, res) => {
  try {
    // Check if Firebase Admin is available
    if (global.firebaseAdminMock) {
      return res.status(500).json({ 
        message: "Firebase Admin not configured properly. Google Sign-In is not available.",
        error: "Firebase Admin initialization failed. Please contact system administrator."
      });
    }

    const { idToken, role, phone } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "ID token is required" });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      // Force role to 'customer' for Google sign-ups for security
      const password = crypto.randomBytes(20).toString("hex"); // Generate random password
      user = await User.create({
        name,
        email,
        password, // This will be hashed by the pre-save middleware
        role: 'customer', // Always set to customer for Google sign-ups
        phone: phone || undefined // Use phone number if provided
      });
    } else {
      // For existing users, ensure they remain as customers for Google sign-ins
      // This prevents privilege escalation through Google sign-in
      if (user.role !== 'customer') {
        // If existing user is not a customer, we still allow them to sign in
        // but we don't change their role
        console.log(`User ${email} is signing in with Google but has ${user.role} role`);
      }
      
      // Update phone number if provided and not already set
      if (phone && !user.phone) {
        user.phone = phone;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, // This will always be 'customer' for new Google sign-ups
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Firebase Google auth error:", error);
    return res.status(500).json({ 
      message: "Authentication failed: " + error.message,
      error: error.message
    });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Explicitly set role to 'customer' for all registrations
    // This ensures only customers can register through this endpoint
    const user = await User.create({ 
      name, 
      email, 
      password,
      role: 'customer' // Enforce customer role for all registrations
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        createdAt: user.createdAt
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If a role is specified, check that the user has that role
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid credentials for ${role}. You are registered as a ${user.role}.` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        createdAt: user.createdAt
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/mechanic/login - mechanic login with mechanicId + password
router.post('/mechanic/login', async (req, res) => {
  try {
    const { mechanicId, password } = req.body;
    if (!mechanicId || !password) return res.status(400).json({ message: 'Mechanic ID and password are required' });

    const user = await User.findOne({ mechanicId, role: 'mechanic' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        mechanicId: user.mechanicId,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt
      },
      token,
    });
  } catch (error) {
    console.error('Mechanic login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/mechanic/change-password
router.put('/mechanic/change-password', protect, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'mechanic') {
      return res.status(403).json({ message: 'Only mechanics can change password here' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Mechanic change password error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      role,
      address,
      city,
      state,
      zipCode,
      dateOfBirth,
      emergencyContact,
      emergencyPhone,
    } = req.body;

    // Check if email is being changed and if it's already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone,
        role: role || req.user.role,
        address: address || req.user.address,
        city: city || req.user.city,
        state: state || req.user.state,
        zipCode: zipCode || req.user.zipCode,
        dateOfBirth: dateOfBirth || req.user.dateOfBirth,
        emergencyContact: emergencyContact || req.user.emergencyContact,
        emergencyPhone: emergencyPhone || req.user.emergencyPhone,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        zipCode: updatedUser.zipCode,
        dateOfBirth: updatedUser.dateOfBirth,
        emergencyContact: updatedUser.emergencyContact,
        emergencyPhone: updatedUser.emergencyPhone,
        createdAt: updatedUser.createdAt,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/profile - Get user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        dateOfBirth: user.dateOfBirth,
        emergencyContact: user.emergencyContact,
        emergencyPhone: user.emergencyPhone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;

// Google OAuth 2.0 endpoints
// Environment variables required:
// GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, FRONTEND_URL

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI; // e.g. http://localhost:5000/api/auth/google/callback
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// GET /api/auth/google/start
router.get("/google/start", async (req, res) => {
  try {
    if (!googleClientId || !googleRedirectUri) {
      return res.status(500).json({ message: "Google OAuth is not configured" });
    }
    // Generate auth URL without requiring client secret at this step
    const base = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: googleRedirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    });
    const url = `${base}?${params.toString()}`;
    return res.redirect(url);
  } catch (e) {
    console.error("Google start error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/google/callback
router.get("/google/callback", async (req, res) => {
  try {
    if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
      return res.status(500).send("Google OAuth is not configured");
    }
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");

    const client = new OAuth2Client({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      redirectUri: googleRedirectUri,
    });

    const { tokens } = await client.getToken(code);
    const accessToken = tokens.access_token;
    if (!accessToken) return res.status(400).send("Failed to get access token");

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await profileRes.json();
    const { email, name, sub } = profile;
    if (!email) return res.status(400).send("Google profile missing email");

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: crypto.randomBytes(16).toString("hex"),
        role: "customer",
      });
    }

    const token = generateToken(user._id);
    // Redirect back to frontend with token
    const redirectTo = `${frontendUrl}/login?token=${encodeURIComponent(token)}`;
    return res.redirect(redirectTo);
  } catch (e) {
    console.error("Google callback error:", e);
    return res.status(500).send("Authentication failed");
  }
});



