const express = require('express');
const router = express.Router();
const { login, verifyToken, changePassword, sendResetOtp, verifyResetOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/send-reset-otp', sendResetOtp);
router.post('/verify-reset-otp', verifyResetOtp);

// Protected routes
router.get('/verify', protect, verifyToken);
router.post('/change-password', protect, changePassword);

module.exports = router;
