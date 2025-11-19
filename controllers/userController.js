const User = require('../models/User');
const Movie = require('../models/Movie');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to favorites
// @route   POST /api/users/favorites/:movieId or /api/users/me/favorites/:movieId
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    // Check if already in favorites
    if (user.favorites.includes(req.params.movieId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie already in favorites' 
      });
    }

    user.favorites.push(req.params.movieId);
    await user.save();

    res.status(200).json({ success: true, data: user.favorites, message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/users/favorites/:movieId or /api/users/me/favorites/:movieId
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.favorites = user.favorites.filter(
      id => id.toString() !== req.params.movieId
    );
    
    await user.save();

    res.status(200).json({ success: true, data: user.favorites, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to watchlist
// @route   POST /api/users/watchlist/:movieId or /api/users/me/watchlist/:movieId
// @access  Private
exports.addToWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const movie = await Movie.findById(req.params.movieId);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    // Check if already in watchlist
    const exists = user.watchlist.some(
      item => item.movie.toString() === req.params.movieId
    );

    if (exists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Movie already in watchlist' 
      });
    }

    user.watchlist.push({ movie: req.params.movieId });
    await user.save();

    res.status(200).json({ success: true, data: user.watchlist, message: 'Added to watchlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from watchlist
// @route   DELETE /api/users/watchlist/:movieId or /api/users/me/watchlist/:movieId
// @access  Private
exports.removeFromWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.watchlist = user.watchlist.filter(
      item => item.movie.toString() !== req.params.movieId
    );
    
    await user.save();

    res.status(200).json({ success: true, data: user.watchlist, message: 'Removed from watchlist' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user watchlist
// @route   GET /api/users/watchlist
// @access  Private
exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist.movie');
    res.status(200).json({ success: true, data: user.watchlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to watch history
// @route   POST /api/users/history/:movieId
// @access  Private
exports.addToHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { progress, completed } = req.body;

    // Remove if already exists
    user.watchHistory = user.watchHistory.filter(
      item => item.movie.toString() !== req.params.movieId
    );

    // Add to beginning
    user.watchHistory.unshift({
      movie: req.params.movieId,
      progress: progress || 0,
      completed: completed || false
    });

    // Keep only last 50 items
    if (user.watchHistory.length > 50) {
      user.watchHistory = user.watchHistory.slice(0, 50);
    }

    await user.save();

    res.status(200).json({ success: true, data: user.watchHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get watch history
// @route   GET /api/users/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('watchHistory.movie');
    res.status(200).json({ success: true, data: user.watchHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear watch history
// @route   DELETE /api/users/history
// @access  Private
exports.clearHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.watchHistory = [];
    await user.save();

    res.status(200).json({ success: true, message: 'Watch history cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove single item from watch history
// @route   DELETE /api/users/history/:movieId
// @access  Private
exports.removeFromHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.watchHistory = user.watchHistory.filter(
      item => item.movie.toString() !== req.params.movieId
    );
    await user.save();

    res.status(200).json({ success: true, message: 'Removed from history' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.status(200).json({ success: true, data: user.preferences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get my list (favorites + watchlist)
// @route   GET /api/users/me/list
// @access  Private
exports.getMyList = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites')
      .populate('watchlist.movie');

    const favorites = user.favorites || [];
    const watchlist = user.watchlist || [];

    res.status(200).json({ 
      success: true, 
      data: { favorites, watchlist } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
