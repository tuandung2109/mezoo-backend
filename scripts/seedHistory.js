const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Movie = require('../models/Movie');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getRandomProgress = () => {
  // Random progress: 10-100%
  return Math.floor(Math.random() * 90) + 10;
};

const getRandomDate = () => {
  // Random date within last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (Date.now() - thirtyDaysAgo.getTime()));
};

const seedHistory = async () => {
  try {
    await connectDB();

    console.log('🎬 Fetching movies...');
    const movies = await Movie.find({}).limit(20);
    
    if (movies.length === 0) {
      console.log('⚠️  No movies found');
      process.exit(0);
    }

    console.log('👥 Fetching users...');
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('⚠️  No users found');
      process.exit(0);
    }

    console.log(`Found ${users.length} users and ${movies.length} movies`);
    console.log('📺 Adding watch history...');

    let historyCount = 0;

    for (const user of users) {
      // Clear existing history
      user.watchHistory = [];

      // Add 5-10 random movies to history
      const numMovies = Math.floor(Math.random() * 6) + 5;
      const shuffledMovies = [...movies].sort(() => Math.random() - 0.5);
      const watchedMovies = shuffledMovies.slice(0, numMovies);

      for (const movie of watchedMovies) {
        const progress = getRandomProgress();
        user.watchHistory.push({
          movie: movie._id,
          watchedAt: getRandomDate(),
          progress: progress,
          completed: progress >= 90
        });
        historyCount++;
      }

      // Sort by watchedAt descending (newest first)
      user.watchHistory.sort((a, b) => b.watchedAt - a.watchedAt);

      await user.save();
      console.log(`✅ Added ${watchedMovies.length} movies to ${user.username}'s history`);
    }

    console.log('\n✨ Seed completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Total history entries: ${historyCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding history:', error);
    process.exit(1);
  }
};

seedHistory();
