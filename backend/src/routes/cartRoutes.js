const express = require('express');
const { getCart, validateCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getCart);
router.post('/validate', validateCart); // can be called without auth (guest checkout)

module.exports = router;
