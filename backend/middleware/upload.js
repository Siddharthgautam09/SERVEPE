
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Storage configuration for local file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    console.log('Multer destination - fieldname:', file.fieldname);
    console.log('Multer destination - originalname:', file.originalname);
    
    // Determine upload path based on file type
    if (file.fieldname === 'profilePicture') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'serviceImages') {
      uploadPath += 'services/';
    } else if (file.fieldname === 'portfolioImages') {
      uploadPath += 'portfolio/';
    } else if (file.fieldname === 'orderDeliverables') {
      uploadPath += 'deliverables/';
    } else if (file.fieldname === 'orderRequirements') {
      uploadPath += 'order-requirements/';
    } else if (file.fieldname === 'images') {
      uploadPath += 'freelancer-projects/';
    } else {
      uploadPath += 'general/';
    }
    
    console.log('Multer destination - uploadPath:', uploadPath);
    
    // Ensure directory exists before proceeding
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Multer filename - generated:', name);
    cb(null, name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('Multer fileFilter - fieldname:', file.fieldname);
  console.log('Multer fileFilter - mimetype:', file.mimetype);
  console.log('Multer fileFilter - size:', file.size);
  
  // Check file type based on fieldname
  if (file.fieldname === 'profilePicture' || file.fieldname === 'serviceImages' || file.fieldname === 'portfolioImages') {
    // Allow images
    if (file.mimetype.startsWith('image/')) {
      console.log('Multer fileFilter - Image file accepted');
      cb(null, true);
    } else {
      console.log('Multer fileFilter - Image file rejected');
      cb(new Error('Only image files are allowed for this field'), false);
    }
  } else if (file.fieldname === 'orderDeliverables' || file.fieldname === 'orderRequirements') {
    // Allow various file types for deliverables and requirements
    const allowedTypes = [
      'image/', 'video/', 'application/pdf', 'application/zip',
      'application/x-zip-compressed', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/json', 'application/xml',
      'application/octet-stream' // For binary files
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      console.log('Multer fileFilter - File accepted for requirements/deliverables');
      cb(null, true);
    } else {
      console.log('Multer fileFilter - File rejected for requirements/deliverables');
      cb(new Error('File type not allowed for this field'), false);
    }
  } else {
    console.log('Multer fileFilter - File accepted (default)');
    cb(null, true);
  }
};

// Configure multer with 2GB file size limit
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
    files: 10 // Maximum 10 files
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  console.log('Multer error handler - Error type:', err.constructor.name);
  console.log('Multer error handler - Error message:', err.message);
  
  if (err instanceof multer.MulterError) {
    console.log('Multer error handler - Multer error code:', err.code);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 2GB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
  }
  
  if (err.message.includes('File type not allowed')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  console.log('Multer error handler - Passing error to next middleware');
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};
