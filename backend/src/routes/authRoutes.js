const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  refreshAccessToken,
  sendOTP,
  verifyOTP,
  googleAuth,
  logout,
  requestPasswordReset,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Email authentication
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);

// Token management
router.post('/refresh', refreshAccessToken);

// OTP authentication
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
// Google OAuth
router.post('/google', googleAuth);

module.exports = router;
