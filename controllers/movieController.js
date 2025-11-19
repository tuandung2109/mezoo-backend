const Movie = require('../models/Movie');

// @desc    Get all movies
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isPublished: true };

    // Filter by genre (only if not empty string)
    if (req.query.genre && req.query.genre.trim()) {
      query.genres = req.query.genre;
    }

    // Filter by year (only if not empty string)
    if (req.query.year && req.query.year.trim()) {
      query.releaseDate = {
        $gte: new Date(`${req.query.year}-01-01`),
        $lte: new Date(`${req.query.year}-12-31`)
      };
    }

    // Filter by minimum rating (only if not empty string)
    if (req.query.minRating && req.query.minRating.trim()) {
      query.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Search (only if not empty string)
    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { overview: { $regex: searchTerm, $options: 'i' } },
        { originalTitle: { $regex: searchTerm, $options: 'i' } },
        { tagline: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Sort
    let sort = {};
    if (req.query.sort === 'releaseDate') {
      sort = { releaseDate: -1 };
    } else if (req.query.sort === 'popularity') {
      sort = { views: -1 };
    } else if (req.query.sort === 'rating') {
      sort = { rating: -1 };
    } else if (req.query.sort === 'title') {
      sort = { title: 1 };
    } else {
      sort = { views: -1 }; // Default to popularity
    }

    const movies = await Movie.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip);

    const total = await Movie.countDocuments(query);

    res.status(200).json({
      success: true,
      movies: movies,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    // Increment views
    movie.views += 1;
    await movie.save();

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get movie by slug
// @route   GET /api/movies/slug/:slug
// @access  Public
exports.getMovieBySlug = async (req, res) => {
  try {
    const movie = await Movie.findOne({ slug: req.params.slug });

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    // Increment views
    movie.views += 1;
    await movie.save();

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get featured movies
// @route   GET /api/movies/featured
// @access  Public
exports.getFeaturedMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ featured: true, isPublished: true })
      .limit(10)
      .select('-videos');

    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
exports.getTrendingMovies = async (req, res) => {
  try {
    const movies = await Movie.find({ trending: true, isPublished: true })
      .sort({ views: -1 })
      .limit(10)
      .select('-videos');

    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
