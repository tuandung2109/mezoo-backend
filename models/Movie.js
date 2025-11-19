const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  tmdbId: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  originalTitle: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  overview: {
    type: String,
    required: [true, 'Overview is required']
  },
  tagline: String,
  poster: {
    type: String,
    required: [true, 'Poster is required']
  },
  backdrop: String,
  trailer: {
    youtube: String,
    url: String
  },
  releaseDate: {
    type: Date,
    required: true
  },
  runtime: {
    type: Number,
    required: true
  },
  genres: [{
    type: String,
    required: true
  }],
  countries: [{
    type: String
  }],
  languages: [{
    code: String,
    name: String
  }],
  originalLanguage: String,
  status: {
    type: String,
    enum: ['Released', 'Post Production', 'In Production', 'Planned', 'Rumored', 'Canceled'],
    default: 'Released'
  },
  type: {
    type: String,
    enum: ['movie', 'series'],
    default: 'movie'
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    count: {
      type: Number,
      default: 0
    },
    tmdb: Number,
    imdb: Number
  },
  cast: [{
    name: String,
    character: String,
    profilePath: String,
    order: Number
  }],
  crew: [{
    name: String,
    job: String,
    department: String,
    profilePath: String
  }],
  videos: [{
    quality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4k'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: String,
    language: {
      type: String,
      default: 'vi'
    },
    subtitle: [{
      language: String,
      url: String
    }]
  }],
  budget: Number,
  revenue: Number,
  popularity: {
    type: Number,
    default: 0
  },
  voteCount: {
    type: Number,
    default: 0
  },
  adult: {
    type: Boolean,
    default: false
  },
  ageRating: {
    type: String,
    enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'],
    default: 'NR'
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  publishedAt: Date,
  metadata: {
    keywords: [String],
    seoTitle: String,
    seoDescription: String
  }
}, {
  timestamps: true
});

// Index for search optimization
movieSchema.index({ title: 'text', overview: 'text', tagline: 'text' });
movieSchema.index({ genres: 1, releaseDate: -1 });
movieSchema.index({ 'rating.average': -1, views: -1 });
movieSchema.index({ slug: 1 });

module.exports = mongoose.model('Movie', movieSchema);
