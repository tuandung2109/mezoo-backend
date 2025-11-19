const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Comment = require('../models/Comment');

dotenv.config();

const checkComments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mozi');
    console.log('✅ Connected to MongoDB');

    const totalComments = await Comment.countDocuments();
    console.log(`\n📊 Total comments: ${totalComments}`);

    if (totalComments > 0) {
      const sampleComments = await Comment.find()
        .populate('user', 'username email')
        .populate('movie', 'title')
        .limit(5);

      console.log('\n💬 Sample comments:');
      sampleComments.forEach((comment, index) => {
        console.log(`\n${index + 1}. ${comment.movie?.title || 'Unknown Movie'}`);
        console.log(`   User: ${comment.user?.username || 'Unknown User'}`);
        console.log(`   Content: ${comment.content.substring(0, 50)}...`);
        console.log(`   Likes: ${comment.likes.length}`);
        console.log(`   Deleted: ${comment.isDeleted ? 'Yes' : 'No'}`);
      });

      // Stats
      const deletedCount = await Comment.countDocuments({ isDeleted: true });
      const repliesCount = await Comment.countDocuments({ parentComment: { $ne: null } });
      
      console.log('\n📈 Statistics:');
      console.log(`   Active comments: ${totalComments - deletedCount}`);
      console.log(`   Deleted comments: ${deletedCount}`);
      console.log(`   Replies: ${repliesCount}`);
    } else {
      console.log('\n⚠️  No comments found in database!');
      console.log('You may need to seed comment data.');
    }

    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkComments();
