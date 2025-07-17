
const { body, validationResult } = require('express-validator');

// Handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation
exports.validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['client', 'freelancer'])
    .withMessage('Role must be either client or freelancer')
];

// Login validation
exports.validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Project validation
exports.validateProject = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Title must be between 10 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be between 50 and 5000 characters'),
  body('category')
    .isIn(['web-development', 'mobile-development', 'design', 'writing', 'marketing', 'data-science', 'consulting', 'other'])
    .withMessage('Invalid category'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('budget.type')
    .isIn(['fixed', 'hourly'])
    .withMessage('Budget type must be fixed or hourly'),
  body('duration')
    .isIn(['less-than-1-month', '1-3-months', '3-6-months', 'more-than-6-months'])
    .withMessage('Invalid duration'),
  body('experienceLevel')
    .isIn(['entry', 'intermediate', 'expert'])
    .withMessage('Invalid experience level')
];
