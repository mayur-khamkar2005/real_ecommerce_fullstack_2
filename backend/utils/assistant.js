/**
 * assistant.js — Conversational Shopping Assistant Utility
 *
 * Intents:
 * - greeting  → hi/hello/namaste → ONLY text
 * - chat      → how are you / smalltalk → ONLY text (handled by AI in service)
 * - suggestion → shopping/product intent → PRODUCTS allowed
 * - fallback  → everything else → ONLY text
 */

// ─────────────────────────────────────────────
// LANGUAGE DETECTION
// ─────────────────────────────────────────────

const HINDI_REGEX = /[\u0900-\u097F]/;
const MARATHI_WORDS = new Set(['काय', 'कसे', 'आहात', 'मला', 'हवं', 'आहे', 'नमस्कार', 'धन्यवाद', 'करा', 'सांगा']);
const HINGLISH_MARKERS = new Set([
  'yaar', 'bhai', 'kya', 'haal', 'hai', 'mujhe', 'chahiye', 'karo', 'accha',
  'acha', 'theek', 'bilkul', 'zyada', 'thoda', 'nahi', 'haan', 'hna', 'matlab',
  'suno', 'dekho', 'batao', 'dosto', 'ekdam', 'seedha',
]);

/** @returns {'en'|'hi'|'hinglish'|'mr'} */
function detectLanguage(query = '') {
  if (!query.trim()) return 'en';

  if (HINDI_REGEX.test(query)) {
    const words = query.split(/\s+/);
    const marathiCount = words.filter(w => MARATHI_WORDS.has(w)).length;
    return marathiCount >= 1 ? 'mr' : 'hi';
  }

  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);
  const hinglishCount = words.filter(w => HINGLISH_MARKERS.has(w)).length;
  if (hinglishCount >= 1) return 'hinglish';

  return 'en';
}

// ─────────────────────────────────────────────
// INTENT DETECTION
// ─────────────────────────────────────────────

// Greeting detection
const GREETING_PATTERNS = [
  /^\s*(hi|hii|hiii|hey|heyy|hello|helloo|hola|yo)\b/i,
  /^h+[aeiou]*y+[ao]?\b/i,
  /^he+l+o+\b/i,
  /\b(good\s*(morning|evening|afternoon|night|day))\b/i,
  /\b(namaste|namaskar|namasthe|namaskaar|pranam)\b/i,
  /\b(sup|wassup|whassup|howdy)\b/i,
  /^greetings?\b/i,
];

const GREETING_HINDI = [
  /नमस्ते/, /नमस्कार/, /प्रणाम/, /हेलो/, /हाय/,
];

const CHAT_PATTERNS = [
  /\b(how are you|how r u|how do you do|how's it going|how are things)\b/i,
  /\b(what('s| is) (up|good|new))\b/i,
  /\b(who are you|what are you|tell me about (your)?self|what can you do)\b/i,
  /\b(are you (a |an )?(bot|robot|ai|human|assistant))\b/i,
  /\b(help( me)?|what do you (do|sell)|how (do|can) (i|you))\b/i,
  /\bhow (are|r) (you|u)\b/i,
  /\bkya (hal|haal|haal hai|kar rahe|ho)\b/i,
  /\bkaise (ho|hain)\b/i,
];

// Strong suggestion signals — product/shopping intent
const SUGGESTION_KEYWORDS = new Set([
  // English
  'suggest', 'suggestion', 'recommend', 'recommendation', 'find', 'search',
  'show', 'need', 'want', 'looking', 'buy', 'purchase', 'get', 'give',
  'best', 'top', 'good', 'cheap', 'affordable', 'budget', 'discount', 'offer',
  // Hinglish
  'chahiye', 'dikhao', 'karo', 'do', 'lena', 'leni', 'khridna', 'dilao',
  // Hindi
  'चाहिए', 'दिखाओ', 'सुझाव', 'बताओ', 'खरीदना', 'खोजो',
  // Marathi
  'हवं', 'दाखवा', 'सुचवा',
]);

// Product-related terms that strongly imply suggestion intent
const PRODUCT_TERMS = new Set([
  'laptop', 'laptops', 'phone', 'phones', 'mobile', 'mobiles', 'tablet', 'tablets',
  'headphone', 'headphones', 'earphone', 'earphones', 'earbuds', 'speaker', 'speakers',
  'camera', 'cameras', 'tv', 'television', 'monitor', 'monitors', 'keyboard', 'mouse',
  'shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandal', 'sandals',
  'shirt', 'shirts', 'tshirt', 'jeans', 'dress', 'jacket', 'jackets', 'clothing',
  'watch', 'watches', 'bag', 'bags', 'sunglasses', 'accessories',
  'book', 'books', 'novel', 'novels',
  'gaming', 'console', 'controller',
  'furniture', 'appliance', 'appliances', 'blender', 'microwave',
  'perfume', 'makeup', 'skincare', 'cosmetics',
  'gym', 'fitness', 'yoga', 'sports',
  // Hinglish product terms
  'joote', 'kapde', 'ghadi',
]);

// Hard fallback patterns (non-shopping, out-of-scope)
const FALLBACK_PATTERNS = [
  /\b(meaning of life|universe|philosophy|joke|weather|news|time|date|tomorrow)\b/i,
  /\b(politics|religion|math|science|history|explain|what is|define)\b/i,
  /\b(write|code|program|song|poem|story)\b/i,
];

/**
 * Detect intent from query.
 * @param {string} query
 * @param {'en'|'hi'|'hinglish'|'mr'} lang
 * @returns {'greeting'|'chat'|'suggestion'|'fallback'}
 */
function detectIntent(query = '', lang = 'en') {
  const trimmed = query.trim();
  if (!trimmed) return 'fallback';

  const lower = trimmed.toLowerCase();
  const words = lower.split(/\s+/);

  // 1) Greeting
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(trimmed)) return 'greeting';
  }
  if (lang === 'hi' || lang === 'mr') {
    for (const pattern of GREETING_HINDI) {
      if (pattern.test(trimmed)) return 'greeting';
    }
  }

  // 2) Chat / smalltalk
  for (const pattern of CHAT_PATTERNS) {
    if (pattern.test(lower)) return 'chat';
  }

  // 3) Out-of-scope → fallback
  for (const pattern of FALLBACK_PATTERNS) {
    if (pattern.test(lower)) return 'fallback';
  }

  // 4) Suggestion — product term
  for (const word of words) {
    if (PRODUCT_TERMS.has(word)) return 'suggestion';
  }

  // 5) Suggestion — shopping keywords
  for (const word of words) {
    if (SUGGESTION_KEYWORDS.has(word)) return 'suggestion';
  }

  // 6) Suggestion — price/budget implies shopping intent
  if (/\d{3,}/.test(lower) || /under|below|budget|cheap/i.test(lower)) {
    return 'suggestion';
  }

  // 7) Suggestion — Hindi/Hinglish shopping phrases
  if (lang === 'hi' || lang === 'hinglish') {
    if (/chahiye|dikhao|karo|lena/i.test(lower)) return 'suggestion';
  }

  return 'fallback';
}

// ─────────────────────────────────────────────
// RESPONSE GENERATION
// ─────────────────────────────────────────────

const RESPONSES = {
  en: {
    greeting: [
      "Hi! I'm your shopping assistant. What are you looking for today?",
      "Hello! Great to have you here. Tell me what you need and I'll find it for you.",
      "Hi! Ready to help you find something great. What's on your shopping list?",
      "Hey! I'm here to help you discover products you'll love. What are you looking for?",
      "Welcome! Just tell me what you're looking for — I'll handle the rest.",
    ],
    fallback: [
      "That's a bit outside my expertise! I'm best at helping you find products. Try asking me to suggest a laptop, shoes, or headphones.",
      "I'm focused on shopping assistance, so I might not be the best for that. But I can help you find any product — just ask!",
      "I specialize in product recommendations. What are you shopping for today?",
      "Hmm, I'm not sure how to help with that. I'm great at finding products though — what do you need?",
    ],
    noResults: [
      "I couldn't find an exact match, but here are some popular products you might like:",
      "Nothing matched exactly, so here are our top picks instead:",
      "I didn't find what you described, but these popular items might interest you:",
    ],
    found: [
      (n, q) => `Here are ${n} great option${n > 1 ? 's' : ''} for "${q}":`,
      (n, q) => `I found ${n} product${n > 1 ? 's' : ''} matching "${q}":`,
      (n, q) => `Check out ${n > 1 ? 'these' : 'this'} ${n} result${n > 1 ? 's' : ''} for "${q}":`,
    ],
  },

  hi: {
    greeting: [
      "नमस्ते! 👋 मैं आपका शॉपिंग असिस्टेंट हूँ। आप क्या ढूंढ रहे हैं?",
      "हेलो! आज मैं आपकी क्या मदद कर सकता हूँ?",
      "नमस्कार! बताइए, आपको किस चीज़ की तलाश है?",
      "हाय! मुझे बताइए आप क्या खरीदना चाहते हैं।",
    ],
    fallback: [
      "यह मेरी स्पेशलिटी नहीं है। मैं प्रोडक्ट ढूंढने में बेहतर हूँ — बताइए क्या चाहिए?",
      "शॉपिंग में मदद के लिए मैं हाज़िर हूँ। कोई प्रोडक्ट बताइए।",
    ],
    noResults: [
      "सटीक मैच नहीं मिला, लेकिन ये पॉपुलर प्रोडक्ट्स देखिए:",
      "आपकी खोज से मेल नहीं खाया, पर ये आइटम पसंद आ सकते हैं:",
    ],
    found: [
      (n, q) => `"${q}" के लिए ${n} प्रोडक्ट मिले:`,
      (n, q) => `देखिए, मैंने "${q}" के लिए ${n} ऑप्शन ढूंढे:`,
    ],
  },

  hinglish: {
    greeting: [
      "Hey yaar! 👋 Main tumhara shopping assistant hoon. Kya chahiye aaj?",
      "Arre hello! Batao kya dhundh rahe ho — main help karunga.",
      "Kya haal hai! Chalo, batao kya kharidna hai aaj?",
      "Hey! Koi bhi product chahiye? Main ek second mein dhundh deta hoon.",
    ],
    fallback: [
      "Yaar, yeh mujhe nahi pata. Par koi bhi product chahiye toh zaroor batao!",
      "Thoda bahar ka question hai. Chalo shopping ki baat karte hain — kya chahiye?",
    ],
    noResults: [
      "Exact match nahi mila yaar, par yeh popular items dekho:",
      "Kuch nahi mila seedha, par yeh options try karo:",
    ],
    found: [
      (n, q) => `"${q}" ke liye ${n} option mila${n > 1 ? 'e' : ''} bhai:`,
      (n, q) => `Lo dekho — "${q}" ke liye ${n} product${n > 1 ? 's' : ''} mila${n > 1 ? 'e' : ''}:`,
    ],
  },

  mr: {
    greeting: [
      "नमस्कार! 👋 मी तुमचा शॉपिंग असिस्टंट आहे. काय हवे आहे?",
      "हॅलो! सांगा, आज काय शोधत आहात?",
      "नमस्ते! मी मदत करायला तयार आहे — काय हवं?",
    ],
    fallback: [
      "हे माझ्या तज्ज्ञतेच्या बाहेर आहे. पण कोणताही प्रोडक्ट सांगा!",
      "शॉपिंगसाठी मी इथे आहे. काय हवं ते सांगा.",
    ],
    noResults: [
      "अचूक जुळणी मिळाली नाही, पण हे लोकप्रिय प्रोडक्ट्स पाहा:",
      "सापडले नाही, पण हे पर्याय पाहा:",
    ],
    found: [
      (n, q) => `"${q}" साठी ${n} प्रोडक्ट मिळाले:`,
    ],
  },
};

// Track last response index per intent+lang to avoid repetition
const _lastIndex = {};

/**
 * Pick a response from an array, avoiding the last-used one.
 */
function pickResponse(arr, key) {
  if (arr.length === 1) return arr[0];
  let idx;
  do {
    idx = Math.floor(Math.random() * arr.length);
  } while (idx === _lastIndex[key] && arr.length > 1);
  _lastIndex[key] = idx;
  return arr[idx];
}

/**
 * Generate a natural response message.
 * @param {'greeting'|'chat'|'suggestion'|'fallback'} intent
 * @param {'en'|'hi'|'hinglish'|'mr'} lang
 * @param {number} productCount  — used for suggestion responses
 * @param {string} query         — used for suggestion responses
 * @returns {string}
 */
function generateSentence(intent, lang = 'en', productCount = 0, query = '') {
  const langData = RESPONSES[lang] || RESPONSES.en;

  if (intent === 'greeting') {
    return pickResponse(langData.greeting || RESPONSES.en.greeting, `greeting_${lang}`);
  }

  if (intent === 'fallback' || intent === 'chat') {
    return pickResponse(langData.fallback || RESPONSES.en.fallback, `fallback_${lang}`);
  }

  // suggestion intent
  if (productCount === 0) {
    return pickResponse(langData.noResults || RESPONSES.en.noResults, `noResults_${lang}`);
  }

  const foundTemplates = langData.found || RESPONSES.en.found;
  const template = pickResponse(foundTemplates, `found_${lang}`);
  return typeof template === 'function' ? template(productCount, query) : template;
}

// ─────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────

/**
 * Main entry point for processing a conversation turn.
 * @param {string} query
 * @param {Array} products - Products from DB (empty for non-suggestion intents)
 * @returns {{ message: string, suggestions: Array, metadata: Object }}
 */
function processConversation(query = '', products = []) {
  const language = detectLanguage(query);
  const intent = detectIntent(query, language);

  // Strict rule: products only for suggestion intent
  const suggestions = intent === 'suggestion' ? products : [];
  const message = generateSentence(intent, language, suggestions.length, query);

  return {
    message,
    suggestions,
    metadata: { intent, language, productCount: suggestions.length },
  };
}

module.exports = {
  detectLanguage,
  detectIntent,
  generateSentence,
  processConversation,
};
