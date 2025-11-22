# 🚀 Hướng Dẫn Setup Chatbot mezoo

## Bước 1: Cài Đặt Dependencies

Backend đã có sẵn `axios` trong package.json, không cần cài thêm gì.

## Bước 2: Kiểm Tra Gemini API Key

File `.env` đã có sẵn:
```env
GEMINI_API_KEY=AIzaSyAOPxK9GmqHotX5HzYz14Q0DHNpDWcrM
```

✅ API Key đã được cấu hình sẵn!

## Bước 3: Restart Server

```bash
cd backend
npm run dev
```

Server sẽ tự động load route `/api/chat`

## Bước 4: Test API với Postman/Thunder Client

### 1. Login để lấy token
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@mezoo.com",
  "password": "admin123456"
}
```

Copy `token` từ response.

### 2. Test Chat
```http
POST http://localhost:5000/api/chat
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "message": "Gợi ý phim hành động hay cho tôi",
  "sessionId": "test-session-1"
}
```

### 3. Test Quick Suggestions
```http
GET http://localhost:5000/api/chat/suggestions
Authorization: Bearer YOUR_TOKEN
```

### 4. Test Chat History
```http
GET http://localhost:5000/api/chat/history?sessionId=test-session-1
Authorization: Bearer YOUR_TOKEN
```

## Bước 5: Tích Hợp Frontend

### 1. Import Chatbot vào App.jsx

```jsx
import Chatbot from './components/Chatbot';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ... existing routes ... */}
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}
```

### 2. Kiểm tra .env của frontend

File `frontend/mezoo-frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Restart Frontend

```bash
cd frontend/mezoo-frontend
npm run dev
```

## Bước 6: Test Trên Browser

1. Mở http://localhost:5173
2. Đăng nhập với tài khoản
3. Click vào nút chat 💬 ở góc dưới bên phải
4. Thử các câu hỏi:
   - "Gợi ý phim hay cho tôi"
   - "Tìm phim hành động"
   - "Phim Avengers nói về gì?"
   - "Gói Premium có gì?"

## 🎯 Các Tính Năng Đã Hoàn Thành

✅ **Backend:**
- Model: ChatMessage
- Controller: chatController.js
- Route: /api/chat
- Gemini AI integration
- Intent recognition
- Movie recommendations
- Session management
- Chat history
- Quick suggestions
- Admin statistics

✅ **Frontend:**
- Chatbot component
- Beautiful UI với animations
- Typing indicator
- Movie cards trong chat
- Quick reply suggestions
- Auto-scroll
- Responsive design
- Dark mode support

## 📊 Database

ChatMessage collection sẽ tự động được tạo khi có tin nhắn đầu tiên.

Kiểm tra trên MongoDB:
```javascript
db.chatmessages.find().pretty()
```

## 🧪 Test Cases

### Test 1: Gợi ý phim
```
User: "Gợi ý phim hành động hay"
Expected: Bot trả về list 5 phim hành động với rating cao
```

### Test 2: Tìm kiếm
```
User: "Tìm phim kinh dị"
Expected: Bot tìm và gợi ý phim kinh dị
```

### Test 3: Thông tin phim
```
User: "Avengers Endgame nói về gì?"
Expected: Bot giải thích nội dung phim
```

### Test 4: Hỗ trợ
```
User: "Gói Premium có gì?"
Expected: Bot giải thích tính năng gói Premium
```

### Test 5: Context awareness
```
User: "Gợi ý phim cho tôi"
Expected: Bot dựa vào lịch sử xem và sở thích để gợi ý
```

## 🐛 Troubleshooting

### Lỗi: "Gemini API Error"
**Nguyên nhân:** API key không hợp lệ hoặc hết quota

**Giải pháp:**
1. Kiểm tra GEMINI_API_KEY trong .env
2. Tạo API key mới tại: https://makersuite.google.com/app/apikey
3. Update vào .env và restart server

### Lỗi: "Not authorized"
**Nguyên nhân:** Chưa đăng nhập hoặc token hết hạn

**Giải pháp:**
1. Đăng nhập lại
2. Kiểm tra localStorage có token không
3. Token có thể hết hạn sau 30 ngày

### Chatbot không hiển thị
**Nguyên nhân:** Chưa import vào App.jsx

**Giải pháp:**
```jsx
import Chatbot from './components/Chatbot';

// Thêm vào return của App
<Chatbot />
```

### Response chậm
**Nguyên nhân:** Gemini API có thể mất 1-3 giây

**Giải pháp:**
- Đây là bình thường
- Loading indicator đã được implement
- Có thể cache frequent queries

## 📈 Monitoring

### Check số lượng messages
```javascript
db.chatmessages.countDocuments()
```

### Check intent distribution
```javascript
db.chatmessages.aggregate([
  { $match: { role: 'user' } },
  { $group: { _id: '$metadata.intent', count: { $sum: 1 } } }
])
```

### Check token usage
```javascript
db.chatmessages.aggregate([
  { $match: { role: 'assistant' } },
  { $group: { _id: null, total: { $sum: '$tokens.total' } } }
])
```

## 🎨 Customization

### Thay đổi System Prompt
Edit `backend/utils/gemini.js` - method `buildSystemPrompt()`

### Thay đổi UI
Edit `frontend/mezoo-frontend/src/components/Chatbot.css`

### Thay đổi số phim gợi ý
Edit `backend/controllers/chatController.js` - line `.limit(5)`

### Thay đổi history limit
Edit `backend/controllers/chatController.js` - line `.limit(10)`

## 🚀 Next Steps

1. ✅ Backend hoàn thành
2. ✅ Frontend hoàn thành
3. 🔜 Test với real users
4. 🔜 Collect feedback
5. 🔜 Optimize prompts
6. 🔜 Add more features

## 📝 Notes

- Messages tự động xóa sau 30 ngày (TTL index)
- Mỗi request tốn ~100-500 tokens
- Gemini API free tier: 60 requests/minute
- Chatbot hoạt động tốt nhất với user đã có lịch sử xem

## 🎉 Done!

Chatbot đã sẵn sàng sử dụng! Hãy thử chat và xem kết quả nhé! 🚀
