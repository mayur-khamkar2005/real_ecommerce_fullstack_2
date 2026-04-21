const Product = require('../models/product.model');
const { processConversation, detectIntent, detectLanguage } = require('../utils/assistant');
const { askAI } = require('../utils/ai');

// ───────────────────────────────────────────── 
// QUERY PARSING 
// ─────────────────────────────────────────────

const PRICE_PATTERNS = [
  /(?:under|below|less\s+than|upto|up\s+to|max|maximum)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
  /(?:\$|rs\.?|inr\.?)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i,
];

function extractMaxPrice(query) {
  for (const pattern of PRICE_PATTERNS) {
    const match = query.match(pattern);
    if (match) return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}

const CATEGORY_MAP = {
  // Electronics
  laptop: 'Electronics', laptops: 'Electronics', phone: 'Electronics', phones: 'Electronics',
  mobile: 'Electronics', mobiles: 'Electronics', tablet: 'Electronics', tablets: 'Electronics',
  computer: 'Electronics', computers: 'Electronics', camera: 'Electronics', cameras: 'Electronics',
  tv: 'Electronics', television: 'Electronics', speaker: 'Electronics', speakers: 'Electronics',
  headphone: 'Electronics', headphones: 'Electronics', earphone: 'Electronics', earphones: 'Electronics',
  earbuds: 'Electronics', monitor: 'Electronics', monitors: 'Electronics',
  keyboard: 'Electronics', mouse: 'Electronics', electronics: 'Electronics',
  // Fashion
  fashion: 'Fashion', clothing: 'Fashion', clothes: 'Fashion',
  shirt: 'Fashion', shirts: 'Fashion', tshirt: 'Fashion', jeans: 'Fashion',
  pants: 'Fashion', dress: 'Fashion', dresses: 'Fashion', jacket: 'Fashion', jackets: 'Fashion',
  // Footwear
  shoe: 'Footwear', shoes: 'Footwear', sneaker: 'Footwear', sneakers: 'Footwear',
  boot: 'Footwear', boots: 'Footwear', footwear: 'Footwear', sandals: 'Footwear',
  // Accessories
  accessories: 'Accessories', watch: 'Accessories', watches: 'Accessories',
  bag: 'Accessories', bags: 'Accessories', sunglasses: 'Accessories',
  // Gaming
  gaming: 'Gaming', game: 'Gaming', games: 'Gaming', console: 'Gaming',
  playstation: 'Gaming', xbox: 'Gaming', nintendo: 'Gaming', controller: 'Gaming',
  // Home & Kitchen
  home: 'Home & Kitchen', kitchen: 'Home & Kitchen', furniture: 'Home & Kitchen',
  appliance: 'Home & Kitchen', appliances: 'Home & Kitchen', blender: 'Home & Kitchen',
  microwave: 'Home & Kitchen', cooker: 'Home & Kitchen',
  // Books
  book: 'Books', books: 'Books', novel: 'Books', novels: 'Books',
  // Sports
  sports: 'Sports', sport: 'Sports', fitness: 'Sports', gym: 'Sports',
  exercise: 'Sports', yoga: 'Sports',
  // Beauty
  beauty: 'Beauty', makeup: 'Beauty', skincare: 'Beauty', perfume: 'Beauty', cosmetics: 'Beauty',
};

// Stop words to exclude from keyword search
const STOP_WORDS = new Set([
  'i', 'me', 'a', 'an', 'the', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at',
  'want', 'need', 'looking', 'find', 'show', 'suggest', 'get', 'buy', 'give',
  'some', 'any', 'good', 'best', 'cheap', 'affordable', 'nice',
]);

function parseQuery(query) {
  const raw = (query || '').toLowerCase().trim();
  const maxPrice = extractMaxPrice(raw);

  const cleaned = raw
    .replace(/(?:under|below|less\s+than|upto|up\s+to|max|maximum)\s*\$?\s*\d+(?:,\d{3})*(?:\.\d+)?/gi, '')
    .replace(/(?:\$|rs\.?|inr\.?)\s*\d+(?:,\d{3})*(?:\.\d+)?/gi, '')
    .trim();

  const categories = [];
  const keywords = [];

  for (const token of cleaned.split(/\s+/).filter(Boolean)) {
    const mapped = CATEGORY_MAP[token];
    if (mapped) {
      if (!categories.includes(mapped)) categories.push(mapped);
    } else if (token.length > 2 && !STOP_WORDS.has(token)) {
      keywords.push(token);
    }
  }

  return { categories, keywords, maxPrice, raw };
}

function buildFilter({ categories, keywords, maxPrice }) {
  const filter = { stock: { $gt: 0 } };

  if (categories.length > 0) filter.category = { $in: categories };
  if (maxPrice !== null) filter.price = { $lte: maxPrice };

  if (keywords.length > 0) {
    filter.$or = [
      { name: { $regex: keywords.join('|'), $options: 'i' } },
      { description: { $regex: keywords.join('|'), $options: 'i' } },
      { category: { $regex: keywords.join('|'), $options: 'i' } },
    ];
  }

  return filter;
}

// ─────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────

function scoreProducts(products, { raw, keywords, maxPrice, categories }) {
  const queryTerms = keywords.length > 0
    ? keywords
    : raw.split(/\s+/).filter(t => t.length > 2 && !STOP_WORDS.has(t));

  return products.map((product) => {
    let score = 0;
    const name = (product.name || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    if (name.includes(raw)) score += 50;

    for (const term of queryTerms) {
      if (name.startsWith(term)) score += 30;
      else if (name.includes(term)) score += 20;
      if (desc.includes(term)) score += 10;
      if (cat.includes(term)) score += 15;
    }

    if (categories.length > 0 && categories.includes(product.category)) score += 25;

    if (maxPrice !== null && product.price <= maxPrice) {
      const ratio = product.price / maxPrice;
      score += ratio >= 0.7 ? 15 : ratio >= 0.5 ? 10 : 0;
    }

    score += (product.rating || 0) * 2;
    score += Math.min(product.numReviews || 0, 10);

    return { ...product, _score: score };
  });
}

// ─────────────────────────────────────────────
// DB SEARCH (shared by both exports)
// ─────────────────────────────────────────────

async function searchProducts(query, limit) {
  const parsed = parseQuery(query);
  const filter = buildFilter(parsed);

  let products = await Product.find(filter)
    .sort('-rating -numReviews')
    .limit(20)
    .lean();

  // Fallback 1: keyword-only search
  if (products.length === 0 && parsed.keywords.length > 0) {
    const fallback = {
      $or: [
        { name: { $regex: parsed.keywords.join('|'), $options: 'i' } },
        { description: { $regex: parsed.keywords.join('|'), $options: 'i' } },
      ],
      stock: { $gt: 0 },
      ...(parsed.maxPrice !== null && { price: { $lte: parsed.maxPrice } }),
    };
    products = await Product.find(fallback).sort('-rating').limit(20).lean();
  }

  // Fallback 2: popular products
  if (products.length === 0) {
    return {
      products: await Product.find({ stock: { $gt: 0 } })
        .sort('-rating -numReviews')
        .limit(limit)
        .lean(),
      parsed,
      usedFallback: true,
    };
  }

  const scored = scoreProducts(products, parsed);
  scored.sort((a, b) => b._score - a._score);

  return { products: scored.slice(0, limit), parsed, usedFallback: false };
}

async function getPopularProducts(limit) {
  return Product.find({ stock: { $gt: 0 } })
    .sort('-rating -numReviews')
    .limit(limit)
    .lean();
}

// ─────────────────────────────────────────────
// PUBLIC: CONVERSATIONAL (main endpoint)
// ─────────────────────────────────────────────

/**
 * Smart conversational assistant with intent routing.
 * Products are ONLY returned for suggestion intent.
 */
exports.getConversationalSuggestions = async (query = '', limit = 6) => {
  const language = detectLanguage(query);
  const intent = detectIntent(query, language);

  // STRICT RULE: if intent !== "suggestion" → products must be []
  if (intent !== 'suggestion') {
    // Chat intent → OpenRouter AI (text only)
    if (intent === 'chat') {
      const message = await askAI(query);
      return {
        suggestions: [],
        message,
        metadata: { intent, language, productCount: 0 },
      };
    }

    // Greeting/Fallback → local text (no products, no AI)
    const conversation = processConversation(query, []);
    return {
      suggestions: [],
      message: conversation.message,
      metadata: { ...conversation.metadata, intent, language },
    };
  }

  // Empty/very short query → return popular products
  if (!query || query.trim().length < 2) {
    const popular = await getPopularProducts(limit);
    const conversation = processConversation(query, popular);
    return {
      suggestions: popular,
      message: conversation.message,
      metadata: conversation.metadata,
    };
  }

  // Full product search
  const { products, usedFallback } = await searchProducts(query, limit);
  const conversation = processConversation(query, products);

  return {
    suggestions: products,
    message: conversation.message,
    metadata: { ...conversation.metadata, usedFallback },
  };
};

// ─────────────────────────────────────────────
// PUBLIC: PERSONALIZED (authenticated users)
// ─────────────────────────────────────────────

exports.getPersonalizedSuggestions = async (userId, limit = 6) => {
  if (!userId) {
    const popular = await getPopularProducts(limit);
    return { suggestions: popular, message: "Here are some popular products you might like:" };
  }

  try {
    const Order = require('../models/order.model');

    const orders = await Order.find({ user: userId, status: 'delivered' })
      .sort('-createdAt')
      .limit(50)
      .lean();

    const purchasedIds = orders
      .flatMap((o) => (o.items || []).map((item) => item.product?.toString()))
      .filter(Boolean);

    if (purchasedIds.length === 0) {
      const popular = await getPopularProducts(limit);
      return { suggestions: popular, message: "Here are some popular products for you:" };
    }

    const purchased = await Product.find({ _id: { $in: purchasedIds } }).lean();
    const categoryCounts = {};
    purchased.forEach((p) => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const filter = {
      category: { $in: topCategories },
      stock: { $gt: 0 },
      _id: { $nin: [...new Set(purchasedIds)].slice(0, 20) },
    };

    const products = await Product.find(filter).sort('-rating').limit(limit * 2).lean();
    const scored = scoreProducts(products, {
      raw: topCategories.join(' '),
      keywords: topCategories,
      maxPrice: null,
      categories: topCategories,
    });
    scored.sort((a, b) => b._score - a._score);

    return {
      suggestions: scored.slice(0, limit),
      message: "Based on your purchase history, here are some recommendations:",
    };
  } catch (err) {
    console.error('[Service] getPersonalizedSuggestions error:', err.message);
    const popular = await getPopularProducts(limit);
    return { suggestions: popular, message: "Here are some popular products for you:" };
  }
};