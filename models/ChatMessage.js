const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    recommendedMovies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    }],
    searchQuery: String,
    intent: String, // 'recommend', 'search', 'info', 'support'
    confidence: Number
  },
  tokens: {
    prompt: Number,
    completion: Number,
    total: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
chatMessageSchema.index({ user: 1, sessionId: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto delete after 30 days

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
