const express = require('express');
const router = express.Router();
const { createWhatsappOrder } = require('../controllers/whatsappOrderController');
const { optionalAuth } = require('../middleware/authMiddleware');

// POST /api/whatsapp/order — public (guest or logged-in user)
router.post('/order', optionalAuth, createWhatsappOrder);

module.exports = router;

