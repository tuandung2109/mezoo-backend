const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');

dotenv.config();

// Demo video links (public domain / creative commons videos)
const demoVideos = [
  {
    quality: '1080p',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    size: '158 MB',
    language: 'en',
    subtitle: [
      {
        language: 'vi',
        url: 'https://example.com/subtitle-vi.vtt'
      }
    ]
  },
  {
    quality: '720p',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    size: '85 MB',
    language: 'en'
  },
  {
    quality: '480p',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    size: '45 MB',
    language: 'en'
  }
];

const addDemoVideos = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Get ALL movies
    const movies = await Movie.find();
    
    let updated = 0;
    for (const movie of movies) {
      // Add demo videos if not already present
      if (!movie.videos || movie.videos.length === 0) {
        movie.videos = demoVideos;
        await movie.save();
        updated++;
        console.log(`✅ Added videos to: ${movie.title}`);
      } else {
        console.log(`⏭️  Skipped (already has videos): ${movie.title}`);
      }
    }

    console.log(`\n✅ Successfully added demo videos to ${updated} movies!`);
    console.log('\n📝 Note: These are demo videos for testing purposes.');
    console.log('In production, you should replace with actual movie links.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addDemoVideos();
