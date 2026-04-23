const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// 🔓 Public Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// 🔐 Protected Routes
router.get('/me', verifyToken, authController.getMe);

router.route('/profile')
  .put(verifyToken, authController.updateProfile);

router.route('/password')
  .put(verifyToken, authController.updatePassword);

module.exports = router;