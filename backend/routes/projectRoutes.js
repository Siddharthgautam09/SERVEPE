
const express = require('express');
const {
  getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects
} = require('../controllers/projectController');
const { protect, restrictTo } = require('../middleware/auth');
const { validateProject, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProject);

// Protected routes
router.use(protect);

router.get('/my/projects', getMyProjects);
router.post('/', restrictTo('client'), validateProject, handleValidationErrors, createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
