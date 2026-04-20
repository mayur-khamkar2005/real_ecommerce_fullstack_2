const suggestionService = require('../services/suggestion.service');
const catchAsync = require('../utils/catchAsync');

/**
 * POST /api/suggestions
 * Chat-based product suggestion endpoint.
 *
 * Body: { query: string, limit?: number }
 *
 * Response: { success: true, data: { suggestions, total, query, aiEnhanced } }
 *
 * AI is optional — always falls back to DB-driven results.
 */
exports.getSuggestions = catchAsync(async (req, res, next) => {
  const { query, limit } = req.body;

  const result = await suggestionService.getSuggestions(query, limit);

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