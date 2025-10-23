import User from "../models/User.js";
import Mechanic from "../models/Mechanic.js";
import Booking from "../models/Booking.js";

const generateUniqueMechanicId = async () => {
  const datePart = new Date().toISOString().slice(0,10).replace(/-/g, "");
  let mechanicId;
  // Try until we find a unique id
  // In practice, this loop will exit quickly
  // because the random component has good entropy
  while (true) {
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    mechanicId = `MCH-${datePart}-${rand}`;
    const exists = await User.findOne({ mechanicId });
    if (!exists) break;
  }
  return mechanicId;
};

// POST /api/admin/mechanics
// Create mechanic user account (if needed) and mechanic profile with skills
export const createMechanicByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      experience,
      hourlyRate,
      serviceArea,
      bio,
      certifications
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    if (!Array.isArray(specialization) || specialization.length === 0) {
      return res.status(400).json({ message: "At least one specialization is required" });
    }
    if (experience === undefined || hourlyRate === undefined || !Array.isArray(serviceArea) || serviceArea.length === 0) {
      return res.status(400).json({ message: "experience, hourlyRate and serviceArea are required" });
    }

    // Validate specialization against enum list
    const allowedSpecializations = Mechanic.schema.path('specialization').caster.enumValues;
    const invalidSpecs = specialization.filter(s => !allowedSpecializations.includes(s));
    if (invalidSpecs.length > 0) {
      return res.status(400).json({
        message: "Invalid specialization provided",
        invalid: invalidSpecs,
        allowed: allowedSpecializations,
      });
    }

    // Find or create the mechanic user
    let user = await User.findOne({ email });

    if (!user) {
      const mechanicId = await generateUniqueMechanicId();
      user = await User.create({
        name,
        email,
        phone,
        password: password || Math.random().toString(36).slice(2,10),
        role: "mechanic",
        mechanicId,
        mustChangePassword: true,
      });
    } else {
      // Ensure the found user is a mechanic; if not, convert
      if (user.role !== "mechanic") {
        user.role = "mechanic";
      }
      if (!user.mechanicId) {
        user.mechanicId = await generateUniqueMechanicId();
        user.mustChangePassword = true;
      }
      // Optionally update name/phone
      if (name) user.name = name;
      if (phone) user.phone = phone;
      await user.save();
    }

    // Check if mechanic profile already exists
    const existingProfile = await Mechanic.findOne({ user: user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Mechanic profile already exists for this user" });
    }

    const mechanic = await Mechanic.create({
      user: user._id,
      specialization,
      experience,
      hourlyRate,
      serviceArea,
      bio,
      certifications,
    });

    await mechanic.populate("user", "name email phone role mechanicId");

    return res.status(201).json({
      message: "Mechanic created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        mechanicId: user.mechanicId,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
      },
      mechanic,
    });
  } catch (error) {
    console.error("Admin create mechanic error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/mechanics
export const listMechanicsByAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      serviceArea,
      minRating,
      isActive,
    } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";
    if (specialization) query.specialization = { $in: specialization.split(",") };
    if (serviceArea) query.serviceArea = { $in: serviceArea.split(",") };
    if (minRating) query["rating.average"] = { $gte: parseFloat(minRating) };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [items, total] = await Promise.all([
      Mechanic.find(query)
        .populate("user", "name email phone role mechanicId")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Mechanic.countDocuments(query),
    ]);

    return res.status(200).json({
      mechanics: items,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalMechanics: total,
      },
    });
  } catch (error) {
    console.error("Admin list mechanics error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/mechanics/:id
export const getMechanicByAdmin = async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id)
      .populate("user", "name email phone role mechanicId");
    if (!mechanic) return res.status(404).json({ message: "Mechanic not found" });
    return res.status(200).json({ mechanic });
  } catch (error) {
    console.error("Admin get mechanic error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/admin/mechanics/:id
export const updateMechanicByAdmin = async (req, res) => {
  try {
    const { name, email, phone, specialization, experience, hourlyRate, availability, serviceArea, bio, certifications, isActive } = req.body;

    const mechanic = await Mechanic.findById(req.params.id).populate("user");
    if (!mechanic) return res.status(404).json({ message: "Mechanic not found" });

    // Update user fields if provided
    const user = mechanic.user;
    let userUpdated = false;
    if (name !== undefined) { user.name = name; userUpdated = true; }
    if (phone !== undefined) { user.phone = phone; userUpdated = true; }
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) return res.status(409).json({ message: "Email already in use" });
      user.email = email;
      userUpdated = true;
    }
    if (userUpdated) await user.save();

    // Update mechanic profile
    const updates = {};
    if (specialization !== undefined) updates.specialization = specialization;
    if (experience !== undefined) updates.experience = experience;
    if (hourlyRate !== undefined) updates.hourlyRate = hourlyRate;
    if (availability !== undefined) updates.availability = availability;
    if (serviceArea !== undefined) updates.serviceArea = serviceArea;
    if (bio !== undefined) updates.bio = bio;
    if (certifications !== undefined) updates.certifications = certifications;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedMechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("user", "name email phone role mechanicId");

    return res.status(200).json({ message: "Mechanic updated", mechanic: updatedMechanic });
  } catch (error) {
    console.error("Admin update mechanic error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/admin/mechanics/:id
export const deleteMechanicByAdmin = async (req, res) => {
  try {
    const { hard } = req.query; // hard=true to also delete the user account

    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) return res.status(404).json({ message: "Mechanic not found" });

    // Prevent deletion if there are active bookings
    const activeBookings = await Booking.countDocuments({
      mechanic: req.params.id,
      status: { $in: ["pending", "confirmed", "in_progress"] },
    });
    if (activeBookings > 0) {
      return res.status(400).json({
        message: "Cannot delete mechanic with active bookings. Complete or cancel bookings first.",
      });
    }

    const userId = mechanic.user;

    await Mechanic.findByIdAndDelete(req.params.id);

    if (hard === "true" && userId) {
      // Optional: instead of deleting, you could downgrade role or flag account
      await User.findByIdAndDelete(userId);
    }

    return res.status(200).json({ message: "Mechanic deleted" });
  } catch (error) {
    console.error("Admin delete mechanic error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/admin/mechanics/stats
export const getMechanicStats = async (req, res) => {
  try {
    console.log('Fetching mechanic stats...');
    
    // Total mechanics
    const total = await Mechanic.countDocuments();
    console.log('Total mechanics:', total);
    
    // Active mechanics
    const active = await Mechanic.countDocuments({ isActive: true });
    console.log('Active mechanics:', active);
    
    // Inactive mechanics
    const inactive = total - active;
    console.log('Inactive mechanics:', inactive);
    
    // Mechanics by specialization
    const specializationStats = await Mechanic.aggregate([
      { $unwind: '$specialization' },
      { $group: { _id: '$specialization', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Specialization stats:', specializationStats);
    
    // Mechanics by service area
    const serviceAreaStats = await Mechanic.aggregate([
      { $unwind: '$serviceArea' },
      { $group: { _id: '$serviceArea', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('Service area stats:', serviceAreaStats);
    
    // Average rating
    const avgRatingResult = await Mechanic.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
    ]);
    const avgRating = avgRatingResult[0]?.avgRating || 0;
    console.log('Average rating:', avgRating);
    
    // Top rated mechanics
    const topRated = await Mechanic.find({ isActive: true })
      .sort({ 'rating.average': -1 })
      .limit(5)
      .populate('user', 'name email');
    
    console.log('Top rated mechanics:', topRated);
    
    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        avgRating: avgRating.toFixed(1),
        specializationStats,
        serviceAreaStats,
        topRated: topRated.map(m => ({
          id: m._id,
          name: m.user?.name || 'Unknown',
          email: m.user?.email || 'N/A',
          averageRating: m.rating?.average || 0,
          totalReviews: m.rating?.count || 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching mechanic stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mechanic statistics',
      error: error.message
    });
  }
};
