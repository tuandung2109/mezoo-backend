const Review = require('../models/Review');
const Movie = require('../models/Movie');
const { createNotification } = require('./notificationController');

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = async (req, res) => {
  try {
    const { sort = 'newest' } = req.query;
    
    let sortOption = { createdAt: -1 }; // newest first
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'helpful') sortOption = { helpful: -1, createdAt: -1 };

    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'username avatar fullName')
      .sort(sortOption);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        count: reviews.length,
        averageRating: avgRating.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/reviews/movie/:movieId
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const movieId = req.params.movieId;
    const userId = req.user.id;

    // Check if movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ movie: movieId, user: userId });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this movie' 
      });
    }

    const review = await Review.create({
      movie: movieId,
      user: userId,
      rating,
      comment
    });

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username avatar fullName');

    res.status(201).json({ success: true, data: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.isEdited = true;
    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username avatar fullName');

    res.status(200).json({ success: true, data: populatedReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle helpful on a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.toggleHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user.id;
    const helpfulIndex = review.helpful.indexOf(userId);
    const wasHelpful = helpfulIndex > -1;

    if (wasHelpful) {
      // Remove helpful
      review.helpful.splice(helpfulIndex, 1);
    } else {
      // Add helpful
      review.helpful.push(userId);
      
      // Create notification for review owner (if not self-like)
      if (review.user.toString() !== userId) {
        const movie = await Movie.findById(review.movie);
        await createNotification(
          review.user,
          'review_like',
          'Đánh giá của bạn được thích',
          `Có người thấy đánh giá của bạn về "${movie.title}" hữu ích`,
          {
            link: `/movie/${movie._id}`,
            relatedMovie: movie._id,
            relatedReview: review._id,
            relatedUser: userId
          }
        );
      }
    }

    await review.save();

    res.status(200).json({ 
      success: true, 
      data: { 
        helpfulCount: review.helpful.length,
        isHelpful: helpfulIndex === -1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's review for a movie
// @route   GET /api/reviews/movie/:movieId/user
// @access  Private
exports.getUserReview = async (req, res) => {
  try {
    const review = await Review.findOne({ 
      movie: req.params.movieId, 
      user: req.user.id 
    }).populate('user', 'username avatar fullName');

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= ADMIN ENDPOINTS =============

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      rating, 
      movie, 
      user,
      search,
      sort = 'newest'
    } = req.query;

    const query = {};
    
    if (rating) query.rating = parseInt(rating);
    if (movie) query.movie = movie;
    if (user) query.user = user;
    if (search) {
      query.comment = { $regex: search, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'rating-high') sortOption = { rating: -1, createdAt: -1 };
    if (sort === 'rating-low') sortOption = { rating: 1, createdAt: -1 };
    if (sort === 'helpful') sortOption = { helpful: -1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(query)
      .populate('user', 'username email avatar fullName')
      .populate('movie', 'title poster')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get review statistics (Admin)
// @route   GET /api/reviews/admin/stats
// @access  Private/Admin
exports.getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const avgRating = await Review.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' }
        }
      }
    ]);

    const recentReviews = await Review.find()
      .populate('user', 'username avatar')
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })
      .limit(5);

    const topReviewedMovies = await Review.aggregate([
      {
        $group: {
          _id: '$movie',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieInfo'
        }
      },
      { $unwind: '$movieInfo' }
    ]);

    const mostActiveReviewers = await Review.aggregate([
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        averageRating: avgRating[0]?.average?.toFixed(2) || 0,
        ratingDistribution,
        recentReviews,
        topReviewedMovies,
        mostActiveReviewers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review by admin
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
exports.adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.deleteOne();

    res.status(200).json({ 
      success: true, 
      message: 'Review deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
