const { detectLanguage, detectIntent, generateSentence, processConversation } = require('./utils/assistant');

console.log('=== TESTING WORD-BASED SENTENCE GENERATION ===\n');

// Test 1: Multiple greetings should generate different responses
console.log('TEST 1: Response Randomization (5x "hi")');
console.log('=' .repeat(60));
const responses = new Set();
for (let i = 0; i < 5; i++) {
  const result = processConversation('hi', []);
  responses.add(result.message);
  console.log(`Response ${i + 1}: ${result.message.substring(0, 80)}...`);
}
console.log(`Unique responses: ${responses.size}/5\n`);

// Test 2: All languages
console.log('\nTEST 2: Multi-Language Support');
console.log('=' .repeat(60));

const testCases = [
  { query: 'Hey there! How are you?', lang: 'en', intent: 'greeting' },
  { query: 'नमस्ते! कैसे हो?', lang: 'hi', intent: 'greeting' },
  { query: 'Hey yaar! Kya haal hai?', lang: 'hinglish', intent: 'greeting' },
  { query: 'नमस्कार! कसे आहात?', lang: 'mr', intent: 'greeting' },
  { query: 'suggest laptop under 50000', lang: 'en', intent: 'suggestion' },
  { query: 'मुझे laptop चाहिए', lang: 'hi', intent: 'suggestion' },
  { query: 'Bhai shoes chahiye', lang: 'hinglish', intent: 'suggestion' },
  { query: 'मला laptop हवं', lang: 'mr', intent: 'suggestion' }
];

for (const test of testCases) {
  const detectedLang = detectLanguage(test.query);
  const detectedIntent = detectIntent(test.query, detectedLang);
  const message = generateSentence(detectedIntent, detectedLang, 6);
  
  console.log(`\nQuery: "${test.query}"`);
  console.log(`Language: ${detectedLang} (expected: ${test.lang})`);
  console.log(`Intent: ${detectedIntent} (expected: ${test.intent})`);
  console.log(`Response: ${message}`);
}

// Test 3: Verify suggestions are empty for non-suggestion intents
console.log('\n\nTEST 3: Strict Product Suggestion Rule');
console.log('=' .repeat(60));

const nonSuggestionQueries = [
  'hi',
  'hello',
  'how are you',
  'what are you doing',
  'tell me a joke',
  'what is the meaning of life'
];

let allPass = true;
for (const query of nonSuggestionQueries) {
  const result = processConversation(query, []);
  const hasProducts = result.suggestions.length > 0;
  const status = !hasProducts ? '✅ PASS' : '❌ FAIL';
  
  if (hasProducts) allPass = false;
  
  console.log(`${status} | "${query}" → ${result.suggestions.length} products`);
}

console.log('\n' + (allPass ? '✅ All non-suggestion queries return 0 products' : '❌ Some queries incorrectly return products'));

// Test 4: Sentence pattern variety
console.log('\n\nTEST 4: Sentence Pattern Variety');
console.log('=' .repeat(60));

const intents = ['greeting', 'smalltalk', 'suggestion', 'unknown'];
const languages = ['en', 'hi', 'hinglish', 'mr'];

for (const lang of languages) {
  console.log(`\nLanguage: ${lang}`);
  for (const intent of intents) {
    const sentence = generateSentence(intent, lang, 6);
    console.log(`  ${intent}: ${sentence.substring(0, 70)}...`);
  }
}

console.log('\n\n=== ALL TESTS COMPLETE ===');
