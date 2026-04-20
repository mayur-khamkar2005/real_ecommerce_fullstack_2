const express = require('express');
const suggestionController = require('../controllers/suggestion.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: chat-based product suggestion (DB-driven, optional AI)
router.post('/', suggestionController.getSuggestions);

// Protected: personalized suggestions based on user history
router.get('/personalized', verifyToken, suggestionController.getPersonalizedSuggestions);

module.exports = router;