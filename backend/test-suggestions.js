const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testConversationalAssistant() {
  console.log('=== TESTING CONVERSATIONAL SHOPPING ASSISTANT ===\n');

  const testCases = [
    // English Tests
    {
      name: 'EN-1: Greeting',
      query: 'Hey there! How are you?',
      limit: 6
    },
    {
      name: 'EN-2: Smalltalk',
      query: 'What can you do? Tell me about yourself',
      limit: 6
    },
    {
      name: 'EN-3: Product Suggestion',
      query: 'suggest laptop under 50000',
      limit: 6
    },
    {
      name: 'EN-4: Shopping Request',
      query: 'I need wireless headphones',
      limit: 6
    },
    
    // Hindi Tests
    {
      name: 'HI-1: Hindi Greeting',
      query: 'नमस्ते! कैसे हो?',
      limit: 6
    },
    {
      name: 'HI-2: Hindi Product Request',
      query: 'मुझे laptop चाहिए under 30000',
      limit: 6
    },
    
    // Hinglish Tests
    {
      name: 'HIN-1: Hinglish Greeting',
      query: 'Hey yaar! Kya haal hai?',
      limit: 6
    },
    {
      name: 'HIN-2: Hinglish Shopping',
      query: 'Bhai mujhe shoes chahiye under 2000',
      limit: 6
    },
    {
      name: 'HIN-3: Hinglish Suggestion',
      query: 'suggest karo koi accha phone',
      limit: 6
    },
    
    // Edge Cases
    {
      name: 'EDGE-1: Empty Query',
      query: '',
      limit: 6
    },
    {
      name: 'EDGE-2: Unknown Intent',
      query: 'What is the meaning of life?',
      limit: 6
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(testCase.name);
    console.log(`${'='.repeat(70)}`);
    console.log('Query:', testCase.query);

    try {
      const startTime = Date.now();
      const response = await axios.post(`${BASE_URL}/suggestions`, testCase);
      const endTime = Date.now();
      
      console.log('\n✅ SUCCESS - Status:', response.status);
      console.log('Response Time:', endTime - startTime, 'ms');
      console.log('Response:', {
        success: response.data.success,
        hasData: !!response.data.data,
        suggestionCount: response.data.data?.suggestions?.length || 0,
        message: response.data.data?.message?.substring(0, 100) + '...',
        metadata: response.data.data?.metadata
      });

      if (response.data.data?.suggestions?.length > 0) {
        console.log('\n📦 First product:', {
          name: response.data.data.suggestions[0].name,
          price: response.data.data.suggestions[0].price,
          category: response.data.data.suggestions[0].category
        });
      }

    } catch (error) {
      console.error('\n❌ FAILED - Status:', error.response?.status || 'Network Error');
      console.error('Error:', error.response?.data?.message || error.message);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('=== ALL TESTS COMPLETE ===');
}

testConversationalAssistant().catch(console.error);
