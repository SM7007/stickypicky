const express = require('express');
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Webhook must come before json middleware (handled in app.js with raw body)
router.post('/webhook', handleWebhook);

router.post('/create-order', createPaymentOrder); // guest-friendly
router.post('/verify', verifyPayment);            // guest-friendly (userId optional)

module.exports = router;
