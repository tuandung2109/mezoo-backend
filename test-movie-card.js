require('dotenv').config();
const axios = require('axios');

async function testMovieCard() {
  const testCases = [
    { name: 'Phim cụ thể - ngắn', message: 'Avengers 4', expectedCards: 1 },
    { name: 'Phim cụ thể - có "phim"', message: 'phim Frankenstein', expectedCards: 1 },
    { name: 'Phim cụ thể - tên đơn', message: 'Avengers', expectedCards: 1 },
    { name: 'Phim F1', message: 'F1 Phim Điện Ảnh', expectedCards: 1 },
    { name: 'Thể loại', message: 'Gợi ý phim hành động', expectedCards: 5 }
  ];

  for (const test of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TEST: ${test.name}`);
    console.log(`📝 Message: "${test.message}"`);
    console.log(`🎯 Expected: ${test.expectedCards} card(s)`);
    console.log('='.repeat(60));

    try {
      const response = await axios.post('http://localhost:5000/api/chat/send', {
        message: test.message
      }, {
        timeout: 30000
      });

      const movies = response.data.data.movies || [];
      const success = movies.length === test.expectedCards;

      console.log(`\n${success ? '✅' : '❌'} Result: ${movies.length} card(s) returned`);
      
      if (movies.length > 0) {
        console.log('\n🎬 Movies:');
        movies.forEach((movie, i) => {
          console.log(`  ${i + 1}. ${movie.title}`);
          console.log(`     Rating: ${movie.rating}/10`);
          console.log(`     Genres: ${movie.genres.join(', ')}`);
          console.log(`     Poster: ${movie.poster ? '✓' : '✗'}`);
          console.log(`     ID: ${movie._id}`);
        });
      } else {
        console.log('\n⚠️ No movies returned!');
      }

      console.log(`\n📝 AI Response (first 200 chars):`);
      console.log(response.data.data.response.substring(0, 200) + '...');

    } catch (error) {
      console.error(`\n❌ Error:`, error.response?.data || error.message);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
}

testMovieCard();
