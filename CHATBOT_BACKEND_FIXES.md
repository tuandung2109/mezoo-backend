# 🔧 Chatbot Backend Fixes & Improvements

## 📊 Tổng quan

Đã review và cải thiện backend chatbot để hỗ trợ cả **authenticated users** và **guest users**.

---

## ✅ Những gì đã làm

### 1. **Tạo Optional Auth Middleware** ✨

**File:** `backend/middleware/optionalAuth.js`

- Middleware mới cho phép request với hoặc không có token
- Nếu có token hợp lệ → `req.user` = user info, `req.isGuest` = false
- Nếu không có token hoặc token invalid → `req.user` = null, `req.isGuest` = true
- Không block request như `protect` middleware

```javascript
exports.optionalAuth = async (req, res, next) => {
  // Check token
  // If valid → set req.user
  // If invalid/missing → set req.isGuest = true
  next();
};
```

### 2. **Cập nhật Chat Controller** 🎯

**File:** `backend/controllers/chatController.js`

#### Thay đổi trong `sendMessage`:

**Before:**
```javascript
exports.sendMessage = async (req, res) => {
  const userId = req.user.id; // ❌ Crash nếu không có user
  const user = await User.findById(userId); // ❌ Bắt buộc user
  // ...
}
```

**After:**
```javascript
exports.sendMessage = async (req, res) => {
  const userId = req.user?.id;
  const isGuest = req.isGuest || !userId;
  
  // Get user context (if authenticated)
  let user = null;
  if (!isGuest) {
    user = await User.findById(userId)...
  }
  
  // Build context with guest support
  const userContext = {
    userName: user?.fullName || 'bạn',
    subscription: user?.subscription || { plan: 'free' },
    isGuest
  };
  
  // Save messages only for authenticated users
  if (!isGuest) {
    await ChatMessage.create(...);
  }
  
  // Return response with movieData for frontend
  res.json({
    response: aiResponse.content,
    movieData: recommendedMovies[0] || null,
    isGuest
  });
}
```

#### Key Changes:
- ✅ Hỗ trợ guest users (không crash)
- ✅ Không lưu chat history cho guest
- ✅ Vẫn gọi Gemini AI cho guest
- ✅ Vẫn recommend phim cho guest
- ✅ Response format phù hợp với frontend

### 3. **Cập nhật Routes** 🛣️

**File:** `backend/routes/chat.js`

**Before:**
```javascript
router.post('/', protect, sendMessage); // ❌ Bắt buộc đăng nhập
```

**After:**
```javascript
const { optionalAuth } = require('../middleware/optionalAuth');

router.post('/send', optionalAuth, sendMessage); // ✅ Optional auth
router.get('/history', protect, getChatHistory); // ✅ Vẫn require auth
router.delete('/history', protect, clearChatHistory); // ✅ Vẫn require auth
```

### 4. **Cập nhật Gemini System Prompt** 🤖

**File:** `backend/utils/gemini.js`

**Thêm context cho guest users:**

```javascript
buildSystemPrompt(userContext = {}) {
  const { userName, subscription, favoriteGenres, watchHistory, isGuest } = userContext;
  
  // ... existing prompt ...
  
  if (isGuest) {
    prompt += `\n\n⚠️ QUAN TRỌNG: Người dùng CHƯA ĐĂNG NHẬP (Guest)`;
    prompt += `\n- Khuyến khích đăng ký/đăng nhập để trải nghiệm đầy đủ`;
    prompt += `\n- Giới thiệu các tính năng cần đăng nhập`;
    prompt += `\n- Vẫn gợi ý phim nhưng nhắc nhở đăng nhập`;
  }
  
  return prompt;
}
```

---

## 🎯 Kết quả

### ✅ **Guest Users (Chưa đăng nhập):**
- ✅ Có thể chat với bot
- ✅ Nhận gợi ý phim
- ✅ Tìm kiếm phim
- ✅ Hỏi về tính năng Mozi
- ✅ Bot khuyến khích đăng nhập
- ❌ Không lưu chat history
- ❌ Không có personalization

### ✅ **Authenticated Users (Đã đăng nhập):**
- ✅ Tất cả tính năng của guest
- ✅ Lưu chat history
- ✅ Personalized recommendations
- ✅ Context từ watch history
- ✅ Context từ favorites
- ✅ Gợi ý dựa trên sở thích

---

## 📝 API Endpoints

### 1. **Send Message** (Public with optional auth)
```
POST /api/chat/send
Headers: Authorization: Bearer <token> (optional)
Body: {
  "message": "Gợi ý phim hành động hay"
}

Response: {
  "success": true,
  "data": {
    "response": "Đây là một số phim hành động hay...",
    "movieData": {
      "_id": "...",
      "title": "...",
      "poster": "...",
      "rating": 8.5,
      "releaseDate": "...",
      "genres": ["Action"]
    },
    "intent": "recommend",
    "isGuest": false
  }
}
```

### 2. **Get Chat History** (Private)
```
GET /api/chat/history?sessionId=default&limit=50
Headers: Authorization: Bearer <token> (required)
```

### 3. **Clear Chat History** (Private)
```
DELETE /api/chat/history?sessionId=default
Headers: Authorization: Bearer <token> (required)
```

### 4. **Get Chat Sessions** (Private)
```
GET /api/chat/sessions
Headers: Authorization: Bearer <token> (required)
```

### 5. **Get Quick Suggestions** (Private)
```
GET /api/chat/suggestions
Headers: Authorization: Bearer <token> (required)
```

### 6. **Get Chat Stats** (Admin only)
```
GET /api/chat/admin/stats
Headers: Authorization: Bearer <admin_token> (required)
```

---

## 🔍 Code Quality Review

### ✅ **Điểm mạnh:**

1. **Architecture:**
   - ✅ MVC pattern rõ ràng
   - ✅ Separation of concerns tốt
   - ✅ Middleware reusable

2. **AI Integration:**
   - ✅ Gemini API với retry logic (3 attempts)
   - ✅ Detailed system prompt
   - ✅ Intent analysis
   - ✅ Genre extraction
   - ✅ Feature info contextual

3. **User Experience:**
   - ✅ Personalized responses
   - ✅ Movie recommendations
   - ✅ Chat history
   - ✅ Quick suggestions

4. **Error Handling:**
   - ✅ Try-catch blocks
   - ✅ Proper error messages
   - ✅ Retry logic for API

### 💡 **Gợi ý cải thiện thêm:**

1. **Rate Limiting:**
   ```javascript
   // Thêm rate limit cho guest users
   const rateLimit = require('express-rate-limit');
   
   const chatLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 20, // 20 requests per 15 minutes for guests
     message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
   });
   
   router.post('/send', chatLimiter, optionalAuth, sendMessage);
   ```

2. **Caching:**
   ```javascript
   // Cache movie recommendations
   const NodeCache = require('node-cache');
   const movieCache = new NodeCache({ stdTTL: 600 }); // 10 minutes
   ```

3. **Analytics:**
   ```javascript
   // Track guest vs authenticated usage
   if (isGuest) {
     await Analytics.track('guest_chat', { intent, message });
   }
   ```

4. **Response Streaming:**
   ```javascript
   // Stream AI response cho UX tốt hơn
   const stream = await gemini.chatStream(messages);
   ```

---

## 🧪 Testing

### Test với Guest User:
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"message": "Gợi ý phim hành động hay"}'
```

### Test với Authenticated User:
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message": "Gợi ý phim hành động hay"}'
```

---

## 📚 Related Files

- `backend/controllers/chatController.js` - Main chat logic
- `backend/routes/chat.js` - API routes
- `backend/utils/gemini.js` - Gemini AI service
- `backend/middleware/optionalAuth.js` - Optional auth middleware
- `backend/models/ChatMessage.js` - Chat message model
- `frontend/src/components/Chatbot.jsx` - Frontend chatbot

---

## 🎉 Summary

Backend chatbot đã được cải thiện để:
- ✅ Hỗ trợ cả guest và authenticated users
- ✅ Không crash khi không có token
- ✅ Response format phù hợp với frontend
- ✅ Personalization cho authenticated users
- ✅ Khuyến khích guest đăng nhập
- ✅ Code clean và maintainable

**Status:** ✅ Ready for production!
