const { detectLanguage, detectIntent, processConversation } = require('./utils/assistant');

console.log('=== TESTING INTENT DETECTION ===\n');

const testCases = [
  // Should be greeting
  { query: 'hi', expected: 'greeting' },
  { query: 'hello', expected: 'greeting' },
  { query: 'hey', expected: 'greeting' },
  { query: 'Hey there!', expected: 'greeting' },
  { query: 'Good morning', expected: 'greeting' },
  
  // Should be smalltalk
  { query: 'how are you', expected: 'smalltalk' },
  { query: 'What are you doing', expected: 'smalltalk' },
  { query: 'who are you', expected: 'smalltalk' },
  { query: 'help me', expected: 'smalltalk' },
  
  // Should be suggestion
  { query: 'suggest laptop', expected: 'suggestion' },
  { query: 'I need shoes', expected: 'suggestion' },
  { query: 'show me headphones', expected: 'suggestion' },
  { query: 'laptop under 50000', expected: 'suggestion' },
  { query: 'recommend phone', expected: 'suggestion' },
  
  // Should be unknown
  { query: 'what is the meaning of life', expected: 'unknown' },
  { query: 'tell me a joke', expected: 'unknown' },
  { query: 'weather today', expected: 'unknown' },
];

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const language = detectLanguage(test.query);
  const intent = detectIntent(test.query, language);
  const status = intent === test.expected ? '✅ PASS' : '❌ FAIL';
  
  if (intent === test.expected) {
    passed++;
  } else {
    failed++;
  }
  
  console.log(`${status} | Query: "${test.query}"`);
  console.log(`   Language: ${language}, Intent: ${intent}, Expected: ${test.expected}\n`);
}

console.log(`\n=== RESULTS ===`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);

if (failed > 0) {
  console.log('\n⚠️  Some tests failed. Review intent detection logic.');
} else {
  console.log('\n✅ All tests passed! Intent detection working correctly.');
}
