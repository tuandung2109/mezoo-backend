const mongoose = require('mongoose');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

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


// ============ ADMIN ENDPOINTS ============

// @desc    Get all users (Admin)
// @route   GET /api/users/admin/all
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments();

    // Get stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const stats = {
        moviesWatched: user.watchHistory?.length || 0,
        favorites: user.favorites?.length || 0,
        reviews: await Review.countDocuments({ user: user._id })
      };
      return { ...user.toObject(), stats };
    }));

    res.status(200).json({
      success: true,
      data: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (Admin)
// @route   PUT /api/users/admin/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

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

// @desc    Toggle user active status (Admin)
// @route   PUT /api/users/admin/:id/toggle-active
// @access  Private/Admin
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user details with stats (Admin)
// @route   GET /api/users/admin/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favorites', 'title poster')
      .populate('watchHistory.movie', 'title poster');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const reviewCount = await Review.countDocuments({ user: user._id });

    const userWithStats = {
      ...user.toObject(),
      stats: {
        moviesWatched: user.watchHistory?.length || 0,
        favorites: user.favorites?.length || 0,
        reviews: reviewCount
      }
    };

    res.status(200).json({ success: true, data: userWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user personal stats
// @route   GET /api/users/me/stats
// @access  Private
exports.getMyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('watchHistory.movie', 'title genres runtime releaseDate')
      .populate('favorites', 'genres');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Basic counts
    const totalMoviesWatched = user.watchHistory?.length || 0;
    const totalFavorites = user.favorites?.length || 0;
    const totalWatchlist = user.watchlist?.length || 0;
    const reviewCount = await Review.countDocuments({ user: user._id });

    // Calculate total watch time (in minutes)
    let totalWatchTime = 0;
    user.watchHistory.forEach(item => {
      if (item.movie && item.movie.runtime) {
        totalWatchTime += item.movie.runtime;
      }
    });

    // Calculate completed movies
    const completedMovies = user.watchHistory.filter(item => item.completed).length;

    // Genre statistics
    const genreCount = {};
    user.watchHistory.forEach(item => {
      if (item.movie && item.movie.genres) {
        item.movie.genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    // Sort genres by count
    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));

    // Watch activity by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = {};
    user.watchHistory.forEach(item => {
      if (item.watchedAt >= sixMonthsAgo) {
        const month = new Date(item.watchedAt).toLocaleDateString('vi-VN', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyActivity[month] = (monthlyActivity[month] || 0) + 1;
      }
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = user.watchHistory.filter(
      item => item.watchedAt >= sevenDaysAgo
    ).length;

    // Account age in days
    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );

    // Average movies per week
    const avgMoviesPerWeek = accountAge > 0 
      ? ((totalMoviesWatched / accountAge) * 7).toFixed(1)
      : 0;

    const stats = {
      overview: {
        totalMoviesWatched,
        completedMovies,
        totalFavorites,
        totalWatchlist,
        totalReviews: reviewCount,
        totalWatchTime, // in minutes
        totalWatchTimeFormatted: `${Math.floor(totalWatchTime / 60)}h ${totalWatchTime % 60}m`,
        accountAge,
        avgMoviesPerWeek: parseFloat(avgMoviesPerWeek),
        recentActivity
      },
      genres: {
        topGenres,
        totalGenresWatched: Object.keys(genreCount).length
      },
      activity: {
        monthlyActivity: Object.entries(monthlyActivity).map(([month, count]) => ({
          month,
          count
        })),
        last7Days: recentActivity
      },
      subscription: {
        plan: user.subscription?.plan || 'free',
        isActive: user.subscription?.isActive || false,
        startDate: user.subscription?.startDate,
        endDate: user.subscription?.endDate
      }
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
