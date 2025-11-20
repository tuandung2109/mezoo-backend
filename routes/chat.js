const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChatHistory,
  clearChatHistory,
  getChatSessions,
  getQuickSuggestions,
  getChatStats
} = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.delete('/history', protect, clearChatHistory);
router.get('/sessions', protect, getChatSessions);
router.get('/suggestions', protect, getQuickSuggestions);

// Admin routes
router.get('/admin/stats', protect, authorize('admin'), getChatStats);

module.exports = router;
