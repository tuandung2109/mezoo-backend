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
  updatePreferences,
  getMyList
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// My List (combined favorites + watchlist)
router.get('/me/list', protect, getMyList);

// Public routes
router.get('/:id', getUserProfile);

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
  .get(protect, getHistory);
router.post('/history/:movieId', protect, addToHistory);

// Preferences
router.put('/preferences', protect, updatePreferences);

module.exports = router;
