const User = require('../models/User');
const OTPService = require('../utils/otpService');
const GoogleAuthService = require('../utils/googleAuthService');
const UserService = require('../utils/userService');
const axios = require('axios');

// Initialize Google Auth Service with better error handling
let googleAuthService;
try {
  googleAuthService = new GoogleAuthService();
  console.log('Google Auth Service initialized successfully');
} catch (error) {
  console.error('Failed to initialize Google Auth Service:', error.message);
  console.warn('Google authentication will not be available');
  googleAuthService = null;
}

// Admin phone number
const ADMIN_PHONE_NUMBER = '+918789601387';

// Send OTP using OTPless
exports.sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const cleanPhone = OTPService.validatePhoneNumber(phoneNumber);
    const result = await OTPService.sendOTP(cleanPhone);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        orderId: result.orderId
      }
    });
  } catch (error) {
    console.error('OTP sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
      error: error.message
    });
  }
};

// Verify OTP and login/register user
exports.verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp, orderId } = req.body;

    if (!phoneNumber || !otp || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and order ID are required'
      });
    }

    const cleanPhone = OTPService.validatePhoneNumber(phoneNumber);
    
    const otpResult = await OTPService.verifyOTP(cleanPhone, otp, orderId);
    
    // Check if this is admin phone number
    const isAdmin = cleanPhone === ADMIN_PHONE_NUMBER;
    
    // Find user by phone number
    let user = await User.findOne({ phoneNumber: cleanPhone });
    
    if (!user) {
      try {
        // Create new user - ensure we don't set email field to avoid null conflicts
        const userData = {
          firstName: isAdmin ? 'Admin' : 'User',
          lastName: isAdmin ? 'User' : 'Name',
          phoneNumber: cleanPhone,
          authProvider: 'otpless',
          otplessUserId: otpResult.userId || cleanPhone,
          isVerified: true,
          role: isAdmin ? 'admin' : 'client',
          roleSelected: isAdmin ? true : false
        };
        
        user = await User.create(userData);
      } catch (createError) {
        // Handle duplicate key error
        if (createError.code === 11000) {
          console.log('User creation failed due to duplicate key, attempting to find existing user...');
          
          // Try to find user by phone number again
          user = await User.findOne({ phoneNumber: cleanPhone });
          
          // If still not found, try to find by otplessUserId
          if (!user) {
            user = await User.findOne({ otplessUserId: otpResult.userId || cleanPhone });
          }
          
          // If still not found, return error
          if (!user) {
            return res.status(500).json({
              success: false,
              message: 'Error creating or finding user account'
            });
          }
        } else {
          throw createError;
        }
      }
    } else {
      // Update existing user
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
        user.roleSelected = true;
      } else if (!user.role) {
        user.role = 'client';
      }
      
      user.lastLogin = new Date();
      await user.save();
    }

    const token = UserService.generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: UserService.formatUserResponse(user)
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'OTP verification failed',
      error: error.message
    });
  }
};

// Google OAuth login with enhanced error handling
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    // Check if Google Auth Service is available
    if (!googleAuthService) {
      return res.status(500).json({
        success: false,
        message: 'Google authentication is not configured on the server. Please check GOOGLE_WEB_CLIENT_ID environment variable.'
      });
    }

    console.log('Processing Google login with token...');
    const googleUser = await googleAuthService.verifyIdToken(idToken);
    console.log('Google user verified:', { email: googleUser.email, id: googleUser.id });
    
    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ]
    });

    if (!user) {
      console.log('Creating new user from Google login');
      // Create new user - first time login, set default role as client
      user = await User.create({
        firstName: googleUser.given_name || 'User',
        lastName: googleUser.family_name || 'Name',
        email: googleUser.email,
        profilePicture: googleUser.picture,
        authProvider: 'google',
        googleId: googleUser.id,
        isVerified: googleUser.email_verified || true,
        role: 'client', // Set default role as client instead of null
        roleSelected: false // User needs to select role
      });
      console.log('New user created:', user._id);
    } else {
      console.log('Existing user found:', user._id);
      // Update user info if needed
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      if (!user.profilePicture && googleUser.picture) {
        user.profilePicture = googleUser.picture;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    const token = UserService.generateToken(user._id);
    console.log('Google login successful for user:', user._id);

    res.status(200).json({
      success: true,
      token,
      user: UserService.formatUserResponse(user)
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google login failed',
      error: error.message
    });
  }
};

// Google OAuth flow handler with improved error handling and port configuration
exports.googleOAuth = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    console.log('=== Google OAuth Backend Processing ===');
    console.log('Code received (first 20 chars):', code.substring(0, 20) + '...');
    console.log('Redirect URI:', redirectUri);

    // Get Google credentials from environment with fallback
    const googleClientId = process.env.GOOGLE_WEB_CLIENT_ID || 
                          process.env.GOOGLE_CLIENT_ID || 
                          '10698272202-emghd3gee0eb8f548rjmush3ekfo8fc6.apps.googleusercontent.com';
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    console.log('Google Client ID:', googleClientId ? googleClientId.substring(0, 20) + '...' : 'NOT SET');
    console.log('Google Client Secret available:', !!googleClientSecret);

    if (!googleClientSecret) {
      console.warn('GOOGLE_CLIENT_SECRET not found in environment variables');
      console.log('Available Google env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
      console.log('Attempting OAuth without client secret for public client...');
    }

    // Exchange code for tokens
    const tokenRequestData = {
      client_id: googleClientId,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri || 'http://localhost:8081/otp-login'
    };

    // Only add client_secret if it's available
    if (googleClientSecret) {
      tokenRequestData.client_secret = googleClientSecret;
    }

    console.log('Token exchange request:', {
      client_id: tokenRequestData.client_id ? tokenRequestData.client_id.substring(0, 20) + '...' : 'NOT SET',
      redirect_uri: tokenRequestData.redirect_uri,
      has_client_secret: !!tokenRequestData.client_secret,
      grant_type: tokenRequestData.grant_type
    });

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', tokenRequestData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Token exchange successful');
    const { access_token, id_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('No access token received from Google');
    }

    // Get user info from Google
    console.log('Fetching user info from Google...');
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const googleUser = userResponse.data;
    console.log('Google user info received:', { 
      email: googleUser.email, 
      id: googleUser.id,
      verified_email: googleUser.verified_email 
    });

    // Find or create user in database
    let user = await User.findOne({ 
      $or: [
        { googleId: googleUser.id },
        { email: googleUser.email }
      ]
    });

    if (!user) {
      console.log('Creating new user from Google OAuth');
      // Create new user - first time login, set default role as client
      user = await User.create({
        firstName: googleUser.given_name || 'User',
        lastName: googleUser.family_name || 'Name',
        email: googleUser.email,
        profilePicture: googleUser.picture,
        authProvider: 'google',
        googleId: googleUser.id,
        isVerified: googleUser.verified_email || true,
        role: 'client', // Set default role as client instead of null
        roleSelected: false // User needs to select role
      });
      console.log('New user created:', user._id);
    } else {
      console.log('Existing user found:', user._id);
      // Update user info if needed
      if (!user.googleId) {
        user.googleId = googleUser.id;
      }
      if (!user.profilePicture && googleUser.picture) {
        user.profilePicture = googleUser.picture;
      }
      user.lastLogin = new Date();
      await user.save();
    }

    const token = UserService.generateToken(user._id);
    console.log('Google OAuth successful for user:', user._id);

    res.status(200).json({
      success: true,
      token,
      user: UserService.formatUserResponse(user)
    });
  } catch (error) {
    console.error('Google OAuth error details:', error);
    
    // More detailed error handling
    if (error.response) {
      console.error('Google API error response:', error.response.data);
      console.error('Google API error status:', error.response.status);
      
      return res.status(500).json({
        success: false,
        message: `Google OAuth failed: ${error.response.data.error_description || error.response.data.error || 'Unknown error'}`,
        error: error.response.data
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Google OAuth failed',
      error: error.message
    });
  }
};

// Select user role
exports.selectRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    const user = await UserService.updateUserRole(userId, role);

    res.status(200).json({
      success: true,
      user: UserService.formatUserResponse(user)
    });
  } catch (error) {
    console.error('Role selection error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to select role',
      error: error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: UserService.formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

module.exports = {
  sendOTP: exports.sendOTP,
  verifyOTP: exports.verifyOTP,
  googleLogin: exports.googleLogin,
  googleOAuth: exports.googleOAuth,
  selectRole: exports.selectRole,
  getMe: exports.getMe
};