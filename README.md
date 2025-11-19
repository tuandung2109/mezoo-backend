# Mozi - Movie Streaming Platform Backend

Backend API cho website xem phim Mozi được xây dựng với MERN stack.

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
# Tạo admin user (email: admin@mozi.com, password: admin123456)
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

📖 **Chi tiết API**: Xem [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

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
