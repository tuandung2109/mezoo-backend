const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const Movie = require('../models/Movie');
const GeminiService = require('../utils/gemini');

const gemini = new GeminiService(process.env.GEMINI_API_KEY);

// @desc    Send chat message
// @route   POST /api/chat/send
// @access  Public (with optional auth)
exports.sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id;
    const isGuest = req.isGuest || !userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get user context (if authenticated)
    let user = null;
    if (!isGuest) {
      user = await User.findById(userId)
        .populate('watchHistory.movie', 'title genres')
        .populate('favorites', 'title genres');
    }

    // Get conversation history (last 10 messages) - only for authenticated users
    let history = [];
    if (!isGuest) {
      history = await ChatMessage.find({
        user: userId,
        sessionId: sessionId || 'default'
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('role content');
    }

    // Build context
    const userContext = {
      userName: user?.fullName || user?.username || 'bạn',
      subscription: user?.subscription || { plan: 'free' },
      favoriteGenres: user?.preferences?.genres || [],
      watchHistory: user?.watchHistory || [],
      isGuest
    };

    // Analyze intent
    const intent = gemini.analyzeIntent(message);
    const extractedGenres = gemini.extractGenres(message);
    const featureInfo = gemini.getFeatureInfo(message);
    
    console.log('🔍 Intent:', intent);
    console.log('🎭 Genres:', extractedGenres);

    // Build messages for Gemini
    const systemPrompt = gemini.buildSystemPrompt(userContext);
    let userMessage = message;
    
    // Add feature info if relevant
    if (featureInfo) {
      userMessage += featureInfo;
    }

    // Build messages array
    const historyMessages = history.reverse().map(h => ({
      role: h.role,
      content: h.content
    }));

    const messages = [
      ...historyMessages,
      { role: 'user', content: systemPrompt + '\n\n' + userMessage }
    ];

    console.log('💬 Messages to send:', messages.length, 'messages');

    // Get movie recommendations if needed
    let recommendedMovies = [];
    let movieContext = '';
    let isSpecificMovie = false;

    // Try to extract movie title from message (support multiple formats)
    let searchTitle = null;
    
    // Pattern 1: Text in quotes "Frankenstein"
    const quotedMatch = message.match(/[""]([^""]+)[""]/);
    if (quotedMatch) {
      searchTitle = quotedMatch[1];
    }
    
    // Pattern 2: "phim X" or "về phim X" (simple version)
    if (!searchTitle) {
      const phimMatch = message.match(/(?:về\s+)?phim\s+(.+?)(?:\s+(?:là|có|thế|nào|không|nhỉ|ạ)|\?|$)/i);
      if (phimMatch) {
        searchTitle = phimMatch[1].trim();
      }
    }
    
    // Pattern 2.5: "tìm X" or "muốn tìm X"
    if (!searchTitle) {
      const timMatch = message.match(/(?:toi\s+)?(?:muốn\s+)?(?:tìm|tim)\s+(.+?)(?:\s+\d{2}:\d{2})?$/i);
      if (timMatch) {
        searchTitle = timMatch[1].trim();
      }
    }
    
    // Pattern 3: Direct movie name (if intent is info/search and no genre found)
    if (!searchTitle && (intent === 'info' || intent === 'search') && extractedGenres.length === 0) {
      // Remove common question words
      let cleanMsg = message
        .replace(/^(tuyệt vời|mọi thứ về|cho tôi biết về|thông tin về|nội dung|kể về|giới thiệu|tìm)\s+/i, '')
        .replace(/\s+(là gì|thế nào|như thế nào|nhỉ|ạ|\?|!|\.)+$/i, '')
        .replace(/^phim\s+/i, '')
        .trim();
      
      // If message is very short (like "Avengers 4"), use it directly
      if (cleanMsg.length === 0 && message.trim().length > 2 && message.trim().length < 50) {
        cleanMsg = message.trim();
      }
      
      if (cleanMsg.length > 2 && cleanMsg.length < 100) {
        searchTitle = cleanMsg;
      }
    }
    
    // Search for specific movie if title found
    if (searchTitle) {
      console.log('🔍 Searching for specific movie:', searchTitle);
      
      // Search by title only (Vietnamese name)
      const specificMovie = await Movie.findOne({
        title: new RegExp(searchTitle, 'i')
      }).select('title genres rating.average overview releaseDate poster slug');
      
      if (specificMovie) {
        recommendedMovies = [specificMovie];
        isSpecificMovie = true;
        console.log('✅ Found specific movie:', specificMovie.title);
        
        movieContext = `\n\nTHÔNG TIN PHIM:\n"${specificMovie.title}" (${new Date(specificMovie.releaseDate).getFullYear()}) - ${specificMovie.genres.join(', ')} - ⭐ ${specificMovie.rating.average.toFixed(1)}/10\n${specificMovie.overview || ''}`;
        messages[messages.length - 1].content += movieContext;
      }
    }
    
    // If no specific movie found, search by genre or general recommendation
    if (!isSpecificMovie) {
      const shouldFindMovies = intent === 'recommend' || intent === 'search' || extractedGenres.length > 0;

      if (shouldFindMovies) {
        const query = {};
        
        if (extractedGenres.length > 0) {
          query.genres = { $in: extractedGenres };
        }

        recommendedMovies = await Movie.find(query)
          .sort({ 'rating.average': -1, views: -1 })
          .limit(5)
          .select('title genres rating.average overview releaseDate poster slug');

        console.log('🎬 Found movies by genre:', recommendedMovies.length);

        if (recommendedMovies.length > 0) {
          movieContext = '\n\nPHIM CÓ SẴN:\n' + recommendedMovies.map((m, i) => 
            `${i + 1}. "${m.title}" (${new Date(m.releaseDate).getFullYear()}) - ${m.genres.join(', ')} - ⭐ ${m.rating.average.toFixed(1)}/10`
          ).join('\n');
          
          messages[messages.length - 1].content += movieContext;
        }
      }
    }

    // Get AI response
    const aiResponse = await gemini.chat(messages);

    // Save messages only for authenticated users
    let assistantMessage = null;
    if (!isGuest) {
      // Save user message
      await ChatMessage.create({
        user: userId,
        sessionId: sessionId || 'default',
        role: 'user',
        content: message,
        metadata: {
          intent,
          searchQuery: extractedGenres.join(', ')
        }
      });

      // Save assistant message
      assistantMessage = await ChatMessage.create({
        user: userId,
        sessionId: sessionId || 'default',
        role: 'assistant',
        content: aiResponse.content,
        metadata: {
          recommendedMovies: recommendedMovies.map(m => m._id),
          intent,
          confidence: 0.8
        },
        tokens: aiResponse.tokens
      });

      // Populate recommended movies
      await assistantMessage.populate('metadata.recommendedMovies', 'title poster slug rating.average genres');
    }

    // Format movies for response
    const formattedMovies = recommendedMovies.map(movie => ({
      _id: movie._id,
      title: movie.title,
      poster: movie.poster,
      slug: movie.slug,
      rating: movie.rating?.average || 0,
      releaseDate: movie.releaseDate,
      genres: movie.genres,
      overview: movie.overview
    }));

    res.status(200).json({
      success: true,
      data: {
        response: aiResponse.content,
        movies: formattedMovies,
        intent,
        sessionId: sessionId || 'default',
        isGuest
      }
    });
  } catch (error) {
    console.error('❌ Chat Error:', error);
    console.error('Error stack:', error.stack);
    
    // Send more specific error message
    let errorMessage = 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.';
    
    if (error.message.includes('Gemini')) {
      errorMessage = 'AI đang bận, vui lòng thử lại sau vài giây.';
    } else if (error.message.includes('Messages array is empty')) {
      errorMessage = 'Tin nhắn không hợp lệ.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId, limit = 50 } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('metadata.recommendedMovies', 'title poster slug rating.average');

    res.status(200).json({
      success: true,
      data: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear chat history
// @route   DELETE /api/chat/history
// @access  Private
exports.clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    await ChatMessage.deleteMany(query);

    res.status(200).json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get chat sessions
// @route   GET /api/chat/sessions
// @access  Private
exports.getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await ChatMessage.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$sessionId',
          lastMessage: { $last: '$content' },
          lastMessageAt: { $last: '$createdAt' },
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { lastMessageAt: -1 } },
      { $limit: 20 }
    ]);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quick suggestions
// @route   GET /api/chat/suggestions
// @access  Private
exports.getQuickSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .populate('favorites', 'genres')
      .populate('watchHistory.movie', 'genres');

    // Analyze user preferences
    const genreCount = {};
    
    // From favorites
    user.favorites?.forEach(movie => {
      movie.genres?.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 2; // Weight favorites more
      });
    });

    // From watch history
    user.watchHistory?.forEach(item => {
      item.movie?.genres?.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Generate suggestions
    const suggestions = [
      'Gợi ý phim hay cho tôi',
      'Phim mới nhất là gì?',
      'Tìm phim hành động hay',
      'Giải thích nội dung phim này'
    ];

    if (topGenres.length > 0) {
      suggestions.unshift(`Gợi ý phim ${topGenres[0].toLowerCase()}`);
    }

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============= ADMIN ENDPOINTS =============

// @desc    Get all chat statistics (Admin)
// @route   GET /api/chat/admin/stats
// @access  Private/Admin
exports.getChatStats = async (req, res) => {
  try {
    const totalMessages = await ChatMessage.countDocuments();
    const totalUsers = await ChatMessage.distinct('user').then(users => users.length);
    const totalSessions = await ChatMessage.distinct('sessionId').then(sessions => sessions.length);

    // Intent distribution
    const intentStats = await ChatMessage.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: '$metadata.intent',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Token usage
    const tokenStats = await ChatMessage.aggregate([
      { $match: { role: 'assistant' } },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$tokens.total' },
          avgTokens: { $avg: '$tokens.total' }
        }
      }
    ]);

    // Most active users
    const activeUsers = await ChatMessage.aggregate([
      {
        $group: {
          _id: '$user',
          messageCount: { $sum: 1 }
        }
      },
      { $sort: { messageCount: -1 } },
      { $limit: 10 },
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
        overview: {
          totalMessages,
          totalUsers,
          totalSessions,
          avgMessagesPerUser: totalUsers > 0 ? (totalMessages / totalUsers).toFixed(1) : 0
        },
        intents: intentStats,
        tokens: tokenStats[0] || { totalTokens: 0, avgTokens: 0 },
        activeUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
