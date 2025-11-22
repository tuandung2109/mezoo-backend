const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const API_URL = 'http://localhost:5000/api';

const questions = [
  'mezoo là gì?',
  'Các gói đăng ký có gì khác nhau?',
  'Gói Premium có những tính năng gì?',
  'Làm sao để thêm phim vào yêu thích?',
  'Tôi có thể tải phim về xem offline không?',
  'mezoo có bao nhiêu thể loại phim?',
  'Làm sao để xem lịch sử phim đã xem?',
  'Gợi ý phim hành động hay cho tôi',
  'Tìm phim kinh dị',
  'Avengers nói về gì?'
];

async function testQuestions() {
  try {
    // Login
    console.log('🔐 Logging in...\n');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@mezoo.com',
      password: 'admin123456'
    });
    
    const token = loginRes.data.data.token;
    console.log('✅ Login successful!\n');
    console.log('='.repeat(80));

    // Test each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n${i + 1}. 👤 User: ${question}`);
      console.log('-'.repeat(80));

      try {
        const chatRes = await axios.post(
          `${API_URL}/chat`,
          {
            message: question,
            sessionId: 'test-mezoo-features'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        console.log(`🤖 Bot: ${chatRes.data.data.message}`);
        console.log(`📊 Intent: ${chatRes.data.data.intent}`);

        if (chatRes.data.data.recommendedMovies?.length > 0) {
          console.log(`\n🎬 Recommended Movies:`);
          chatRes.data.data.recommendedMovies.forEach((movie, idx) => {
            console.log(`   ${idx + 1}. ${movie.title} (⭐ ${movie.rating.average.toFixed(1)})`);
          });
        }

        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }

      console.log('='.repeat(80));
    }

    console.log('\n🎉 Test completed!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

testQuestions();
