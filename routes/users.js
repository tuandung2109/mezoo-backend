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
  updatePreferences
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id', getUserProfile);

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
