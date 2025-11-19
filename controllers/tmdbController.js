const TMDBService = require('../utils/tmdb');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');

const tmdb = new TMDBService(process.env.TMDB_API_KEY);

// @desc    Import movie from TMDB
// @route   POST /api/tmdb/import/movie/:tmdbId
// @access  Private/Admin
exports.importMovie = async (req, res) => {
  try {
    const tmdbMovie = await tmdb.getMovieDetails(req.params.tmdbId);
    
    // Check if movie already exists
    const existingMovie = await Movie.findOne({ tmdbId: tmdbMovie.id });
    if (existingMovie) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie already exists in database' 
      });
    }

    // Format and create movie
    const movieData = tmdb.formatMovieData(tmdbMovie);
    movieData.slug = tmdbMovie.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const movie = await Movie.create(movieData);

    res.status(201).json({ 
      success: true, 
      message: 'Movie imported successfully',
      data: movie 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search TMDB movies
// @route   GET /api/tmdb/search
// @access  Private/Admin
exports.searchTMDB = async (req, res) => {
  try {
    const { query, page } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required' 
      });
    }

    const results = await tmdb.searchMovies(query, page);
    
    res.status(200).json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get popular movies from TMDB
// @route   GET /api/tmdb/popular
// @access  Private/Admin
exports.getPopular = async (req, res) => {
  try {
    const { page } = req.query;
    const results = await tmdb.getPopularMovies(page);
    
    res.status(200).json({ 
      success: true, 
      data: results 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Import genres from TMDB
// @route   POST /api/tmdb/import/genres
// @access  Private/Admin
exports.importGenres = async (req, res) => {
  try {
    const tmdbGenres = await tmdb.getGenres();
    
    const genres = [];
    for (const tmdbGenre of tmdbGenres) {
      const existingGenre = await Genre.findOne({ tmdbId: tmdbGenre.id });
      
      if (!existingGenre) {
        const genre = await Genre.create({
          name: tmdbGenre.name,
          slug: tmdbGenre.name.toLowerCase().replace(/\s+/g, '-'),
          tmdbId: tmdbGenre.id
        });
        genres.push(genre);
      }
    }

    res.status(201).json({ 
      success: true, 
      message: `Imported ${genres.length} genres`,
      data: genres 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk import popular movies
// @route   POST /api/tmdb/import/bulk
// @access  Private/Admin
exports.bulkImport = async (req, res) => {
  try {
    const { pages = 1 } = req.body;
    const imported = [];
    const skipped = [];

    for (let page = 1; page <= pages; page++) {
      const popularMovies = await tmdb.getPopularMovies(page);
      
      for (const tmdbMovie of popularMovies.results) {
        try {
          // Check if exists
          const exists = await Movie.findOne({ tmdbId: tmdbMovie.id });
          if (exists) {
            skipped.push(tmdbMovie.title);
            continue;
          }

          // Get full details
          const fullMovie = await tmdb.getMovieDetails(tmdbMovie.id);
          const movieData = tmdb.formatMovieData(fullMovie);
          movieData.slug = fullMovie.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          const movie = await Movie.create(movieData);
          imported.push(movie.title);

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 250));
        } catch (error) {
          console.error(`Error importing ${tmdbMovie.title}:`, error.message);
        }
      }
    }

    res.status(201).json({ 
      success: true, 
      message: `Imported ${imported.length} movies, skipped ${skipped.length}`,
      data: { imported, skipped }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
