const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      roleSelected: user.roleSelected,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      isVerified: user.isVerified,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      authProvider: 'email'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// @desc    Admin login
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // For demo purposes - in production, store admin credentials securely
    const adminCredentials = {
      username: 'admin',
      password: 'admin123'
    };

    if (username !== adminCredentials.username || password !== adminCredentials.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Try to find existing admin user first
    let adminUser = await User.findOne({ 
      $or: [
        { email: 'admin@freelanceplatform.com' },
        { username: 'admin' }
      ]
    });
    
    if (!adminUser) {
      try {
        // Create admin user with unique email and username
        adminUser = await User.create({
          firstName: 'System',
          lastName: 'Administrator',
          username: 'admin',
          email: 'admin@freelanceplatform.com',
          role: 'admin',
          roleSelected: true,
          authProvider: 'email',
          requirementsCompleted: true,
          isVerified: true
        });
      } catch (createError) {
        // If creation fails due to duplicate key, try to find the user again
        if (createError.code === 11000) {
          console.log('Admin user creation failed due to duplicate key, attempting to find existing user...');
          
          adminUser = await User.findOne({ 
            $or: [
              { email: 'admin@freelanceplatform.com' },
              { username: 'admin' },
              { role: 'admin' }
            ]
          });
          
          if (!adminUser) {
            return res.status(500).json({
              success: false,
              message: 'Error creating or finding admin user'
            });
          }
        } else {
          throw createError;
        }
      }
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save();

    sendTokenResponse(adminUser, 200, res);
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in as admin'
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Public
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      phoneNumber: req.body.phoneNumber,
      whatsappNumber: req.body.whatsappNumber,
      bio: req.body.bio,
      location: req.body.location,
      skills: req.body.skills,
      hourlyRate: req.body.hourlyRate,
      portfolio: req.body.portfolio,
      experience: req.body.experience,
      education: req.body.education
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => {
      if (fieldsToUpdate[key] === undefined) {
        delete fieldsToUpdate[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// @desc    Update user requirements
// @route   PUT /api/auth/requirements
// @access  Private
const updateRequirements = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        requirements: req.body.requirements,
        requirementsCompleted: true
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update requirements error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  updateProfile,
  changePassword,
  updateRequirements
};
