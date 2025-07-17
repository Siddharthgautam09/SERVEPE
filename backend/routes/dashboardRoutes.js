const express = require('express');
const { getClientStats, getFreelancerStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

router.get('/client-stats', getClientStats);
router.get('/freelancer-stats', getFreelancerStats);

module.exports = router;
