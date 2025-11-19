const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkComments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Comment = mongoose.model('Comment', new mongoose.Schema({}, { strict: false }));
    const count = await Comment.countDocuments();
    
    console.log(`Total comments: ${count}`);
    
    if (count > 0) {
      const samples = await Comment.find().limit(3);
      console.log('\nSample comments:');
      samples.forEach((c, i) => {
        console.log(`${i + 1}. ${c.content?.substring(0, 50)}...`);
      });
    } else {
      console.log('No comments found. Run seed script.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

checkComments();
