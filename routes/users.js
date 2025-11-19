const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  addToHistory,
  getHistory,
  clearHistory,
  removeFromHistory,
  updatePreferences,
  getMyList
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// My List (combined favorites + watchlist)
router.get('/me/list', protect, getMyList);

// My List - specific routes for favorites and watchlist
router.post('/me/favorites/:movieId', protect, addToFavorites);
router.delete('/me/favorites/:movieId', protect, removeFromFavorites);
router.post('/me/watchlist/:movieId', protect, addToWatchlist);
router.delete('/me/watchlist/:movieId', protect, removeFromWatchlist);

// Favorites
router.route('/favorites')
  .get(protect, getFavorites);
router.route('/favorites/:movieId')
  .post(protect, addToFavorites)
  .delete(protect, removeFromFavorites);

// Watchlist
router.route('/watchlist')
  .get(protect, getWatchlist);
router.route('/watchlist/:movieId')
  .post(protect, addToWatchlist)
  .delete(protect, removeFromWatchlist);

// Watch History
router.route('/history')
  .get(protect, getHistory)
  .delete(protect, clearHistory);
router.post('/history/:movieId', protect, addToHistory);
router.delete('/history/:movieId', protect, removeFromHistory);

// Preferences
router.put('/preferences', protect, updatePreferences);

// Public routes - MUST BE LAST (/:id catches everything)
router.get('/:id', getUserProfile);

module.exports = router;
