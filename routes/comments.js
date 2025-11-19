const express = require('express');
const router = express.Router();
const {
  getMovieComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  getAllComments,
  getCommentStats,
  adminDeleteComment,
  restoreComment
} = require('../controllers/commentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/movie/:movieId', getMovieComments);

// Private routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/like', protect, likeComment);

// Admin routes
router.get('/admin/all', protect, authorize('admin', 'moderator'), getAllComments);
router.get('/admin/stats', protect, authorize('admin', 'moderator'), getCommentStats);
router.delete('/admin/:id', protect, authorize('admin', 'moderator'), adminDeleteComment);
router.put('/admin/:id/restore', protect, authorize('admin', 'moderator'), restoreComment);

module.exports = router;
