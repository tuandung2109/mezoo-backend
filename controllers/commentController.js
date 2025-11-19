const Comment = require('../models/Comment');
const Movie = require('../models/Movie');

// @desc    Get comments for a movie
// @route   GET /api/comments/movie/:movieId
// @access  Public
exports.getMovieComments = async (req, res) => {
  try {
    const comments = await Comment.find({ 
      movie: req.params.movieId,
      parentComment: null,
      isDeleted: false
    })
      .populate('user', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username avatar' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: comments.length, 
      data: comments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create comment
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { movie, content, parentComment } = req.body;

    // Check if movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }

    const comment = await Comment.create({
      user: req.user.id,
      movie,
      content,
      parentComment: parentComment || null
    });

    // If reply, add to parent's replies
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    await comment.populate('user', 'username avatar');

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Make sure user is comment owner
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to update this comment' 
      });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Make sure user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }

    comment.isDeleted = true;
    comment.content = '[Comment deleted]';
    await comment.save();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like comment
// @route   PUT /api/comments/:id/like
// @access  Private
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if already liked
    const likeIndex = comment.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= ADMIN ENDPOINTS =============

// @desc    Get all comments (Admin)
// @route   GET /api/comments/admin/all
// @access  Private/Admin
exports.getAllComments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      movie, 
      user,
      search,
      sort = 'newest',
      isDeleted
    } = req.query;

    const query = {};
    
    if (movie) query.movie = movie;
    if (user) query.user = user;
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }
    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === 'true';
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'most-liked') sortOption = { likes: -1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .populate('user', 'username email avatar')
      .populate('movie', 'title poster')
      .populate('parentComment', 'content')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: comments,
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

// @desc    Get comment statistics (Admin)
// @route   GET /api/comments/admin/stats
// @access  Private/Admin
exports.getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments({ isDeleted: false });
    const deletedComments = await Comment.countDocuments({ isDeleted: true });
    const totalReplies = await Comment.countDocuments({ 
      parentComment: { $ne: null },
      isDeleted: false 
    });

    // Most active commenters
    const mostActiveCommenters = await Comment.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 },
          totalLikes: { $sum: { $size: '$likes' } }
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

    // Most commented movies
    const mostCommentedMovies = await Comment.aggregate([
      { $match: { isDeleted: false, parentComment: null } },
      {
        $group: {
          _id: '$movie',
          count: { $sum: 1 }
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

    // Recent comments
    const recentComments = await Comment.find({ isDeleted: false })
      .populate('user', 'username avatar')
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 })
      .limit(5);

    // Comments over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const commentsOverTime = await Comment.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalComments,
        deletedComments,
        totalReplies,
        mostActiveCommenters,
        mostCommentedMovies,
        recentComments,
        commentsOverTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment permanently (Admin)
// @route   DELETE /api/comments/admin/:id
// @access  Private/Admin
exports.adminDeleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // If has replies, just mark as deleted
    if (comment.replies && comment.replies.length > 0) {
      comment.isDeleted = true;
      comment.content = '[Comment deleted by admin]';
      await comment.save();
    } else {
      // If no replies, delete permanently
      await comment.deleteOne();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore deleted comment (Admin)
// @route   PUT /api/comments/admin/:id/restore
// @access  Private/Admin
exports.restoreComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    if (!comment.isDeleted) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment is not deleted' 
      });
    }

    comment.isDeleted = false;
    await comment.save();

    res.status(200).json({ 
      success: true, 
      data: comment,
      message: 'Comment restored successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
