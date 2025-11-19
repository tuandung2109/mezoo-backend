const express = require('express');
const router = express.Router();
const {
  getMovieReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/movie/:movieId', getMovieReviews);
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/like', protect, likeReview);

module.exports = router;
