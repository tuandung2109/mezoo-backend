require('dotenv').config();
const mongoose = require('mongoose');
const Movie = require('./models/Movie');

async function checkMovies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mezoo');
    console.log('✅ Connected to MongoDB');
    
    const count = await Movie.countDocuments();
    console.log(`\n📊 Tổng số phim: ${count}`);
    
    if (count > 0) {
      console.log('\n🎬 5 phim đầu tiên:');
      const movies = await Movie.find()
        .limit(5)
        .select('title genres rating.average');
      
      movies.forEach((m, i) => {
        console.log(`${i + 1}. ${m.title}`);
        console.log(`   Thể loại: ${m.genres.join(', ')}`);
        console.log(`   Rating: ${m.rating?.average || 'N/A'}/10\n`);
      });
    } else {
      console.log('\n⚠️ Database chưa có phim nào!');
      console.log('Hãy vào trang Admin để import phim từ TMDB');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkMovies();
