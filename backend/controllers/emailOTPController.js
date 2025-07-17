const User = require('../models/User');
const EmailOTPService = require('../utils/emailOTPService');
const UserService = require('../utils/userService');
const jwt = require('jsonwebtoken');

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// @desc    Send Email OTP
// @route   POST /api/auth/send-email-otp
// @access  Public
const sendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    const otpData = {
      otp,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };
    
    otpStore.set(email, otpData);

    // Send OTP via email
    await EmailOTPService.sendOTP(email, otp);

    console.log(`OTP sent to ${email}: ${otp}`); // Remove in production

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    console.error('Send Email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.'
    });
  }
};

// @desc    Verify Email OTP and login/register
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Get stored OTP data
    const otpData = otpStore.get(email);
    
    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new one.'
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Check attempt limit
    if (otpData.attempts >= 3) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      otpData.attempts += 1;
      otpStore.set(email, otpData);
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining.`
      });
    }

    // OTP is valid, remove from store
    otpStore.delete(email);

    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user - don't set role, let user select it later
      const emailParts = email.split('@');
      const firstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
      
      user = await User.create({
        firstName,
        lastName: 'User',
        email,
        authProvider: 'email',
        isVerified: true,
        roleSelected: false
        // Note: We don't set role here, it will remain undefined until user selects it
      });
    } else {
      // Update existing user
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = UserService.generateToken(user._id);

    // Format user response
    const userResponse = UserService.formatUserResponse(user);

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: user.isNew ? 'Account created successfully' : 'Login successful'
    });

  } catch (error) {
    console.error('Verify Email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    });
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-email-otp
// @access  Public
const resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if there's a recent OTP request (rate limiting)
    const existingOTP = otpStore.get(email);
    if (existingOTP && (Date.now() - (existingOTP.expiresAt - 5 * 60 * 1000)) < 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'Please wait before requesting another OTP'
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store new OTP
    const otpData = {
      otp,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    };
    
    otpStore.set(email, otpData);

    // Send OTP via email
    await EmailOTPService.sendOTP(email, otp);

    console.log(`OTP resent to ${email}: ${otp}`); // Remove in production

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Resend Email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
};

module.exports = {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP
};