const express = require('express');
const router = express.Router();
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpful,
  getUserReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/movie/:movieId', getMovieReviews);

// Private routes
router.post('/movie/:movieId', protect, createReview);
router.get('/movie/:movieId/user', protect, getUserReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, toggleHelpful);

module.exports = router;
