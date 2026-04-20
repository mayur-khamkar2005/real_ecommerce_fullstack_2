const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

/**
 * Parse user query into searchable tokens.
 * Extracts keywords, categories, price hints.
 */
function parseQuery(query) {
  const raw = (query || '').toLowerCase().trim();
  const tokens = raw.split(/\s+/).filter(Boolean);

  // Category keywords that map to exact categories
  const categoryMap = {
    electronics: 'Electronics',
    fashion: 'Fashion',
    gaming: 'Gaming',
    'home & kitchen': 'Home & Kitchen',
    'home and kitchen': 'Home & Kitchen',
    'home': 'Home & Kitchen',
    kitchen: 'Home & Kitchen',
    books: 'Books',
    sports: 'Sports',
    beauty: 'Beauty',
    accessories: 'Accessories',
    footwear: 'Footwear',
    gadgets: 'Gadgets',
  };

  const categories = [];
  const keywords = [];

  for (const token of tokens) {
    const mapped = categoryMap[token];
    if (mapped && !categories.includes(mapped)) {
      categories.push(mapped);
    } else {
      keywords.push(token);
    }
  }

  return { categories, keywords, raw };
}

/**
 * Build MongoDB filter from parsed query.
 */
function buildFilter({ categories, keywords }) {
  const filter = {};

  if (categories.length > 0) {
    filter.category = { $in: categories };
  }

  if (keywords.length > 0) {
    filter.$or = [
      { name: { $regex: keywords.join('|'), $options: 'i' } },
      { description: { $regex: keywords.join('|'), $options: 'i' } },
      { category: { $regex: keywords.join('|'), $options: 'i' } },
    ];
  }

  return filter;
}

/**
 * Score products based on relevance to query.
 * Higher score = more relevant.
 */
function scoreProducts(products, query) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);

  return products.map((product) => {
    let score = 0;
    const nameLower = (product.name || '').toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    const catLower = (product.category || '').toLowerCase();

    // Exact name match gets highest score
    if (nameLower.includes(queryLower)) score += 50;
    // Name starts with query
    if (nameLower.startsWith(queryLower)) score += 25;
    // Category match
    if (catLower.includes(queryLower)) score += 20;
    // Description match
    if (descLower.includes(queryLower)) score += 10;
    // Token matches in name/description
    for (const term of queryTerms) {
      if (nameLower.includes(term)) score += 5;
      if (descLower.includes(term)) score += 2;
    }
    // Boost by rating and stock availability
    if (product.rating > 0) score += product.rating;
    if (product.stock > 0) score += 1;

    return { ...product.toObject(), _score: score };
  });
}

/**
 * Get suggestions from database based on user query.
 * DB-driven: always returns results even without AI.
 *
 * @param {string} query - Natural language search query
 * @param {number} limit - Max suggestions to return (default 6)
 * @returns {Promise<Array>} Sorted, scored product suggestions
 */
exports.getSuggestions = async (query, limit = 6) => {
  if (!query || query.trim().length < 2) {
    // Return popular products as default
    const popular = await Product.find({ stock: { $gt: 0 } })
      .sort('-rating -numReviews')
      .limit(limit)
      .lean();
    return {
      suggestions: popular.map((p) => ({ ...p, _score: 0, _source: 'popular' })),
      total: popular.length,
      query: '',
      aiEnhanced: false,
    };
  }

  const parsed = parseQuery(query);
  const filter = buildFilter(parsed);

  let products = await Product.find({ ...filter, stock: { $gt: 0 } })
    .sort('-rating -numReviews')
    .limit(20)
    .lean();

  if (products.length === 0 && parsed.keywords.length > 0) {
    // Fallback: search just by keywords if category didn't match
    const fallbackFilter = {
      $or: [
        { name: { $regex: parsed.keywords.join('|'), $options: 'i' } },
        { description: { $regex: parsed.keywords.join('|'), $options: 'i' } },
      ],
      stock: { $gt: 0 },
    };
    products = await Product.find(fallbackFilter)
      .sort('-rating')
      .limit(20)
      .lean();
  }

  // Score and sort
  const scored = scoreProducts(products, query);
  scored.sort((a, b) => b._score - a._score);
  const suggestions = scored.slice(0, limit).map((p) => ({ ...p, _source: 'database' }));

  return {
    suggestions,
    total: suggestions.length,
    query,
    aiEnhanced: false,
  };
};

/**
 * Get personalized suggestions based on user's order/rating history.
 * Requires userId - falls back to general suggestions if not available.
 *
 * @param {string} userId
 * @param {number} limit
 */
exports.getPersonalizedSuggestions = async (userId, limit = 6) => {
  if (!userId) return exports.getSuggestions('', limit);

  try {
    // Get user's purchased/rated categories
    const Order = require('../models/order.model');
    const Review = require('../models/review.model');

    const orders = await Order.find({ user: userId, status: 'delivered' })
      .sort('-createdAt')
      .limit(50)
      .lean();

    const reviews = await Review.find({ user: userId }).lean();

    // Extract preferred categories
    const purchasedProducts = orders.flatMap((o) =>
      (o.items || []).map((item) => item.product?.toString()).filter(Boolean)
    );

    if (purchasedProducts.length === 0) {
      return exports.getSuggestions('', limit);
    }

    // Get categories from purchased products
    const purchased = await Product.find({ _id: { $in: purchasedProducts } }).lean();
    const categoryCounts = {};
    purchased.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Get suggestions from top categories
    const filter = { category: { $in: topCategories }, stock: { $gt: 0 } };
    const excludeIds = [...new Set(purchasedProducts)].slice(0, 10);

    if (excludeIds.length > 0) {
      filter._id = { $nin: excludeIds };
    }

    const products = await Product.find(filter)
      .sort('-rating')
      .limit(limit * 2)
      .lean();

    const scored = scoreProducts(products, topCategories.join(' '));
    scored.sort((a, b) => b._score - a._score);

    return {
      suggestions: scored.slice(0, limit).map((p) => ({ ...p, _source: 'personalized' })),
      total: scored.length,
      query: topCategories.join(', '),
      aiEnhanced: false,
    };
  } catch {
    // Any error → fall back to general
    return exports.getSuggestions('', limit);
  }
};