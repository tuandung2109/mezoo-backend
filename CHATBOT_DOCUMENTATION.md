# 🤖 Mozi Chatbot API Documentation

## Tổng Quan

Chatbot thông minh sử dụng **Google Gemini AI** để:
- Tư vấn và gợi ý phim phù hợp
- Tìm kiếm phim theo yêu cầu
- Trả lời câu hỏi về phim, diễn viên
- Hỗ trợ người dùng về tính năng, gói đăng ký
- Cá nhân hóa dựa trên lịch sử xem

---

## 🎯 Tính Năng

### 1. **Context-Aware** - Hiểu ngữ cảnh
- Nhớ lịch sử hội thoại (10 tin nhắn gần nhất)
- Biết thông tin user: tên, gói đăng ký, sở thích
- Phân tích thể loại yêu thích từ watchHistory và favorites

### 2. **Intent Recognition** - Nhận diện ý định
- `recommend` - Gợi ý phim
- `search` - Tìm kiếm phim
- `info` - Thông tin phim/diễn viên
- `support` - Hỗ trợ tính năng
- `general` - Trò chuyện chung

### 3. **Smart Recommendations** - Gợi ý thông minh
- Tự động tìm phim phù hợp khi user hỏi
- Trả về top 5 phim với rating cao nhất
- Kèm thông tin: title, genres, rating, năm phát hành

### 4. **Session Management** - Quản lý phiên chat
- Mỗi user có thể có nhiều session
- Lưu trữ lịch sử 30 ngày (auto-delete)
- Xem lại các cuộc hội thoại cũ

---

## 📡 API Endpoints

### 1. Send Message
```http
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Gợi ý phim hành động hay cho tôi",
  "sessionId": "session-123" // optional, default: "default"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Dựa trên sở thích của bạn, tôi gợi ý 5 phim hành động đỉnh cao! 🎬\n\n1. Avengers: Endgame - Siêu phẩm Marvel...",
    "recommendedMovies": [
      {
        "_id": "movie_id",
        "title": "Avengers: Endgame",
        "poster": "https://...",
        "slug": "avengers-endgame",
        "rating": { "average": 8.2 },
        "genres": ["Hành động", "Phiêu lưu"]
      }
    ],
    "intent": "recommend",
    "sessionId": "session-123"
  }
}
```

---

### 2. Get Chat History
```http
GET /api/chat/history?sessionId=session-123&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "msg_id",
      "role": "user",
      "content": "Gợi ý phim hành động",
      "createdAt": "2025-11-20T10:00:00Z",
      "metadata": {
        "intent": "recommend"
      }
    },
    {
      "_id": "msg_id",
      "role": "assistant",
      "content": "Tôi gợi ý...",
      "metadata": {
        "recommendedMovies": [...],
        "intent": "recommend"
      },
      "createdAt": "2025-11-20T10:00:01Z"
    }
  ]
}
```

---

### 3. Clear Chat History
```http
DELETE /api/chat/history?sessionId=session-123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Chat history cleared"
}
```

---

### 4. Get Chat Sessions
```http
GET /api/chat/sessions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "session-123",
      "lastMessage": "Cảm ơn bạn!",
      "lastMessageAt": "2025-11-20T10:00:00Z",
      "messageCount": 15
    }
  ]
}
```

---

### 5. Get Quick Suggestions
```http
GET /api/chat/suggestions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    "Gợi ý phim hành động",
    "Gợi ý phim hay cho tôi",
    "Phim mới nhất là gì?",
    "Tìm phim hành động hay",
    "Giải thích nội dung phim này"
  ]
}
```

---

### 6. Get Chat Statistics (Admin)
```http
GET /api/chat/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalMessages": 1250,
      "totalUsers": 85,
      "totalSessions": 120,
      "avgMessagesPerUser": "14.7"
    },
    "intents": [
      { "_id": "recommend", "count": 450 },
      { "_id": "search", "count": 320 },
      { "_id": "info", "count": 280 }
    ],
    "tokens": {
      "totalTokens": 125000,
      "avgTokens": 100
    },
    "activeUsers": [...]
  }
}
```

---

## 💡 Ví Dụ Sử Dụng

### Gợi ý phim
```
User: "Gợi ý phim hành động hay cho tôi"
Bot: "Dựa trên sở thích của bạn, tôi gợi ý 5 phim hành động đỉnh cao! 🎬

1. Avengers: Endgame (2019) - Hành động, Phiêu lưu - ⭐ 8.2/10
2. John Wick 4 (2023) - Hành động, Gây cấn - ⭐ 7.9/10
..."
```

### Tìm kiếm phim
```
User: "Tìm phim kinh dị Hàn Quốc"
Bot: "Tôi tìm thấy một số phim kinh dị Hàn Quốc hay! 👻

1. Train to Busan (2016) - Kinh dị, Hành động - ⭐ 7.5/10
..."
```

### Hỏi thông tin
```
User: "Avengers Endgame nói về gì?"
Bot: "Avengers: Endgame là phần kết của Infinity Saga! 🎬

Sau khi Thanos xóa sổ 50% sự sống, các Avengers còn lại lên kế hoạch du hành thời gian để đảo ngược thảm họa..."
```

### Hỗ trợ
```
User: "Gói Premium có gì?"
Bot: "Gói Premium của Mozi rất đáng giá! ✨

- Xem phim chất lượng 1080p
- Không quảng cáo
- Tải xuống offline
- 2 thiết bị cùng lúc
..."
```

---

## 🧠 AI Context

Chatbot tự động nhận biết:

### User Context
```javascript
{
  userName: "Nguyễn Văn A",
  subscription: { plan: "premium", isActive: true },
  favoriteGenres: ["Hành động", "Khoa học viễn tưởng"],
  watchHistory: [
    { movie: { title: "Avengers", genres: ["Hành động"] } }
  ]
}
```

### System Prompt
```
Bạn là trợ lý AI thông minh của Mozi - nền tảng xem phim trực tuyến.

NGƯỜI DÙNG: Nguyễn Văn A
GÓI ĐĂNG KÝ: PREMIUM
THỂ LOẠI YÊU THÍCH: Hành động, Khoa học viễn tưởng
ĐÃ XEM GẦN ĐÂY: Avengers, Iron Man, Spider-Man

NHIỆM VỤ:
- Tư vấn và gợi ý phim phù hợp
- Trả lời câu hỏi về phim
...
```

---

## 🔧 Cấu Hình

### Environment Variables
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Gemini Settings
```javascript
{
  temperature: 0.7,      // Creativity (0-1)
  topK: 40,             // Diversity
  topP: 0.95,           // Nucleus sampling
  maxOutputTokens: 1024 // Max response length
}
```

---

## 📊 Database Schema

### ChatMessage Model
```javascript
{
  user: ObjectId,           // User reference
  sessionId: String,        // Session identifier
  role: 'user' | 'assistant' | 'system',
  content: String,          // Message content
  metadata: {
    recommendedMovies: [ObjectId],
    searchQuery: String,
    intent: String,
    confidence: Number
  },
  tokens: {
    prompt: Number,
    completion: Number,
    total: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `{ user, sessionId, createdAt }` - Fast queries
- `{ createdAt }` - TTL index (30 days auto-delete)

---

## 🎨 Frontend Integration

### React Example
```jsx
import { useState } from 'react';
import axios from 'axios';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    const response = await axios.post('/api/chat', {
      message: input,
      sessionId: 'default'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMessages([
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', content: response.data.data.message }
    ]);
    setInput('');
  };

  return (
    <div className="chatbot">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
    </div>
  );
}
```

---

## 🚀 Testing

### Test với cURL
```bash
# Send message
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Gợi ý phim hay cho tôi"}'

# Get history
curl http://localhost:5000/api/chat/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get suggestions
curl http://localhost:5000/api/chat/suggestions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 Performance

- **Response Time:** ~1-3 giây (tùy Gemini API)
- **Token Usage:** ~100-500 tokens/message
- **History Limit:** 10 messages (tối ưu context)
- **Auto-cleanup:** 30 ngày

---

## 🔒 Security

- ✅ JWT Authentication required
- ✅ User isolation (chỉ xem chat của mình)
- ✅ Rate limiting (recommend)
- ✅ Input validation
- ✅ Safe content filtering (Gemini safety settings)

---

## 🎯 Best Practices

1. **Session Management**
   - Tạo sessionId mới cho mỗi cuộc hội thoại
   - Format: `session-${Date.now()}`

2. **Error Handling**
   - Luôn có fallback message
   - Retry logic cho Gemini API

3. **User Experience**
   - Hiển thị typing indicator
   - Show recommended movies as cards
   - Quick reply buttons

4. **Performance**
   - Cache frequent queries
   - Lazy load chat history
   - Debounce user input

---

## 🐛 Troubleshooting

### Lỗi: "Gemini API Error"
- Kiểm tra GEMINI_API_KEY trong .env
- Verify API key còn hiệu lực
- Check quota limits

### Lỗi: "Not authorized"
- Đảm bảo gửi JWT token trong header
- Token chưa expire

### Response chậm
- Gemini API có thể mất 1-3s
- Implement loading state
- Consider caching

---

## 📝 Notes

- Chatbot tự động học từ user context
- Không lưu trữ sensitive information
- Messages tự động xóa sau 30 ngày
- Admin có thể xem statistics

---

## 🔮 Future Enhancements

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Image recognition (poster analysis)
- [ ] Sentiment analysis
- [ ] A/B testing different prompts
- [ ] Real-time streaming responses
- [ ] Integration with recommendation engine
- [ ] Chatbot personality customization

