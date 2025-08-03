
const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  submitDeliverables,
  requestRevision,
  getOrderAnalytics,
  getAllOrdersForAdmin,
  testOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test route (no auth required)
router.post('/test', testOrder);

// Admin route for getting all orders (should be before protected routes)
router.get('/admin/all', getAllOrdersForAdmin);

// Protected routes
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/analytics', getOrderAnalytics);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/deliverables', submitDeliverables);
router.put('/:id/revision', requestRevision);

module.exports = router;
