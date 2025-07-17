
const express = require('express');
const {
  createReview,
  getOrderReview,
  getServiceReviews,
  getFreelancerReviews,
  respondToReview,
  getReviewAnalytics
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/', createReview);
router.get('/order/:orderId', getOrderReview);
router.get('/service/:serviceId', getServiceReviews);
router.get('/freelancer/:freelancerId', getFreelancerReviews);
router.put('/:reviewId/respond', respondToReview);
router.get('/analytics', getReviewAnalytics);

module.exports = router;
