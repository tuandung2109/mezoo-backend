const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Get reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: reviews.length, 
      data: reviews 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { movie, rating, title, content, spoiler } = req.body;

    // Check if movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ 
      user: req.user.id, 
      movie 
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this movie' 
      });
    }

    const review = await Review.create({
      user: req.user.id,
      movie,
      rating,
      title,
      content,
      spoiler
    });

    // Update movie rating
    const reviews = await Review.find({ movie });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Movie.findByIdAndUpdate(movie, {
      'rating.average': avgRating,
      'rating.count': reviews.length
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to update this review' 
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update movie rating
    const reviews = await Review.find({ movie: review.movie });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    
    await Movie.findByIdAndUpdate(review.movie, {
      'rating.average': avgRating,
      'rating.count': reviews.length
    });

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to delete this review' 
      });
    }

    const movieId = review.movie;
    await review.deleteOne();

    // Update movie rating
    const reviews = await Review.find({ movie: movieId });
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length 
      : 0;
    
    await Movie.findByIdAndUpdate(movieId, {
      'rating.average': avgRating,
      'rating.count': reviews.length
    });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like review
// @route   PUT /api/reviews/:id/like
// @access  Private
exports.likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    // Check if already liked
    const likeIndex = review.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(req.user.id);
      // Remove from dislikes if exists
      const dislikeIndex = review.dislikes.indexOf(req.user.id);
      if (dislikeIndex > -1) {
        review.dislikes.splice(dislikeIndex, 1);
      }
    }

    await review.save();
    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
