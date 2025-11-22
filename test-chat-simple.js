const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testChat() {
  try {
    console.log('🔐 Step 1: Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mezoo.com',
      password: 'admin123456'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Login successful!');
    console.log(`   User: ${loginRes.data.data.username}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');

    console.log('💬 Step 2: Send chat message...');
    const chatRes = await axios.post(
      `${API_URL}/chat`,
      {
        message: 'Xin chào! Gợi ý phim hành động hay cho tôi',
        sessionId: 'test-session'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Chat response received!');
    console.log('');
    console.log('🤖 Bot reply:');
    console.log('─'.repeat(60));
    console.log(chatRes.data.data.message);
    console.log('─'.repeat(60));
    console.log('');

    if (chatRes.data.data.recommendedMovies?.length > 0) {
      console.log('🎬 Recommended Movies:');
      chatRes.data.data.recommendedMovies.forEach((movie, i) => {
        console.log(`   ${i + 1}. ${movie.title} (⭐ ${movie.rating.average.toFixed(1)})`);
      });
      console.log('');
    }

    console.log(`📊 Intent detected: ${chatRes.data.data.intent}`);
    console.log('');
    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testChat();
