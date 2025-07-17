
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getAllFreelancerProjects,
  getFreelancerProject,
  createFreelancerProject,
  updateFreelancerProject,
  deleteFreelancerProject,
  getMyFreelancerProjects
} = require('../controllers/freelancerProjectController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/freelancer-projects/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  }
});

// Public routes
router.get('/', getAllFreelancerProjects);
router.get('/:id', getFreelancerProject);

// Protected routes
router.use(protect);

router.get('/my/projects', getMyFreelancerProjects);
router.post('/', restrictTo('freelancer'), upload.array('images', 5), createFreelancerProject);
router.put('/:id', restrictTo('freelancer'), upload.array('images', 5), updateFreelancerProject);
router.delete('/:id', deleteFreelancerProject);

module.exports = router;
