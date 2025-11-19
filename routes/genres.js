const express = require('express');
const router = express.Router();
const {
  getGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre,
  getAllGenres,
  getGenreStats,
  toggleGenreStatus,
  getGenreMovies
} = require('../controllers/genreController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getGenres);
router.get('/:id', getGenre);

// Admin routes
router.get('/admin/all', protect, authorize('admin', 'moderator'), getAllGenres);
router.get('/admin/stats', protect, authorize('admin', 'moderator'), getGenreStats);
router.get('/admin/:id/movies', protect, authorize('admin', 'moderator'), getGenreMovies);
router.put('/admin/:id/toggle', protect, authorize('admin', 'moderator'), toggleGenreStatus);

// Admin CRUD
router.post('/', protect, authorize('admin'), createGenre);
router.put('/:id', protect, authorize('admin'), updateGenre);
router.delete('/:id', protect, authorize('admin'), deleteGenre);

module.exports = router;
