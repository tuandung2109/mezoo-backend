require('dotenv').config();
const axios = require('axios');

async function testSpecificMovie() {
  try {
    console.log('🧪 Testing chatbot with specific movie query...\n');
    
    const testMessages = [
      'Tuyệt vời! Mọi thứ về phim "Frankenstein (2025)" mà bạn đang tìm kiếm đều có ở đây!',
      'phim Frankenstein',
      'Cho tôi biết về Frankenstein',
      'Frankenstein là gì'
    ];
    
    const message = testMessages[1]; // Test with second message
    console.log('📝 Testing message:', message, '\n');
    
    const response = await axios.post('http://localhost:5000/api/chat/send', {
      message: message
    }, {
      timeout: 30000
    });
    
    console.log('✅ Response received!');
    console.log('\n📝 AI Response:');
    console.log(response.data.data.response);
    
    console.log('\n🎬 Movies returned:', response.data.data.movies?.length || 0);
    if (response.data.data.movies && response.data.data.movies.length > 0) {
      response.data.data.movies.forEach((movie, i) => {
        console.log(`\n${i + 1}. ${movie.title}`);
        console.log(`   Rating: ${movie.rating}/10`);
        console.log(`   Genres: ${movie.genres.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSpecificMovie();
