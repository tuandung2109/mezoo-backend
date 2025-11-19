const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config();

const addYouTubeTrailers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get all movies that have trailer.youtube
    const movies = await Movie.find({ 'trailer.youtube': { $exists: true, $ne: null } });
    
    console.log(`Found ${movies.length} movies with YouTube trailers\n`);

    let updated = 0;
    for (const movie of movies) {
      if (movie.trailer.youtube) {
        // Create YouTube URL from trailer ID
        const youtubeUrl = `https://www.youtube.com/watch?v=${movie.trailer.youtube}`;
        
        // Update videos array with YouTube trailer
        movie.videos = [
          {
            quality: '1080p',
            url: youtubeUrl,
            size: 'HD',
            language: 'vi'
          },
          {
            quality: '720p',
            url: youtubeUrl,
            size: 'HD',
            language: 'vi'
          },
          {
            quality: '480p',
            url: youtubeUrl,
            size: 'SD',
            language: 'vi'
          }
        ];

        await movie.save();
        updated++;
        console.log(`✅ Added YouTube trailer to: ${movie.title}`);
        console.log(`   URL: ${youtubeUrl}\n`);
      }
    }

    console.log(`\n✅ Successfully updated ${updated} movies with YouTube trailers!`);
    console.log('\n📝 Note: All quality options point to the same YouTube video.');
    console.log('YouTube will automatically adjust quality based on connection.');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addYouTubeTrailers();
