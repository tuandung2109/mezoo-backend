const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Comment = require('../models/Comment');
const User = require('../models/User');
const Movie = require('../models/Movie');

const checkComments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const totalComments = await Comment.countDocuments();
    const deletedComments = await Comment.countDocuments({ isDeleted: true });
    const activeComments = totalComments - deletedComments;
    const repliesCount = await Comment.countDocuments({ parentComment: { $ne: null } });

    console.log('📊 STATISTICS:');
    console.log(`   Total comments: ${totalComments}`);
    console.log(`   Active: ${activeComments}`);
    console.log(`   Deleted: ${deletedComments}`);
    console.log(`   Replies: ${repliesCount}`);

    console.log('\n💬 SAMPLE COMMENTS:');
    const samples = await Comment.find({ isDeleted: false })
      .populate('user', 'username')
      .populate('movie', 'title')
      .limit(5);

    samples.forEach((c, i) => {
      console.log(`\n${i + 1}. Movie: ${c.movie?.title || 'N/A'}`);
      console.log(`   User: ${c.user?.username || 'N/A'}`);
      console.log(`   Content: ${c.content.substring(0, 60)}...`);
      console.log(`   Likes: ${c.likes.length} | Replies: ${c.replies.length}`);
    });

    // Most active commenter
    const topCommenter = await Comment.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    if (topCommenter.length > 0) {
      const user = await User.findById(topCommenter[0]._id);
      console.log(`\n🏆 Most active commenter: ${user?.username} (${topCommenter[0].count} comments)`);
    }

    // Most commented movie
    const topMovie = await Comment.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$movie', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    if (topMovie.length > 0) {
      const movie = await Movie.findById(topMovie[0]._id);
      console.log(`🎬 Most commented movie: ${movie?.title} (${topMovie[0].count} comments)`);
    }

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkComments();
