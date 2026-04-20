const suggestionService = require('../services/suggestion.service');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/suggestions
 * Smart conversational shopping assistant endpoint.
 * 
 * Features:
 * - Multi-language support (English, Hindi, Hinglish)
 * - Intent detection (greeting, smalltalk, suggestion, unknown)
 * - Dynamic response generation using word memory system
 * - Thinking animation support
 *
 * Body: { query: string, limit?: number }
 *
 * Response: { success: true, data: { suggestions, message, metadata } }
 */
exports.getSuggestions = catchAsync(async (req, res, next) => {
  console.log('=== API HIT: POST /api/suggestions ===');
  console.log('Request body:', req.body);
  
  const { query, limit } = req.body;

  console.log('Query:', query);
  console.log('Limit:', limit);

  // Use conversational AI endpoint
  const result = await suggestionService.getConversationalSuggestions(query, limit);

  console.log('Response:', {
    suggestionCount: result.suggestions?.length || 0,
    message: result.message,
    metadata: result.metadata
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * GET /api/suggestions/personalized
 * Personalized suggestions for logged-in users.
 *
 * Query: ?limit=6
 *
 * Requires authentication via verifyToken middleware.
 * Falls back to general suggestions if userId unavailable.
 */
exports.getPersonalizedSuggestions = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const limit = parseInt(req.query.limit, 10) || 6;

  const result = await suggestionService.getPersonalizedSuggestions(userId, limit);

  res.status(200).json({
    success: true,
    data: result,
  });
});