const Product = require('../models/product.model');
const AppError = require('../utils/AppError');
const { processConversation, detectIntent, detectLanguage } = require('../utils/assistant');

/**
 * Extract max price from query string.
 * Detects patterns: "under 2000", "below 100", "< 500", "less than 300"
 * @param {string} query - User's search query
 * @returns {number|null} - Max price or null if not found
 */
function extractMaxPrice(query) {
  const lower = query.toLowerCase();
  
  // Pattern 1: "under/below/less than <number>"
  const patterns = [
    /(?:under|below|less\s+than|upto|up\s+to|max|maximum)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
    /(?:\$|rs\.?|inr\.?)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      // Remove commas and parse as number
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }

  return null;
}

/**
 * Parse user query into searchable components.
 * Extracts: category, maxPrice, keywords
 */
function parseQuery(query) {
  const raw = (query || '').toLowerCase().trim();
  
  // Extract price first
  const maxPrice = extractMaxPrice(raw);
  
  // Remove price-related phrases from query for keyword extraction
  let cleanedQuery = raw
    .replace(/(?:under|below|less\s+than|upto|up\s+to|max|maximum)\s*\$?\s*\d+(?:,\d{3})*(?:\.\d+)?/gi, '')
    .replace(/(?:\$|rs\.?|inr\.?)\s*\d+(?:,\d{3})*(?:\.\d+)?/gi, '')
    .trim();

  const tokens = cleanedQuery.split(/\s+/).filter(Boolean);

  // Extended category mapping - maps specific product types to categories
  const categoryMap = {
    // Electronics
    'electronics': 'Electronics',
    'laptop': 'Electronics',
    'laptops': 'Electronics',
    'phone': 'Electronics',
    'phones': 'Electronics',
    'mobile': 'Electronics',
    'tablet': 'Electronics',
    'tablets': 'Electronics',
    'computer': 'Electronics',
    'computers': 'Electronics',
    'camera': 'Electronics',
    'cameras': 'Electronics',
    'tv': 'Electronics',
    'television': 'Electronics',
    'speaker': 'Electronics',
    'speakers': 'Electronics',
    'headphone': 'Electronics',
    'headphones': 'Electronics',
    'earphone': 'Electronics',
    'earphones': 'Electronics',
    'earbuds': 'Electronics',
    'monitor': 'Electronics',
    'monitors': 'Electronics',
    'keyboard': 'Electronics',
    'mouse': 'Electronics',
    
    // Fashion
    'fashion': 'Fashion',
    'clothing': 'Fashion',
    'clothes': 'Fashion',
    'shirt': 'Fashion',
    'shirts': 'Fashion',
    't-shirt': 'Fashion',
    'tshirt': 'Fashion',
    'jeans': 'Fashion',
    'pants': 'Fashion',
    'dress': 'Fashion',
    'dresses': 'Fashion',
    'jacket': 'Fashion',
    'jackets': 'Fashion',
    'shoe': 'Footwear',
    'shoes': 'Footwear',
    'sneaker': 'Footwear',
    'sneakers': 'Footwear',
    'boot': 'Footwear',
    'boots': 'Footwear',
    'footwear': 'Footwear',
    'sandals': 'Footwear',
    'accessories': 'Accessories',
    'watch': 'Accessories',
    'watches': 'Accessories',
    'bag': 'Accessories',
    'bags': 'Accessories',
    'sunglasses': 'Accessories',
    
    // Gaming
    'gaming': 'Gaming',
    'game': 'Gaming',
    'games': 'Gaming',
    'console': 'Gaming',
    'playstation': 'Gaming',
    'xbox': 'Gaming',
    'nintendo': 'Gaming',
    'controller': 'Gaming',
    
    // Home & Kitchen
    'home': 'Home & Kitchen',
    'kitchen': 'Home & Kitchen',
    'furniture': 'Home & Kitchen',
    'appliance': 'Home & Kitchen',
    'appliances': 'Home & Kitchen',
    'blender': 'Home & Kitchen',
    'microwave': 'Home & Kitchen',
    'cooker': 'Home & Kitchen',
    
    // Books
    'book': 'Books',
    'books': 'Books',
    'novel': 'Books',
    'novels': 'Books',
    
    // Sports
    'sports': 'Sports',
    'sport': 'Sports',
    'fitness': 'Sports',
    'gym': 'Sports',
    'exercise': 'Sports',
    'yoga': 'Sports',
    
    // Beauty
    'beauty': 'Beauty',
    'makeup': 'Beauty',
    'skincare': 'Beauty',
    'perfume': 'Beauty',
    'cosmetics': 'Beauty',
  };

  const categories = [];
  const keywords = [];

  // Match multi-word categories first
  const multiWordCategories = ['home & kitchen', 'home and kitchen', 'less than'];
  
  for (const token of tokens) {
    const mapped = categoryMap[token];
    if (mapped && !categories.includes(mapped)) {
      categories.push(mapped);
    } else if (token.length > 2) {
      // Skip very short words, add rest as keywords
      keywords.push(token);
    }
  }

  return { categories, keywords, maxPrice, raw };
}

/**
 * Build MongoDB filter from parsed query.
 */
function buildFilter({ categories, keywords, maxPrice }) {
  const filter = { stock: { $gt: 0 } };

  // Apply category filter
  if (categories.length > 0) {
    filter.category = { $in: categories };
  }

  // Apply price filter
  if (maxPrice !== null) {
    filter.price = { $lte: maxPrice };
  }

  // Apply keyword search if keywords exist
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
function scoreProducts(products, parsedQuery) {
  const { raw, keywords, maxPrice } = parsedQuery;
  const queryLower = raw.toLowerCase();
  const queryTerms = keywords.length > 0 ? keywords : queryLower.split(/\s+/).filter(t => t.length > 2);

  return products.map((product) => {
    let score = 0;
    const nameLower = (product.name || '').toLowerCase();
    const descLower = (product.description || '').toLowerCase();
    const catLower = (product.category || '').toLowerCase();

    // Exact phrase match in name gets highest score
    if (nameLower.includes(queryLower)) score += 50;
    
    // Name starts with query terms
    for (const term of queryTerms) {
      if (nameLower.startsWith(term)) score += 30;
      else if (nameLower.includes(term)) score += 20;
      
      if (descLower.includes(term)) score += 10;
      if (catLower.includes(term)) score += 15;
    }
    
    // Category exact match boost
    if (parsedQuery.categories.length > 0 && parsedQuery.categories.includes(product.category)) {
      score += 25;
    }
    
    // Price relevance boost (closer to maxPrice is better for budget queries)
    if (maxPrice !== null && product.price <= maxPrice) {
      const priceRatio = product.price / maxPrice;
      if (priceRatio >= 0.7 && priceRatio <= 1.0) {
        score += 15; // Products closer to budget get higher score
      } else if (priceRatio >= 0.5 && priceRatio < 0.7) {
        score += 10;
      }
    }
    
    // Boost by rating
    if (product.rating > 0) score += product.rating * 2;
    
    // Boost by review count
    if (product.numReviews > 0) score += Math.min(product.numReviews, 10);
    
    // Stock availability
    if (product.stock > 0) score += 2;

    // FIX: .lean() returns plain JS objects, not Mongoose documents
    // So we spread the product directly instead of calling .toObject()
    return { ...product, _score: score };
  });
}

/**
 * Generate assistant message based on query and results.
 */
function generateMessage(query, productCount, parsedQuery) {
  if (productCount === 0) {
    return `I couldn't find exact matches for "${query}", but here are some popular options:`;
  }

  const parts = [`I found ${productCount} product${productCount > 1 ? 's' : ''}`];
  
  if (parsedQuery.categories.length > 0) {
    parts.push(`in ${parsedQuery.categories.join(', ')}`);
  }
  
  if (parsedQuery.maxPrice !== null) {
    parts.push(`under $${parsedQuery.maxPrice.toLocaleString()}`);
  }
  
  if (parsedQuery.keywords.length > 0) {
    parts.push(`matching "${parsedQuery.keywords.join(' ')}"`);
  }
  
  return parts.join(' ') + ':';
}

/**
 * Get suggestions from database based on user query.
 * DB-driven: always returns results even without AI.
 *
 * @param {string} query - Natural language search query
 * @param {number} limit - Max suggestions to return (default 6)
 * @returns {Promise<Object>} { suggestions, message }
 */
exports.getSuggestions = async (query, limit = 6) => {
  console.log('[Service] getSuggestions called with:', { query, limit });

  if (!query || query.trim().length < 2) {
    console.log('[Service] Empty/short query, returning popular products');
    // Return popular products as default
    const popular = await Product.find({ stock: { $gt: 0 } })
      .sort('-rating -numReviews')
      .limit(limit)
      .lean();
    
    console.log('[Service] Found popular products:', popular.length);
    
    return {
      suggestions: popular,
      message: "Here are some popular products you might like:",
    };
  }

  const parsed = parseQuery(query);
  console.log('[Service] Parsed query:', parsed);
  
  const filter = buildFilter(parsed);
  console.log('[Service] MongoDB filter:', JSON.stringify(filter, null, 2));

  // Primary search with all filters
  let products = await Product.find(filter)
    .sort('-rating -numReviews')
    .limit(20)
    .lean();

  console.log('[Service] Primary search found:', products.length, 'products');

  // Fallback 1: If no results and we have keywords, search just by keywords
  if (products.length === 0 && parsed.keywords.length > 0) {
    console.log('[Service] Fallback 1: Searching by keywords only');
    const fallbackFilter = {
      $or: [
        { name: { $regex: parsed.keywords.join('|'), $options: 'i' } },
        { description: { $regex: parsed.keywords.join('|'), $options: 'i' } },
      ],
      stock: { $gt: 0 },
    };
    
    // Apply price filter if exists
    if (parsed.maxPrice !== null) {
      fallbackFilter.price = { $lte: parsed.maxPrice };
    }
    
    products = await Product.find(fallbackFilter)
      .sort('-rating')
      .limit(20)
      .lean();
    
    console.log('[Service] Fallback 1 found:', products.length, 'products');
  }

  // Fallback 2: If still no results, return popular products
  if (products.length === 0) {
    console.log('[Service] Fallback 2: No matches, returning popular products');
    const popular = await Product.find({ stock: { $gt: 0 } })
      .sort('-rating -numReviews')
      .limit(limit)
      .lean();
    
    return {
      suggestions: popular,
      message: `I couldn't find exact matches for "${query}", but here are some popular options:`,
    };
  }

  // Score and sort products
  console.log('[Service] Scoring', products.length, 'products');
  const scored = scoreProducts(products, parsed);
  scored.sort((a, b) => b._score - a._score);
  
  // Take top results
  const suggestions = scored.slice(0, limit);
  
  // Generate message
  const message = generateMessage(query, suggestions.length, parsed);

  console.log('[Service] Returning', suggestions.length, 'suggestions');

  return {
    suggestions,
    message,
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

    const scored = scoreProducts(products, { raw: topCategories.join(' '), keywords: topCategories, maxPrice: null, categories: topCategories });
    scored.sort((a, b) => b._score - a._score);

    return {
      suggestions: scored.slice(0, limit),
      message: "Based on your purchase history, here are some recommendations:",
    };
  } catch (error) {
    // Any error → fall back to general
    console.error('[Service] getPersonalizedSuggestions error:', error.message);
    console.error('[Service] Falling back to general suggestions');
    return exports.getSuggestions('', limit);
  }
};

/**
 * Smart Conversational Shopping Assistant
 * Processes natural language queries with multi-language support
 * 
 * @param {string} query - User's conversational query
 * @param {number} limit - Max suggestions to return (default 6)
 * @returns {Promise<Object>} { suggestions, message, metadata }
 */
exports.getConversationalSuggestions = async (query, limit = 6) => {
  console.log('[Service] getConversationalSuggestions called with:', { query, limit });

  // Detect language and intent first
  const language = detectLanguage(query);
  const intent = detectIntent(query, language);
  
  console.log('[Service] Detected language:', language);
  console.log('[Service] Detected intent:', intent);

  // Handle non-suggestion intents (greeting, smalltalk)
  if (intent === 'greeting' || intent === 'smalltalk') {
    console.log('[Service] Processing conversational intent:', intent);
    
    // Simulate thinking delay (300-600ms)
    const thinkingDelay = Math.floor(Math.random() * 300) + 300;
    await new Promise(resolve => setTimeout(resolve, thinkingDelay));
    
    const conversation = processConversation(query, []);
    
    console.log('[Service] Conversational response generated');
    return {
      suggestions: [],
      message: conversation.message,
      metadata: conversation.metadata
    };
  }

  // Handle unknown intent
  if (intent === 'unknown') {
    console.log('[Service] Unknown intent, generating helpful response');
    
    const thinkingDelay = Math.floor(Math.random() * 300) + 300;
    await new Promise(resolve => setTimeout(resolve, thinkingDelay));
    
    const conversation = processConversation(query, []);
    
    return {
      suggestions: [],
      message: conversation.message,
      metadata: conversation.metadata
    };
  }

  // Handle suggestion intent - fetch products
  console.log('[Service] Processing suggestion intent, fetching products');

  if (!query || query.trim().length < 2) {
    console.log('[Service] Empty/short query, returning popular products');
    const popular = await Product.find({ stock: { $gt: 0 } })
      .sort('-rating -numReviews')
      .limit(limit)
      .lean();
    
    console.log('[Service] Found popular products:', popular.length);
    
    const conversation = processConversation(query, popular);
    
    return {
      suggestions: conversation.suggestions,
      message: conversation.message,
      metadata: conversation.metadata
    };
  }

  // Parse query for product search
  const parsed = parseQuery(query);
  console.log('[Service] Parsed query:', parsed);
  
  const filter = buildFilter(parsed);
  console.log('[Service] MongoDB filter:', JSON.stringify(filter, null, 2));

  // Primary search with all filters
  let products = await Product.find(filter)
    .sort('-rating -numReviews')
    .limit(20)
    .lean();

  console.log('[Service] Primary search found:', products.length, 'products');

  // Fallback 1: If no results and we have keywords, search just by keywords
  if (products.length === 0 && parsed.keywords.length > 0) {
    console.log('[Service] Fallback 1: Searching by keywords only');
    const fallbackFilter = {
      $or: [
        { name: { $regex: parsed.keywords.join('|'), $options: 'i' } },
        { description: { $regex: parsed.keywords.join('|'), $options: 'i' } },
      ],
      stock: { $gt: 0 },
    };
    
    if (parsed.maxPrice !== null) {
      fallbackFilter.price = { $lte: parsed.maxPrice };
    }
    
    products = await Product.find(fallbackFilter)
      .sort('-rating')
      .limit(20)
      .lean();
    
    console.log('[Service] Fallback 1 found:', products.length, 'products');
  }

  // Fallback 2: If still no results, return popular products
  if (products.length === 0) {
    console.log('[Service] Fallback 2: No matches, returning popular products');
    const popular = await Product.find({ stock: { $gt: 0 } })
      .sort('-rating -numReviews')
      .limit(limit)
      .lean();
    
    const conversation = processConversation(query, popular);
    
    return {
      suggestions: conversation.suggestions,
      message: conversation.message,
      metadata: conversation.metadata
    };
  }

  // Score and sort products
  console.log('[Service] Scoring', products.length, 'products');
  const scored = scoreProducts(products, parsed);
  scored.sort((a, b) => b._score - a._score);
  
  // Take top results
  const suggestions = scored.slice(0, limit);
  
  // Generate conversational response
  console.log('[Service] Generating conversational response');
  const conversation = processConversation(query, suggestions);
  
  console.log('[Service] Returning', suggestions.length, 'suggestions');

  return {
    suggestions: conversation.suggestions,
    message: conversation.message,
    metadata: conversation.metadata
  };
};