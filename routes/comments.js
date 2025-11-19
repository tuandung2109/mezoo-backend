const express = require('express');
const router = express.Router();
const {
  getMovieComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/movie/:movieId', getMovieComments);
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, likeComment);

module.exports = router;
