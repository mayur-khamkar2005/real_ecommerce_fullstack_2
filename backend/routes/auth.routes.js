const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected route
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/password', verifyToken, authController.updatePassword);

module.exports = router;
