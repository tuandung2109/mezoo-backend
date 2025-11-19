const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@mozi.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@mozi.com',
      password: 'admin123456',
      fullName: 'Administrator',
      role: 'admin',
      isEmailVerified: true,
      subscription: {
        plan: 'vip',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@mozi.com');
    console.log('Password: admin123456');
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
