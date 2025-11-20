# Mozi API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Sử dụng JWT Bearer Token trong header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Routes

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update User Details
```http
PUT /api/auth/updatedetails
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "New Name",
  "email": "newemail@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Update Password
```http
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## 🎬 Movie Routes

### Get All Movies
```http
GET /api/movies?page=1&limit=20&sort=latest&genre=Action&year=2025&search=avengers
```

Query Parameters:
- `page` - Trang (default: 1)
- `limit` - Số phim mỗi trang (default: 20)
- `sort` - Sắp xếp: latest, popular, rating
- `genre` - Lọc theo thể loại
- `year` - Lọc theo năm
- `search` - Tìm kiếm

### Get Single Movie
```http
GET /api/movies/:id
```

### Get Movie by Slug
```http
GET /api/movies/slug/:slug
```

### Get Featured Movies
```http
GET /api/movies/featured
```

### Get Trending Movies
```http
GET /api/movies/trending
```

### Create Movie (Admin)
```http
POST /api/movies
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Movie Title",
  "overview": "Movie description",
  "poster": "https://image.url",
  "releaseDate": "2025-01-01",
  "runtime": 120,
  "genres": ["Action", "Adventure"]
}
```

### Update Movie (Admin)
```http
PUT /api/movies/:id
Authorization: Bearer <admin_token>
```

### Delete Movie (Admin)
```http
DELETE /api/movies/:id
Authorization: Bearer <admin_token>
```

---

## 👤 User Routes

### Get User Profile
```http
GET /api/users/:id
```

### Get Favorites
```http
GET /api/users/favorites
Authorization: Bearer <token>
```

### Add to Favorites
```http
POST /api/users/favorites/:movieId
Authorization: Bearer <token>
```

### Remove from Favorites
```http
DELETE /api/users/favorites/:movieId
Authorization: Bearer <token>
```

### Get Watchlist
```http
GET /api/users/watchlist
Authorization: Bearer <token>
```

### Add to Watchlist
```http
POST /api/users/watchlist/:movieId
Authorization: Bearer <token>
```

### Remove from Watchlist
```http
DELETE /api/users/watchlist/:movieId
Authorization: Bearer <token>
```

### Get Watch History
```http
GET /api/users/history
Authorization: Bearer <token>
```

### Add to History
```http
POST /api/users/history/:movieId
Authorization: Bearer <token>
Content-Type: application/json

{
  "progress": 45,
  "completed": false
}
```

### Update Preferences
```http
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "language": "vi",
  "quality": "1080p",
  "autoplay": true,
  "genres": ["Action", "Sci-Fi"]
}
```

---

## ⭐ Review Routes

### Get Movie Reviews
```http
GET /api/reviews/movie/:movieId
```

### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "movie": "movie_id",
  "rating": 8.5,
  "title": "Great movie!",
  "content": "This is an amazing movie...",
  "spoiler": false
}
```

### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
```

### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

### Like Review
```http
PUT /api/reviews/:id/like
Authorization: Bearer <token>
```

---

## 💬 Comment Routes

### Get Movie Comments
```http
GET /api/comments/movie/:movieId
```

### Create Comment
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "movie": "movie_id",
  "content": "Great movie!",
  "parentComment": null
}
```

### Update Comment
```http
PUT /api/comments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated comment"
}
```

### Delete Comment
```http
DELETE /api/comments/:id
Authorization: Bearer <token>
```

### Like Comment
```http
PUT /api/comments/:id/like
Authorization: Bearer <token>
```

---

## 🎭 Genre Routes

### Get All Genres
```http
GET /api/genres
```

### Get Single Genre
```http
GET /api/genres/:id
```

### Create Genre (Admin)
```http
POST /api/genres
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Action",
  "slug": "action",
  "description": "Action movies",
  "icon": "⚔️",
  "color": "#FF6B6B"
}
```

---

## 🎥 TMDB Integration Routes (Admin Only)

### Search TMDB
```http
GET /api/tmdb/search?query=avengers&page=1
Authorization: Bearer <admin_token>
```

### Get Popular from TMDB
```http
GET /api/tmdb/popular?page=1
Authorization: Bearer <admin_token>
```

### Import Movie from TMDB
```http
POST /api/tmdb/import/movie/:tmdbId
Authorization: Bearer <admin_token>
```

### Import Genres from TMDB
```http
POST /api/tmdb/import/genres
Authorization: Bearer <admin_token>
```

### Bulk Import Movies
```http
POST /api/tmdb/import/bulk
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "pages": 5
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "total": 100,
  "page": 1,
  "pages": 10
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error
