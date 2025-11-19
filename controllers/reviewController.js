const Review = require('../models/Review');
const Movie = require('../models/Movie');

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

    if (helpfulIndex > -1) {
      // Remove helpful
      review.helpful.splice(helpfulIndex, 1);
    } else {
      // Add helpful
      review.helpful.push(userId);
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
