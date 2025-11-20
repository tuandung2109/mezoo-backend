const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional authentication - doesn't block if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, continue as guest
  if (!token) {
    req.user = null;
    req.isGuest = true;
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    req.isGuest = false;
    
    next();
  } catch (error) {
    // Invalid token - treat as guest
    console.log('Invalid token, treating as guest');
    req.user = null;
    req.isGuest = true;
    next();
  }
};
