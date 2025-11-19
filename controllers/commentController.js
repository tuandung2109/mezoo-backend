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
