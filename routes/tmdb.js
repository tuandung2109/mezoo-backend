const express = require('express');
const router = express.Router();
const {
  importMovie,
  searchTMDB,
  getPopular,
  importGenres,
  bulkImport
} = require('../controllers/tmdbController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin access
router.use(protect, authorize('admin'));

router.post('/import/movie/:tmdbId', importMovie);
router.post('/import/genres', importGenres);
router.post('/import/bulk', bulkImport);
router.get('/search', searchTMDB);
router.get('/popular', getPopular);

module.exports = router;
