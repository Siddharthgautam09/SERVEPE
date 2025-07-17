
const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  updateRequirements,
  adminLogin
} = require('../controllers/authController');
const {
  sendEmailOTP,
  verifyEmailOTP,
  resendEmailOTP
} = require('../controllers/emailOTPController');
const {
  sendOTP,
  verifyOTP,
  googleLogin,
  googleOAuth,
  selectRole,
  getMe: getOtplessMe
} = require('../controllers/otplessAuthController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Email OTP routes
router.post('/send-email-otp', sendEmailOTP);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/resend-email-otp', resendEmailOTP);

// OTPless routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);
router.post('/google-oauth', googleOAuth);

// Traditional auth routes
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/admin-login', adminLogin);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getOtplessMe);
router.post('/select-role', protect, selectRole);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/requirements', protect, updateRequirements);

module.exports = router;
