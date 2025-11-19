const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  movies: [{
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  thumbnail: String,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Playlist', playlistSchema);
