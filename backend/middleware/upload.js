
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
    
    // Determine upload path based on file type
    if (file.fieldname === 'profilePicture') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'serviceImages') {
      uploadPath += 'services/';
    } else if (file.fieldname === 'portfolioImages') {
      uploadPath += 'portfolio/';
    } else if (file.fieldname === 'orderDeliverables') {
      uploadPath += 'deliverables/';
    } else if (file.fieldname === 'images') {
      uploadPath += 'freelancer-projects/';
    } else {
      uploadPath += 'general/';
    }
    
    // Ensure directory exists before proceeding
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, name);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type based on fieldname
  if (file.fieldname === 'profilePicture' || file.fieldname === 'serviceImages' || file.fieldname === 'portfolioImages') {
    // Allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for this field'), false);
    }
  } else if (file.fieldname === 'orderDeliverables') {
    // Allow various file types for deliverables
    const allowedTypes = [
      'image/', 'video/', 'application/pdf', 'application/zip',
      'application/x-zip-compressed', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/json'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed for deliverables'), false);
    }
  } else {
    cb(null, true);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
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
  
  next(err);
};

module.exports = {
  upload,
  handleMulterError
};
