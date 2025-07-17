const express = require('express');
const {
  updateProfile,
  getProfile,
  uploadProfilePicture,
  getFreelancerProfile,
  updateFreelancerProfile,
  getUserByUsername
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

// Public routes
router.get('/profile/:username', getFreelancerProfile);
router.get('/:username', getUserByUsername); // New username-based profile route

// Search users by username (public endpoint similar to Instagram/Facebook)
router.get('/search/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 2 characters long'
      });
    }

    // Search for users with similar usernames
    const users = await User.find({
      username: { $regex: username, $options: 'i' },
      isActive: true,
      username: { $exists: true, $ne: null }
    })
    .select('firstName lastName username profilePicture role')
    .limit(10);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users'
    });
  }
});

// Check username availability
router.get('/check-username/:username', protect, async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username must be at least 3 characters long'
      });
    }

    const existingUser = await User.findOne({ 
      username: username.toLowerCase(),
      _id: { $ne: req.user.id } // Exclude current user
    });

    res.json({
      success: true,
      available: !existingUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking username availability'
    });
  }
});

// Get all freelancers
router.get('/freelancers', async (req, res) => {
  try {
    const { skills, category, rating, search, sort = 'rating' } = req.query;
    
    const filter = { 
      role: 'freelancer',
      isActive: true,
      requirementsCompleted: true
    };
    
    if (skills) {
      filter['skills.name'] = { $in: skills.split(',') };
    }
    
    if (rating) {
      filter['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { 'skills.name': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    let sortQuery = {};
    switch (sort) {
      case 'rating':
        sortQuery = { 'rating.average': -1 };
        break;
      case 'hourlyRate':
        sortQuery = { hourlyRate: 1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { 'rating.average': -1 };
    }

    const freelancers = await User.find(filter)
      .select('firstName lastName username profilePicture bio skills hourlyRate location rating')
      .sort(sortQuery)
      .limit(50);

    res.json({
      success: true,
      data: freelancers
    });
  } catch (error) {
    console.error('Get freelancers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching freelancers'
    });
  }
});

// Protected routes
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/picture', upload.single('profilePicture'), uploadProfilePicture);
router.put('/freelancer-profile', updateFreelancerProfile);

module.exports = router;