const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
  episodeNumber: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  overview: String,
  stillPath: String,
  airDate: Date,
  runtime: Number,
  videos: [{
    quality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4k']
    },
    url: String,
    size: String
  }],
  views: {
    type: Number,
    default: 0
  }
});

const seasonSchema = new mongoose.Schema({
  seasonNumber: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  overview: String,
  posterPath: String,
  airDate: Date,
  episodes: [episodeSchema]
});

const seriesSchema = new mongoose.Schema({
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
  originalTitle: String,
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  overview: {
    type: String,
    required: true
  },
  tagline: String,
  poster: {
    type: String,
    required: true
  },
  backdrop: String,
  trailer: {
    youtube: String,
    url: String
  },
  firstAirDate: Date,
  lastAirDate: Date,
  status: {
    type: String,
    enum: ['Returning Series', 'Planned', 'In Production', 'Ended', 'Canceled', 'Pilot'],
    default: 'Returning Series'
  },
  genres: [{
    type: String,
    required: true
  }],
  countries: [String],
  languages: [{
    code: String,
    name: String
  }],
  networks: [{
    name: String,
    logo: String
  }],
  numberOfSeasons: {
    type: Number,
    default: 0
  },
  numberOfEpisodes: {
    type: Number,
    default: 0
  },
  seasons: [seasonSchema],
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
    }
  },
  cast: [{
    name: String,
    character: String,
    profilePath: String
  }],
  crew: [{
    name: String,
    job: String,
    department: String
  }],
  popularity: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

seriesSchema.index({ title: 'text', overview: 'text' });
seriesSchema.index({ genres: 1, firstAirDate: -1 });

module.exports = mongoose.model('Series', seriesSchema);
