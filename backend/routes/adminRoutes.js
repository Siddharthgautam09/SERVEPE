
const express = require('express');
const {
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getPlatformStats
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Platform statistics
router.get('/stats', getPlatformStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
