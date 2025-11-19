const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

const checkGenres = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const totalGenres = await Genre.countDocuments();
    const activeGenres = await Genre.countDocuments({ isActive: true });

    console.log('📊 STATISTICS:');
    console.log(`   Total genres: ${totalGenres}`);
    console.log(`   Active: ${activeGenres}`);
    console.log(`   Inactive: ${totalGenres - activeGenres}`);

    if (totalGenres > 0) {
      console.log('\n🏷️  ALL GENRES:');
      const genres = await Genre.find().sort({ name: 1 });
      
      for (const genre of genres) {
        const movieCount = await Movie.countDocuments({ 
          genres: genre.name,
          isPublished: true 
        });
        console.log(`   ${genre.icon || '📁'} ${genre.name} (${genre.slug}) - ${movieCount} phim - ${genre.isActive ? '✅' : '❌'}`);
      }

      // Top genres
      const topGenres = await Genre.find().sort({ movieCount: -1 }).limit(3);
      console.log('\n🔥 TOP GENRES:');
      topGenres.forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.name}: ${g.movieCount} phim`);
      });
    } else {
      console.log('\n⚠️  No genres found!');
      console.log('Run seed script to add genres.');
    }

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkGenres();
