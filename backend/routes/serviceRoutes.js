
const express = require('express');
const {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
  getMyServices,
  uploadServiceImages,
  getServiceAnalytics
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/services/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Enhanced validation middleware for service creation
const validateService = (req, res, next) => {
  const { title, description, category } = req.body;
  
  // Check required fields
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Title is required and cannot be empty'
    });
  }
  
  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Description is required and cannot be empty'
    });
  }
  
  if (!category || category.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Category is required and cannot be empty'
    });
  }
  
  // Validate title length
  if (title.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Title must be less than 100 characters'
    });
  }
  
  // Validate description length
  if (description.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Description must be less than 5000 characters'
    });
  }
  
  next();
};

// Validate service ID parameter
const validateServiceId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || id.length !== 24) {
    return res.status(400).json({
      success: false,
      message: 'Invalid service ID format'
    });
  }
  
  next();
};

// Handle multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB per file.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(err);
};

// Public routes
router.get('/', getAllServices);
router.get('/:id', validateServiceId, getService);

// Protected routes - apply protect middleware
router.use(protect);

// Freelancer routes
router.get('/my/services', restrictTo('freelancer'), getMyServices);
router.post('/', 
  restrictTo('freelancer'), 
  upload.array('images', 5), 
  handleMulterErrors,
  validateService, 
  createService
);
router.put('/:id', 
  restrictTo('freelancer'), 
  validateServiceId,
  updateService
);
router.delete('/:id', 
  restrictTo('freelancer'), 
  validateServiceId,
  deleteService
);
router.post('/:id/images', 
  restrictTo('freelancer'), 
  validateServiceId,
  upload.array('images', 5), 
  handleMulterErrors,
  uploadServiceImages
);
router.get('/:id/analytics', 
  restrictTo('freelancer'), 
  validateServiceId,
  getServiceAnalytics
);

module.exports = router;
