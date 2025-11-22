require('dotenv').config();
const axios = require('axios');

async function testChat() {
  try {
    console.log('🧪 Testing chatbot with movie query...\n');
    
    const response = await axios.post('https://mezoo-backend.onrender.com/api/chat/send', {
      message: 'Gợi ý phim hành động hay'
    }, {
      timeout: 30000
    });
    
    console.log('✅ Response received!');
    console.log('\n📝 AI Response:');
    console.log(response.data.data.response);
    
    console.log('\n🎬 Movies returned:');
    if (response.data.data.movies && response.data.data.movies.length > 0) {
      response.data.data.movies.forEach((movie, i) => {
        console.log(`\n${i + 1}. ${movie.title}`);
        console.log(`   Rating: ${movie.rating}/10`);
        console.log(`   Genres: ${movie.genres.join(', ')}`);
        console.log(`   ID: ${movie._id}`);
      });
    } else {
      console.log('⚠️ No movies returned!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testChat();
