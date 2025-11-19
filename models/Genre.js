const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Genre name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: String,
  color: String,
  tmdbId: Number,
  movieCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Genre', genreSchema);
