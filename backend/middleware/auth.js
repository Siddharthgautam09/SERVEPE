const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    console.log('Auth middleware - Headers:', req.headers.authorization);

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('Auth middleware - Token received:', token.substring(0, 20) + '...');

    // Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('Auth middleware - JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error.'
      });
    }

    // Basic token format validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Auth middleware - Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - Token decoded successfully:', decoded);
    } catch (jwtError) {
      console.error('Auth middleware - JWT verification error:', jwtError.message);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token verification failed.'
        });
      }
    }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    if (!user.isActive) {
      console.log('Auth middleware - User account deactivated:', user._id);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated.'
      });
    }

    console.log('Auth middleware - User authenticated successfully:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

exports.checkProjectOwnership = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Allow access if user is the client, assigned freelancer, or admin
    if (
      project.client.toString() !== req.user.id &&
      (project.freelancer && project.freelancer.toString() !== req.user.id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access this project.'
      });
    }

    req.project = project;
    next();
  } catch (error) {
    console.error('Project ownership middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
