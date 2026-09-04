const express = require('express');
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { protect, adminOnly, optionalAuth } = require('../middleware/authMiddleware');
const router = express.Router();

// Webhook must come before json middleware (handled in app.js with raw body)
router.post('/webhook', handleWebhook);

router.post('/create-order', optionalAuth, createPaymentOrder); // guest-friendly, attaches userId if logged in
router.post('/verify', optionalAuth, verifyPayment);            // guest-friendly, attaches userId if logged in

module.exports = router;
