# mezoo - Movie Streaming Platform Backend

Backend API cho website xem phim mezoo được xây dựng với MERN stack.

## Cấu trúc Database

### 1. **Movie** - Phim lẻ
- Thông tin chi tiết phim (title, overview, poster, backdrop)
- Đánh giá và rating
- Cast & Crew
- Videos với nhiều chất lượng (480p, 720p, 1080p, 4k)
- Phụ đề
- Thống kê views, popularity

### 2. **Series** - Phim bộ
- Thông tin series
- Seasons và Episodes
- Videos cho từng tập phim
- Cast & Crew

### 3. **User** - Người dùng
- Thông tin tài khoản
- Subscription plans (free, basic, premium, vip)
- Watch history với progress tracking
- Favorites và Watchlist
- Preferences (language, quality, genres)

### 4. **Genre** - Thể loại
- Danh mục thể loại phim
- Icon và màu sắc
- Thống kê số lượng phim

### 5. **Review** - Đánh giá
- Rating từ 1-10
- Nội dung review
- Likes/Dislikes
- Spoiler warning

### 6. **Comment** - Bình luận
- Bình luận phim
- Reply comments (nested)
- Likes

### 7. **Subscription** - Gói đăng ký
- Các gói: Free, Basic, Premium, VIP
- Giá theo tháng/năm
- Features và limits
- Lịch sử thanh toán

### 8. **Playlist** - Danh sách phát
- Tạo playlist cá nhân
- Public/Private
- Followers

### 9. **Notification** - Thông báo
- Thông báo phim mới
- Thông báo tập mới
- Thông báo tương tác

### 10. **ChatMessage** - 🤖 AI Chatbot
- Lịch sử chat với AI
- Session management
- Intent recognition (recommend, search, info, support, howto)
- Token usage tracking
- Metadata (recommendedMovies, genres)
- Auto-delete sau 30 ngày (TTL index)

## Cài đặt

```bash
cd backend
npm install
```

## Cấu hình

File `.env` đã được tạo sẵn với MongoDB connection string của bạn.
Bạn cần thêm TMDB API Key vào file `.env`:
```
TMDB_API_KEY=your_tmdb_api_key_here
```

Lấy TMDB API Key tại: https://www.themoviedb.org/settings/api

## Khởi tạo Database

```bash
# Tạo admin user (email: admin@mezoo.com, password: admin123456)
npm run create:admin

# Seed genres (thể loại phim)
npm run seed:genres
```

## Chạy server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: http://localhost:5000

## API Endpoints

✅ **Authentication** - `/api/auth`
- POST `/register` - Đăng ký
- POST `/login` - Đăng nhập
- GET `/me` - Thông tin user
- PUT `/updatedetails` - Cập nhật thông tin
- PUT `/updatepassword` - Đổi mật khẩu

✅ **Movies** - `/api/movies`
- GET `/` - Danh sách phim (có filter, search, sort)
- GET `/:id` - Chi tiết phim
- GET `/slug/:slug` - Phim theo slug
- GET `/featured` - Phim nổi bật
- GET `/trending` - Phim trending
- POST `/` - Tạo phim (Admin)
- PUT `/:id` - Sửa phim (Admin)
- DELETE `/:id` - Xóa phim (Admin)

✅ **Users** - `/api/users`
- GET `/:id` - Profile user
- GET `/favorites` - Danh sách yêu thích
- POST `/favorites/:movieId` - Thêm yêu thích
- DELETE `/favorites/:movieId` - Xóa yêu thích
- GET `/watchlist` - Danh sách xem sau
- POST `/watchlist/:movieId` - Thêm watchlist
- DELETE `/watchlist/:movieId` - Xóa watchlist
- GET `/history` - Lịch sử xem
- POST `/history/:movieId` - Cập nhật lịch sử
- PUT `/preferences` - Cập nhật preferences

✅ **Reviews** - `/api/reviews`
- GET `/movie/:movieId` - Reviews của phim
- POST `/` - Tạo review
- PUT `/:id` - Sửa review
- DELETE `/:id` - Xóa review
- PUT `/:id/like` - Like review

✅ **Comments** - `/api/comments`
- GET `/movie/:movieId` - Comments của phim
- POST `/` - Tạo comment
- PUT `/:id` - Sửa comment
- DELETE `/:id` - Xóa comment
- PUT `/:id/like` - Like comment

✅ **Genres** - `/api/genres`
- GET `/` - Danh sách thể loại
- GET `/:id` - Chi tiết thể loại
- POST `/` - Tạo thể loại (Admin)
- PUT `/:id` - Sửa thể loại (Admin)
- DELETE `/:id` - Xóa thể loại (Admin)

✅ **TMDB Integration** - `/api/tmdb` (Admin only)
- GET `/search` - Tìm phim trên TMDB
- GET `/popular` - Phim phổ biến từ TMDB
- POST `/import/movie/:tmdbId` - Import phim
- POST `/import/genres` - Import thể loại
- POST `/import/bulk` - Import hàng loạt

✅ **Chatbot AI** - `/api/chat` 🤖
- POST `/` - Gửi tin nhắn
- GET `/history` - Lịch sử chat
- DELETE `/history` - Xóa lịch sử
- GET `/sessions` - Danh sách sessions
- GET `/suggestions` - Gợi ý nhanh
- GET `/admin/stats` - Thống kê (Admin)

📖 **Chi tiết API**: Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
📖 **Chatbot API**: Xem [CHATBOT_DOCUMENTATION.md](./CHATBOT_DOCUMENTATION.md)

## Tính năng Database

✅ User authentication & authorization
✅ Movie & Series management
✅ Rating & Review system
✅ Comment system với nested replies
✅ Watch history với progress tracking
✅ Favorites & Watchlist
✅ Subscription plans
✅ Playlist management
✅ Notification system
✅ Multi-quality video support
✅ Subtitle support
✅ Search optimization với indexes
✅ TMDB integration ready
✅ **AI Chatbot với Google Gemini** 🤖

## 🤖 AI Chatbot

### Tính năng
Chatbot AI thông minh sử dụng **Google Gemini 2.5 Flash** để:
- 🎬 Gợi ý phim phù hợp với sở thích user
- 🔍 Tìm kiếm phim theo thể loại, năm, rating
- 💡 Trả lời câu hỏi về phim, diễn viên, đạo diễn
- 🎯 Tư vấn gói đăng ký (Free, Basic, Premium, VIP)
- ✨ Hướng dẫn sử dụng tính năng mezoo
- 📊 Cá nhân hóa dựa trên lịch sử xem và sở thích

### Kiến trúc
```
User → Frontend (Chatbot.jsx) → Backend API (/api/chat)
                                      ↓
                              chatController.js
                                      ↓
                              gemini.js (AI Service)
                                      ↓
                              Google Gemini API
                                      ↓
                              MongoDB (ChatMessage)
```

### Setup
```bash
# API Key đã có sẵn trong .env
GEMINI_API_KEY=your_key_here

# Test chatbot
npm run test:chatbot
```

### Test Scripts
```bash
# Test cơ bản
node test-chat-simple.js

# Test câu hỏi về mezoo
node test-mezoo-questions.js

# Test Gemini API trực tiếp
node test-gemini-direct.js

# List available models
node test-list-models.js
```

### Ví dụ sử dụng
```javascript
// POST /api/chat
{
  "message": "Gợi ý phim hành động hay cho tôi"
}

// Response
{
  "success": true,
  "data": {
    "message": "Dựa trên sở thích của bạn, tôi gợi ý 5 phim hành động đỉnh cao! 🎬...",
    "intent": "recommend",
    "recommendedMovies": [
      {
        "_id": "...",
        "title": "Avengers: Endgame",
        "rating": 8.2,
        "genres": ["Hành động", "Phiêu lưu"],
        "poster": "..."
      }
    ]
  }
}
```

### Intent Recognition
Chatbot tự động nhận diện 5 loại ý định:
- `recommend` - Gợi ý phim
- `search` - Tìm kiếm phim
- `info` - Thông tin phim/diễn viên
- `support` - Hỗ trợ tính năng
- `howto` - Hướng dẫn sử dụng

### Context-Aware
Chatbot hiểu thông tin user:
- Tên và gói đăng ký
- Thể loại yêu thích (từ watchHistory và favorites)
- Lịch sử xem gần đây
- 10 tin nhắn gần nhất trong session

### Documentation
- [CHATBOT_README.md](../CHATBOT_README.md) - Tổng quan đầy đủ
- [CHATBOT_DOCUMENTATION.md](./CHATBOT_DOCUMENTATION.md) - API docs
- [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) - Setup chi tiết
- [CHATBOT_QUICKSTART.md](../CHATBOT_QUICKSTART.md) - Hướng dẫn nhanh 5 phút
- [CHATBOT_CAPABILITIES.md](../CHATBOT_CAPABILITIES.md) - Khả năng chatbot
- [CHATBOT_EXAMPLES.md](../CHATBOT_EXAMPLES.md) - Ví dụ thực tế
