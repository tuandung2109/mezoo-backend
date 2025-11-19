const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

dotenv.config();

// Sample users data
const sampleUsers = [
  {
    username: 'phimfan123',
    email: 'phimfan123@example.com',
    password: '123456',
    fullName: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    username: 'moviecritic',
    email: 'moviecritic@example.com',
    password: '123456',
    fullName: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    username: 'cinephile',
    email: 'cinephile@example.com',
    password: '123456',
    fullName: 'Lê Văn C',
    avatar: 'https://i.pravatar.cc/150?img=3'
  },
  {
    username: 'filmreview',
    email: 'filmreview@example.com',
    password: '123456',
    fullName: 'Phạm Thị D',
    avatar: 'https://i.pravatar.cc/150?img=4'
  },
  {
    username: 'movielover',
    email: 'movielover@example.com',
    password: '123456',
    fullName: 'Hoàng Văn E',
    avatar: 'https://i.pravatar.cc/150?img=5'
  }
];

// Sample review comments
const reviewComments = [
  'Phim hay tuyệt vời! Diễn xuất xuất sắc, cốt truyện hấp dẫn.',
  'Một bộ phim đáng xem! Hình ảnh đẹp, âm nhạc hay.',
  'Phim khá ổn nhưng hơi dài dòng một chút.',
  'Tuyệt tác điện ảnh! Đáng xem nhiều lần.',
  'Phim hay nhưng kết thúc hơi vội vàng.',
  'Diễn xuất tốt, cốt truyện cuốn hút từ đầu đến cuối.',
  'Một bộ phim đầy cảm xúc, rất đáng xem!',
  'Phim hay nhưng có một số chi tiết chưa hợp lý.',
  'Xuất sắc! Đạo diễn đã làm rất tốt.',
  'Phim ổn, phù hợp để giải trí cuối tuần.',
  'Cốt truyện sâu sắc, diễn xuất chân thật.',
  'Một bộ phim đáng nhớ! Highly recommended.',
  'Phim hay nhưng hơi chậm ở giữa.',
  'Tuyệt vời! Mỗi phút đều đáng giá.',
  'Phim khá tốt, xứng đáng với rating cao.',
  'Diễn xuất xuất sắc, đặc biệt là diễn viên chính.',
  'Một bộ phim đầy bất ngờ và thú vị!',
  'Phim hay nhưng không phải là kiệt tác.',
  'Rất thích! Sẽ xem lại nhiều lần.',
  'Phim ổn, phù hợp với thể loại này.'
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getRandomRating = () => {
  // Weighted random: more 4-5 stars, less 1-2 stars
  const rand = Math.random();
  if (rand < 0.4) return 5;
  if (rand < 0.7) return 4;
  if (rand < 0.85) return 3;
  if (rand < 0.95) return 2;
  return 1;
};

const getRandomComment = () => {
  return reviewComments[Math.floor(Math.random() * reviewComments.length)];
};

const getRandomDate = () => {
  // Random date within last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
  return new Date(sixMonthsAgo.getTime() + Math.random() * (Date.now() - sixMonthsAgo.getTime()));
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing reviews...');
    await Review.deleteMany({});

    console.log('👥 Creating sample users...');
    // Check if users already exist
    let users = [];
    for (const userData of sampleUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`✅ Created user: ${user.username}`);
      } else {
        console.log(`ℹ️  User already exists: ${user.username}`);
      }
      users.push(user);
    }

    console.log('🎬 Fetching all movies...');
    const movies = await Movie.find({});
    console.log(`Found ${movies.length} movies`);

    if (movies.length === 0) {
      console.log('⚠️  No movies found in database. Please add movies first.');
      process.exit(0);
    }

    console.log('⭐ Creating reviews...');
    let reviewCount = 0;

    for (const movie of movies) {
      // Random number of reviews per movie (2-5 reviews)
      const numReviews = Math.floor(Math.random() * 4) + 2;
      
      // Shuffle users and pick random ones
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      const reviewers = shuffledUsers.slice(0, Math.min(numReviews, users.length));

      for (const user of reviewers) {
        try {
          const review = await Review.create({
            movie: movie._id,
            user: user._id,
            rating: getRandomRating(),
            comment: getRandomComment(),
            helpful: [], // Start with no helpful votes
            createdAt: getRandomDate(),
            updatedAt: getRandomDate()
          });

          // Randomly add helpful votes from other users
          const helpfulCount = Math.floor(Math.random() * 3); // 0-2 helpful votes
          const otherUsers = users.filter(u => u._id.toString() !== user._id.toString());
          const helpfulUsers = otherUsers.sort(() => Math.random() - 0.5).slice(0, helpfulCount);
          review.helpful = helpfulUsers.map(u => u._id);
          await review.save();

          reviewCount++;
          console.log(`✅ Review ${reviewCount}: ${user.username} reviewed "${movie.title}"`);
        } catch (error) {
          // Skip if duplicate (user already reviewed this movie)
          if (error.code === 11000) {
            console.log(`⚠️  ${user.username} already reviewed "${movie.title}"`);
          } else {
            console.error(`❌ Error creating review: ${error.message}`);
          }
        }
      }
    }

    console.log('\n✨ Seed completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Movies: ${movies.length}`);
    console.log(`   - Reviews created: ${reviewCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
