const Genre = require('../models/Genre');

// @desc    Get all genres
// @route   GET /api/genres
// @access  Public
exports.getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ 
      success: true, 
      count: genres.length, 
      data: genres 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single genre
// @route   GET /api/genres/:id
// @access  Public
exports.getGenre = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);

    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create genre
// @route   POST /api/genres
// @access  Private/Admin
exports.createGenre = async (req, res) => {
  try {
    const genre = await Genre.create(req.body);
    res.status(201).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update genre
// @route   PUT /api/genres/:id
// @access  Private/Admin
exports.updateGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    res.status(200).json({ success: true, data: genre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete genre
// @route   DELETE /api/genres/:id
// @access  Private/Admin
exports.deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);

    if (!genre) {
      return res.status(404).json({ 
        success: false, 
        message: 'Genre not found' 
      });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
