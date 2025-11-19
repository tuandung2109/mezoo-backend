const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovie,
  getMovieBySlug,
  createMovie,
  updateMovie,
  deleteMovie,
  getFeaturedMovies,
  getTrendingMovies
} = require('../controllers/movieController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getMovies)
  .post(protect, authorize('admin', 'moderator'), createMovie);

router.get('/featured', getFeaturedMovies);
router.get('/trending', getTrendingMovies);
router.get('/slug/:slug', getMovieBySlug);

router.route('/:id')
  .get(getMovie)
  .put(protect, authorize('admin', 'moderator'), updateMovie)
  .delete(protect, authorize('admin'), deleteMovie);

module.exports = router;
