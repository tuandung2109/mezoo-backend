require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Mock data giả lập phản hồi từ Google
const mockGooglePayload = {
  email: 'test_google_user_v2@example.com', // Email test
  name: 'Test Google User',
  picture: 'https://via.placeholder.com/150',
  sub: '1234567890_google_id_test' // googleId giả định
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

async function testGoogleLogin() {
  console.log('⏳ 1. Đang kết nối MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB.');
  } catch (err) {
    console.error('❌ Lỗi kết nối DB:', err);
    return;
  }

  try {
    console.log('🔄 2. Giả lập đăng nhập Google với payload:', mockGooglePayload);
    
    const { email, name, picture, sub: googleId } = mockGooglePayload;
    const provider = 'google';

    // --- BẮT ĐẦU LOGIC TỪ authController.js ---
    
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      console.log('ℹ️  User đã tồn tại trong DB.');
      // Update existing user with social ID if missing
      if (provider === 'google' && !user.googleId) {
        console.log('✏️  Đang cập nhật googleId cho user...');
        user.googleId = googleId;
        if (user.authProvider === 'local') user.authProvider = 'google'; 
        await user.save();
        console.log('✅ Đã cập nhật user.');
      } else {
        console.log('ℹ️  User đã có googleId, không cần cập nhật.');
      }
    } else {
      console.log('🆕 User chưa tồn tại. Đang tạo mới...');
      // Create new user
      let username = email.split('@')[0];
      let usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username += Math.floor(Math.random() * 1000);
      }

      user = await User.create({
        username,
        email,
        fullName: name,
        avatar: picture,
        authProvider: provider,
        googleId: googleId
      });
      console.log('✅ Đã tạo user mới thành công:', user.username);
    }

    // --- KẾT THÚC LOGIC ---

    const token = generateToken(user._id);
    console.log('\n🎉 3. ĐĂNG NHẬP THÀNH CÔNG!');
    console.log('------------------------------------------------');
    console.log('User ID:', user._id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Auth Provider:', user.authProvider);
    console.log('Google ID:', user.googleId);
    console.log('JWT Token:', token.substring(0, 20) + '...');
    console.log('------------------------------------------------');

    // Dọn dẹp user test (comment dòng này nếu muốn giữ lại để kiểm tra trong DB)
    // await User.deleteOne({ _id: user._id });
    // console.log('🧹 Đã xóa user test.');

  } catch (error) {
    console.error('❌ Test Thất bại:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Đã ngắt kết nối.');
  }
}

testGoogleLogin();
