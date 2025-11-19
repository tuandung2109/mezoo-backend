const express = require('express');
const router = express.Router();
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  getUserReview,
  getAllReviews,
  getReviewStats,
  adminDeleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/movie/:movieId', getMovieReviews);

// Private routes
router.post('/movie/:movieId', protect, createReview);
router.get('/movie/:movieId/user', protect, getUserReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, toggleHelpful);

// Admin routes
router.get('/admin/all', protect, authorize('admin', 'moderator'), getAllReviews);
router.get('/admin/stats', protect, authorize('admin', 'moderator'), getReviewStats);
router.delete('/admin/:id', protect, authorize('admin', 'moderator'), adminDeleteReview);

module.exports = router;
