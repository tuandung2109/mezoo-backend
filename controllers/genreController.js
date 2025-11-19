const Genre = require('../models/Genre');

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
exports.getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ 
      success: true, 
      count: genres.length, 
      data: genres 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single genre
// @route   GET /api/genres/:id
// @access  Public
exports.getGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create genre
// @route   POST /api/genres
// @access  Private/Admin
exports.createGenre = async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update genre
// @route   PUT /api/genres/:id
// @access  Private/Admin
exports.updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete genre
// @route   DELETE /api/genres/:id
// @access  Private/Admin
exports.deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);

    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= ADMIN ENDPOINTS =============

// @desc    Get all genres with stats (Admin)
// @route   GET /api/genres/admin/all
// @access  Private/Admin
exports.getAllGenres = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      isActive,
      sort = 'name'
    } = req.query;

    const query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    let sortOption = { name: 1 };
    if (sort === 'movieCount') sortOption = { movieCount: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const genres = await Genre.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Genre.countDocuments(query);

    res.status(200).json({
      success: true,
      data: genres,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get genre statistics (Admin)
// @route   GET /api/genres/admin/stats
// @access  Private/Admin
exports.getGenreStats = async (req, res) => {
  try {
    const Movie = require('../models/Movie');
    
    const totalGenres = await Genre.countDocuments();
    const activeGenres = await Genre.countDocuments({ isActive: true });
    const inactiveGenres = totalGenres - activeGenres;

    // Update movie count for all genres
    const genres = await Genre.find();
    for (const genre of genres) {
      const count = await Movie.countDocuments({ 
        genres: genre.name,
        isPublished: true 
      });
      genre.movieCount = count;
      await genre.save();
    }

    // Top genres by movie count
    const topGenres = await Genre.find({ isActive: true })
      .sort({ movieCount: -1 })
      .limit(5);

    // Genres with no movies
    const emptyGenres = await Genre.countDocuments({ movieCount: 0 });

    // Recent genres
    const recentGenres = await Genre.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalGenres,
        activeGenres,
        inactiveGenres,
        emptyGenres,
        topGenres,
        recentGenres
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle genre active status (Admin)
// @route   PUT /api/genres/admin/:id/toggle
// @access  Private/Admin
exports.toggleGenreStatus = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    genre.isActive = !genre.isActive;
    await genre.save();

    res.status(200).json({ 
      success: true, 
      data: genre,
      message: `Genre ${genre.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get movies by genre (Admin)
// @route   GET /api/genres/admin/:id/movies
// @access  Private/Admin
exports.getGenreMovies = async (req, res) => {
  try {
    const Movie = require('../models/Movie');
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movies = await Movie.find({ 
      genres: genre.name,
      isPublished: true 
    })
      .select('title poster releaseDate rating views')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Movie.countDocuments({ 
      genres: genre.name,
      isPublished: true 
    });

    res.status(200).json({
      success: true,
      data: {
        genre,
        movies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
