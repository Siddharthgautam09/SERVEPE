const User = require('../models/User');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Review = require('../models/Review');
const path = require('path');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// Get user profile by username (public endpoint)
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const user = await User.findOne({ 
      username: username.toLowerCase(),
      isActive: true 
    }).select('-password -email -phoneNumber -whatsappNumber'); // skills is NOT excluded, so it will be included

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If it's a freelancer, get additional data
    let additionalData = {};
    if (user.role === 'freelancer') {
      // Get freelancer's services
      const services = await Service.find({ 
        freelancer: user._id, 
        status: 'active' 
      }).populate('category', 'name').limit(10);

      // Get freelancer's reviews
      const reviews = await Review.find({ freelancer: user._id })
        .populate('client', 'firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .limit(10);

      // Calculate rating
      const ratingStats = await Review.aggregate([
        { $match: { freelancer: user._id } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      const rating = ratingStats.length > 0 ? {
        average: Math.round(ratingStats[0].averageRating * 10) / 10,
        count: ratingStats[0].totalReviews
      } : { average: 0, count: 0 };

      additionalData = {
        services,
        reviews,
        rating
      };
    }

    res.status(200).json({
      success: true,
      data: {
        user: { ...user.toObject(), ...additionalData.rating && { rating: additionalData.rating } },
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Get freelancer public profile by username (legacy endpoint)
exports.getFreelancerProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ 
      username, 
      role: 'freelancer',
      isActive: true 
    }).select('-password -email -phoneNumber');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer not found'
      });
    }

    // Get freelancer's services
    const services = await Service.find({ 
      freelancer: user._id, 
      status: 'active' 
    }).populate('category', 'name');

    // Get freelancer's reviews
    const reviews = await Review.find({ freelancer: user._id })
      .populate('client', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate rating
    const ratingStats = await Review.aggregate([
      { $match: { freelancer: user._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const rating = ratingStats.length > 0 ? {
      average: Math.round(ratingStats[0].averageRating * 10) / 10,
      count: ratingStats[0].totalRevivers
    } : { average: 0, count: 0 };

    res.status(200).json({
      success: true,
      data: {
        user: { ...user.toObject(), rating },
        services,
        reviews
      }
    });
  } catch (error) {
    console.error('Get freelancer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancer profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'firstName', 'lastName', 'username', 'bio', 'location', 'skills', 
      'experience', 'education', 'portfolio', 'hourlyRate',
      'title', 'tagline', 'expertise', 'totalExperienceYears', 'companyBrand',
      'socialLinks', 'whatsappNumber'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'username' && req.body[key]) {
          updates[key] = req.body[key].toLowerCase();
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Check if username is being updated and if it's available
    if (updates.username) {
      const existingUser = await User.findOne({ 
        username: updates.username,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const profilePictureUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: profilePictureUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture'
    });
  }
};

// Enhanced freelancer profile update
exports.updateFreelancerProfile = async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({
        success: false,
        message: 'Only freelancers can update freelancer profile'
      });
    }

    const freelancerFields = [
      'title', 'tagline', 'hourlyRate', 'skills', 'expertise', 'portfolio', 
      'bio', 'experience', 'totalExperienceYears', 'companyBrand', 
      'socialLinks', 'education', 'location'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (freelancerFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
      message: 'Freelancer profile updated successfully'
    });
  } catch (error) {
    console.error('Update freelancer profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating freelancer profile'
    });
  }
};