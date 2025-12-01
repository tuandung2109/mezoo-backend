const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      fullName
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        subscription: user.subscription,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Social Login (Google/Facebook)
// @route   POST /api/auth/social-login
// @access  Public
exports.socialLogin = async (req, res) => {
  try {
    const { token, provider } = req.body;
    let userData = {};

    if (provider === 'google') {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      userData = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleId: payload.sub
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }

    if (!userData.email) {
      return res.status(400).json({ success: false, message: 'Email is required from provider' });
    }

    // Check if user exists
    let user = await User.findOne({ email: userData.email });

    if (user) {
      // Update existing user with social ID if missing
      if (provider === 'google' && !user.googleId) {
        user.googleId = userData.googleId;
        if (user.authProvider === 'local') user.authProvider = 'google'; // Optional: keep local or switch? Let's just add ID.
        await user.save();
      }
    } else {
      // Create new user
      // Generate a random username if needed or use email prefix
      let username = userData.email.split('@')[0];
      // Ensure username is unique
      let usernameExists = await User.findOne({ username });
      if (usernameExists) {
        username += Math.floor(Math.random() * 1000);
      }

      user = await User.create({
        username,
        email: userData.email,
        fullName: userData.name,
        avatar: userData.picture,
        authProvider: provider,
        [provider + 'Id']: userData[provider + 'Id'],
        // Password is not required due to our model change
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role,
        subscription: user.subscription,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.error('Social Login Error:', error);
    res.status(500).json({ success: false, message: 'Social login failed' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      fullName: req.body.fullName,
      email: req.body.email,
      avatar: req.body.avatar
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Password is incorrect' 
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.status(200).json({ 
      success: true, 
      data: { token: generateToken(user._id) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;
    // Note: In a real app, you'd probably want to link to the frontend reset page, e.g.:
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // But for now let's stick to the backend route or adjust if we have frontend URL.
    // Let's assume we want to send them to the frontend.
    // The user asked for the feature, so I should probably point to the frontend page I'm about to create.
    // Let's assume the frontend is running on localhost:5173 (Vite default) or whatever the user has.
    // I'll use a generic placeholder or try to infer.
    // Better yet, I'll use a standard format and let the user configure the base URL.
    
    // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendUrl = process.env.FRONTEND_URL || 'https://mezoo.onrender.com';
    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:\n\n ${frontendUrl}/reset-password/${resetToken}\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu Mezoo',
        message
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: { token: generateToken(user._id) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
