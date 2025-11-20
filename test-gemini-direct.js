const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_KEY = process.env.GEMINI_API_KEY;

console.log('🔑 API Key:', API_KEY ? `${API_KEY.substring(0, 20)}...` : 'NOT FOUND');
console.log('');

async function testGemini() {
  try {
    console.log('📡 Testing Gemini API...');
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Xin chào! Bạn là ai?'
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Success!');
    console.log('');
    console.log('🤖 Response:');
    console.log('─'.repeat(60));
    console.log(response.data.candidates[0].content.parts[0].text);
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGemini();
