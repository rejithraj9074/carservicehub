import InterestedCar from '../models/InterestedCar.js';
import CarListing from '../models/CarListing.js';
import User from '../models/User.js';

// Toggle user interest in a car
export const toggleInterest = async (req, res) => {
  try {
    const { carId } = req.body;
    const userId = req.user._id;

    // Check if interest already exists
    const existingInterest = await InterestedCar.findOne({ userId, carId });

    if (existingInterest) {
      // Remove interest
      await InterestedCar.deleteOne({ userId, carId });
      return res.json({
        success: true,
        message: 'Interest removed successfully',
        interested: false
      });
    } else {
      // Add interest
      const newInterest = new InterestedCar({ userId, carId });
      await newInterest.save();
      return res.json({
        success: true,
        message: 'Interest added successfully',
        interested: true
      });
    }
  } catch (error) {
    console.error('Error toggling interest:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle interest',
      error: error.message
    });
  }
};

// Get all interested users for a specific car
export const getInterestedByCar = async (req, res) => {
  try {
    const { carId } = req.params;

    const interestedUsers = await InterestedCar.find({ carId })
      .populate({
        path: 'userId',
        select: 'name email phone'
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: interestedUsers,
      count: interestedUsers.length
    });
  } catch (error) {
    console.error('Error fetching interested users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interested users',
      error: error.message
    });
  }
};

// Get all interests for admin dashboard (grouped by car with counts)
export const getAllInterests = async (req, res) => {
  try {
    // Aggregate to get cars with interest counts
    const interests = await InterestedCar.aggregate([
      {
        $group: {
          _id: '$carId',
          count: { $sum: 1 },
          users: { $push: '$userId' },
          latestInterest: { $max: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'carlistings',
          localField: '_id',
          foreignField: '_id',
          as: 'carDetails'
        }
      },
      {
        $unwind: '$carDetails'
      },
      {
        $project: {
          carId: '$_id',
          title: '$carDetails.title',
          brand: '$carDetails.brand',
          model: '$carDetails.model',
          year: '$carDetails.year',
          price: '$carDetails.price',
          image: { $arrayElemAt: ['$carDetails.images', 0] },
          count: 1,
          latestInterest: 1
        }
      },
      {
        $sort: { count: -1, latestInterest: -1 }
      }
    ]);

    return res.json({
      success: true,
      data: interests
    });
  } catch (error) {
    console.error('Error fetching all interests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interests',
      error: error.message
    });
  }
};

// Get all interested cars for a specific user
export const getInterestedByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const interestedCars = await InterestedCar.find({ userId })
      .populate({
        path: 'carId',
        select: 'title brand model year price images'
      })
      .sort({ createdAt: -1 });

    // Format the response to include car details directly
    const cars = interestedCars.map(interest => ({
      _id: interest._id,
      carId: interest.carId._id,
      title: interest.carId.title,
      brand: interest.carId.brand,
      model: interest.carId.model,
      year: interest.carId.year,
      price: interest.carId.price,
      image: interest.carId.images?.[0] || null,
      createdAt: interest.createdAt
    }));

    return res.json({
      success: true,
      data: cars,
      count: cars.length
    });
  } catch (error) {
    console.error('Error fetching user interests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user interests',
      error: error.message
    });
  }
};