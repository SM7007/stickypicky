const express = require('express');
const {
  getMyOrders, getOrderById,
  getAdminOrders, updateOrderStatus, getAdminStats,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

// Customer
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin
router.get('/admin/all', protect, adminOnly, getAdminOrders);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.put('/admin/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
