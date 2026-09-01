const express = require('express');
const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPasswordWithOtp,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);
router.get('/me', protect, getMe);

module.exports = router;
