const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  fullName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'vip'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  watchHistory: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  watchlist: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferences: {
    language: {
      type: String,
      default: 'vi'
    },
    genres: [{
      type: String
    }],
    autoplay: {
      type: Boolean,
      default: true
    },
    quality: {
      type: String,
      enum: ['auto', '480p', '720p', '1080p', '4k'],
      default: 'auto'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
