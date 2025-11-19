const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const Comment = require('../models/Comment');
const Playlist = require('../models/Playlist');
const Notification = require('../models/Notification');
const { SubscriptionPlan } = require('../models/Subscription');

dotenv.config();

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    // Get existing data
    const movies = await Movie.find().limit(10);
    const admin = await User.findOne({ email: 'admin@mozi.com' });

    if (movies.length === 0) {
      console.log('❌ No movies found. Please import movies first!');
      process.exit(1);
    }

    // 1. Create demo users
    console.log('1️⃣ Creating demo users...');
    const demoUsers = [];
    const usernames = ['john_doe', 'jane_smith', 'mike_wilson', 'sarah_jones', 'david_brown'];
    
    for (let i = 0; i < usernames.length; i++) {
      const existingUser = await User.findOne({ username: usernames[i] });
      if (!existingUser) {
        const user = await User.create({
          username: usernames[i],
          email: `${usernames[i]}@example.com`,
          password: 'demo123456',
          fullName: usernames[i].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          avatar: `https://i.pravatar.cc/150?u=${usernames[i]}`,
          subscription: {
            plan: ['free', 'basic', 'premium'][i % 3],
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });
        demoUsers.push(user);
        console.log(`   ✅ Created user: ${user.username}`);
      } else {
        demoUsers.push(existingUser);
        console.log(`   ⏭️  User exists: ${existingUser.username}`);
      }
    }

    // 2. Create subscription plans
    console.log('\n2️⃣ Creating subscription plans...');
    const plans = [
      {
        name: 'free',
        displayName: 'Miễn phí',
        price: { monthly: 0, yearly: 0 },
        features: [
          { name: 'Xem phim có quảng cáo', included: true },
          { name: 'Chất lượng 480p', included: true },
          { name: 'Xem trên 1 thiết bị', included: true },
          { name: 'Tải xuống', included: false }
        ],
        limits: {
          maxQuality: '480p',
          downloadLimit: 0,
          simultaneousStreams: 1,
          adsEnabled: true
        }
      },
      {
        name: 'basic',
        displayName: 'Cơ bản',
        price: { monthly: 70000, yearly: 700000 },
        features: [
          { name: 'Xem phim không quảng cáo', included: true },
          { name: 'Chất lượng 720p', included: true },
          { name: 'Xem trên 2 thiết bị', included: true },
          { name: 'Tải xuống 10 phim', included: true }
        ],
        limits: {
          maxQuality: '720p',
          downloadLimit: 10,
          simultaneousStreams: 2,
          adsEnabled: false
        }
      },
      {
        name: 'premium',
        displayName: 'Cao cấp',
        price: { monthly: 120000, yearly: 1200000 },
        features: [
          { name: 'Xem phim không quảng cáo', included: true },
          { name: 'Chất lượng 1080p', included: true },
          { name: 'Xem trên 4 thiết bị', included: true },
          { name: 'Tải xuống không giới hạn', included: true }
        ],
        limits: {
          maxQuality: '1080p',
          downloadLimit: -1,
          simultaneousStreams: 4,
          adsEnabled: false
        }
      },
      {
        name: 'vip',
        displayName: 'VIP',
        price: { monthly: 200000, yearly: 2000000 },
        features: [
          { name: 'Xem phim không quảng cáo', included: true },
          { name: 'Chất lượng 4K', included: true },
          { name: 'Xem không giới hạn thiết bị', included: true },
          { name: 'Tải xuống không giới hạn', included: true },
          { name: 'Xem trước phim mới', included: true }
        ],
        limits: {
          maxQuality: '4k',
          downloadLimit: -1,
          simultaneousStreams: -1,
          adsEnabled: false
        }
      }
    ];

    for (const planData of plans) {
      const existing = await SubscriptionPlan.findOne({ name: planData.name });
      if (!existing) {
        await SubscriptionPlan.create(planData);
        console.log(`   ✅ Created plan: ${planData.displayName}`);
      } else {
        console.log(`   ⏭️  Plan exists: ${planData.displayName}`);
      }
    }

    // 3. Create reviews
    console.log('\n3️⃣ Creating reviews...');
    const reviewTexts = [
      { title: 'Phim hay!', content: 'Một bộ phim tuyệt vời với cốt truyện hấp dẫn và diễn xuất xuất sắc. Rất đáng xem!', rating: 9 },
      { title: 'Tạm ổn', content: 'Phim khá hay nhưng có một số điểm chưa thực sự thuyết phục. Nhìn chung vẫn đáng xem.', rating: 7 },
      { title: 'Xuất sắc!', content: 'Đây là một trong những bộ phim hay nhất tôi từng xem. Kỹ xảo đỉnh cao, diễn xuất tuyệt vời!', rating: 10 },
      { title: 'Không như kỳ vọng', content: 'Phim có tiềm năng nhưng khai thác chưa tốt. Hơi thất vọng so với mong đợi.', rating: 6 },
      { title: 'Rất thích!', content: 'Cốt truyện cuốn hút, nhân vật được xây dựng tốt. Một bộ phim đáng nhớ!', rating: 8.5 }
    ];

    let reviewCount = 0;
    for (let i = 0; i < Math.min(movies.length, 5); i++) {
      for (let j = 0; j < Math.min(demoUsers.length, 3); j++) {
        const existing = await Review.findOne({ 
          user: demoUsers[j]._id, 
          movie: movies[i]._id 
        });
        
        if (!existing) {
          const reviewData = reviewTexts[j % reviewTexts.length];
          await Review.create({
            user: demoUsers[j]._id,
            movie: movies[i]._id,
            rating: reviewData.rating,
            title: reviewData.title,
            content: reviewData.content,
            spoiler: false
          });
          reviewCount++;
        }
      }
    }
    console.log(`   ✅ Created ${reviewCount} reviews`);

    // 4. Create comments
    console.log('\n4️⃣ Creating comments...');
    const commentTexts = [
      'Phim này hay quá! Ai xem rồi chưa?',
      'Mình vừa xem xong, cảm động quá!',
      'Diễn viên chính diễn xuất rất tốt',
      'Phần kết thúc hơi bất ngờ nhỉ',
      'Đợi phần 2 quá!',
      'Nhạc phim cũng hay nữa',
      'Kỹ xảo đỉnh thật sự',
      'Xem đi xem lại vẫn thích'
    ];

    let commentCount = 0;
    for (let i = 0; i < Math.min(movies.length, 5); i++) {
      for (let j = 0; j < Math.min(demoUsers.length, 4); j++) {
        await Comment.create({
          user: demoUsers[j]._id,
          movie: movies[i]._id,
          content: commentTexts[(i + j) % commentTexts.length]
        });
        commentCount++;
      }
    }
    console.log(`   ✅ Created ${commentCount} comments`);

    // 5. Create playlists
    console.log('\n5️⃣ Creating playlists...');
    const playlistNames = [
      { name: 'Phim yêu thích', desc: 'Những bộ phim tôi thích nhất' },
      { name: 'Xem sau', desc: 'Danh sách phim định xem' },
      { name: 'Phim hành động hay', desc: 'Collection phim hành động đỉnh cao' }
    ];

    let playlistCount = 0;
    for (let i = 0; i < Math.min(demoUsers.length, 3); i++) {
      const existing = await Playlist.findOne({ 
        user: demoUsers[i]._id,
        name: playlistNames[i].name
      });
      
      if (!existing) {
        await Playlist.create({
          user: demoUsers[i]._id,
          name: playlistNames[i].name,
          description: playlistNames[i].desc,
          movies: movies.slice(0, 5).map(m => ({ movie: m._id })),
          isPublic: i === 2,
          thumbnail: movies[0].poster
        });
        playlistCount++;
        console.log(`   ✅ Created playlist: ${playlistNames[i].name}`);
      }
    }

    // 6. Add favorites and watchlist
    console.log('\n6️⃣ Adding favorites and watchlist...');
    for (let i = 0; i < demoUsers.length; i++) {
      const user = demoUsers[i];
      user.favorites = movies.slice(0, 3).map(m => m._id);
      user.watchlist = movies.slice(3, 6).map(m => ({ movie: m._id }));
      user.watchHistory = movies.slice(0, 2).map((m, idx) => ({
        movie: m._id,
        progress: 50 + idx * 20,
        completed: idx === 0
      }));
      await user.save();
      console.log(`   ✅ Updated user: ${user.username}`);
    }

    // 7. Create notifications
    console.log('\n7️⃣ Creating notifications...');
    const notificationTypes = [
      { type: 'new_movie', title: 'Phim mới', message: `Phim "${movies[0].title}" vừa được thêm vào!` },
      { type: 'comment_reply', title: 'Có người trả lời', message: 'Có người đã trả lời bình luận của bạn' },
      { type: 'review_like', title: 'Đánh giá được thích', message: 'Đánh giá của bạn nhận được 5 lượt thích' },
      { type: 'system', title: 'Chào mừng!', message: 'Chào mừng bạn đến với Mozi!' }
    ];

    let notifCount = 0;
    for (let i = 0; i < demoUsers.length; i++) {
      for (let j = 0; j < 2; j++) {
        const notif = notificationTypes[j % notificationTypes.length];
        await Notification.create({
          user: demoUsers[i]._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          relatedMovie: movies[0]._id,
          isRead: j === 0
        });
        notifCount++;
      }
    }
    console.log(`   ✅ Created ${notifCount} notifications`);

    console.log('\n✅ ========================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('✅ ========================================\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${demoUsers.length} demo users`);
    console.log(`   - Subscription Plans: 4 plans`);
    console.log(`   - Reviews: ${reviewCount} reviews`);
    console.log(`   - Comments: ${commentCount} comments`);
    console.log(`   - Playlists: ${playlistCount} playlists`);
    console.log(`   - Notifications: ${notifCount} notifications`);
    console.log('\n🎉 All collections are now visible in MongoDB!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAll();
