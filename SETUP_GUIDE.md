# Hướng dẫn Setup Backend mezoo

## Bước 1: Cài đặt Dependencies

```bash
cd backend
npm install
```

## Bước 2: Cấu hình TMDB API

1. Truy cập https://www.themoviedb.org/
2. Đăng ký tài khoản (miễn phí)
3. Vào Settings > API
4. Request API Key (chọn Developer)
5. Copy API Key và paste vào file `.env`:

```env
TMDB_API_KEY=your_api_key_here
```

## Bước 3: Khởi tạo Database

### Tạo Admin User
```bash
npm run create:admin
```

Thông tin đăng nhập admin:
- Email: `admin@mezoo.com`
- Password: `admin123456`

⚠️ **Quan trọng**: Đổi password sau khi đăng nhập lần đầu!

### Seed Genres (Thể loại phim)
```bash
npm run seed:genres
```

Sẽ tạo 19 thể loại phim tiếng Việt.

## Bước 4: Chạy Server

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:5000

## Bước 5: Import Phim từ TMDB

### Cách 1: Import từng phim

1. Đăng nhập với tài khoản admin
2. Lấy JWT token từ response
3. Tìm phim trên TMDB:

```bash
GET https://mezoo-backend.onrender.com/api/tmdb/search?query=avengers
Authorization: Bearer <admin_token>
```

4. Import phim bằng TMDB ID:

```bash
POST https://mezoo-backend.onrender.com/api/tmdb/import/movie/299536
Authorization: Bearer <admin_token>
```

### Cách 2: Bulk Import (Khuyến nghị)

Import nhiều phim phổ biến cùng lúc:

```bash
POST https://mezoo-backend.onrender.com/api/tmdb/import/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "pages": 5
}
```

Sẽ import ~100 phim phổ biến (20 phim/page × 5 pages)

## Bước 6: Test API

### Test với Postman hoặc Thunder Client

1. **Register User**
```http
POST https://mezoo-backend.onrender.com/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "test123456",
  "fullName": "Test User"
}
```

2. **Login**
```http
POST https://mezoo-backend.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123456"
}
```

3. **Get Movies**
```http
GET https://mezoo-backend.onrender.com/api/movies?page=1&limit=20
```

4. **Get Genres**
```http
GET https://mezoo-backend.onrender.com/api/genres
```

## Cấu trúc API Endpoints

Xem chi tiết tại: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Public Routes (Không cần token)
- `GET /api/movies` - Danh sách phim
- `GET /api/movies/:id` - Chi tiết phim
- `GET /api/genres` - Danh sách thể loại
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Protected Routes (Cần token)
- `GET /api/auth/me` - Thông tin user
- `POST /api/reviews` - Tạo review
- `POST /api/comments` - Tạo comment
- `POST /api/users/favorites/:movieId` - Thêm yêu thích
- `POST /api/users/watchlist/:movieId` - Thêm watchlist

### Admin Routes (Cần admin token)
- `POST /api/movies` - Tạo phim
- `PUT /api/movies/:id` - Sửa phim
- `DELETE /api/movies/:id` - Xóa phim
- `POST /api/tmdb/import/movie/:tmdbId` - Import từ TMDB
- `POST /api/tmdb/import/bulk` - Bulk import

## Troubleshooting

### Lỗi kết nối MongoDB
- Kiểm tra connection string trong `.env`
- Đảm bảo IP của bạn được whitelist trên MongoDB Atlas
- Kiểm tra username/password

### Lỗi TMDB API
- Kiểm tra API key trong `.env`
- Đảm bảo API key còn hiệu lực
- Kiểm tra rate limit (40 requests/10 seconds)

### Port 5000 đã được sử dụng
Đổi port trong `.env`:
```env
PORT=3001
```

## Next Steps

1. ✅ Backend đã sẵn sàng
2. 🔜 Tạo Frontend React
3. 🔜 Tích hợp Frontend với Backend
4. 🔜 Deploy lên production

## Liên hệ & Support

Nếu gặp vấn đề, hãy kiểm tra:
- MongoDB connection string
- TMDB API key
- Node.js version (khuyến nghị >= 16.x)
- npm version
