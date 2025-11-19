const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Genre = require('../models/Genre');

dotenv.config();

const genres = [
  { name: 'Hành động', slug: 'hanh-dong', icon: '⚔️', color: '#FF6B6B' },
  { name: 'Phiêu lưu', slug: 'phieu-luu', icon: '🗺️', color: '#4ECDC4' },
  { name: 'Hoạt hình', slug: 'hoat-hinh', icon: '🎨', color: '#FFE66D' },
  { name: 'Hài', slug: 'hai', icon: '😂', color: '#95E1D3' },
  { name: 'Tội phạm', slug: 'toi-pham', icon: '🔫', color: '#38A3A5' },
  { name: 'Tài liệu', slug: 'tai-lieu', icon: '📚', color: '#57CC99' },
  { name: 'Chính kịch', slug: 'chinh-kich', icon: '🎭', color: '#C7CEEA' },
  { name: 'Gia đình', slug: 'gia-dinh', icon: '👨‍👩‍👧‍👦', color: '#FFDAB9' },
  { name: 'Giả tưởng', slug: 'gia-tuong', icon: '🧙', color: '#B19CD9' },
  { name: 'Lịch sử', slug: 'lich-su', icon: '📜', color: '#DDA15E' },
  { name: 'Kinh dị', slug: 'kinh-di', icon: '👻', color: '#BC4749' },
  { name: 'Nhạc', slug: 'nhac', icon: '🎵', color: '#F4A261' },
  { name: 'Bí ẩn', slug: 'bi-an', icon: '🔍', color: '#2A9D8F' },
  { name: 'Lãng mạn', slug: 'lang-man', icon: '💕', color: '#E76F51' },
  { name: 'Khoa học viễn tưởng', slug: 'khoa-hoc-vien-tuong', icon: '🚀', color: '#264653' },
  { name: 'Phim truyền hình', slug: 'phim-truyen-hinh', icon: '📺', color: '#E9C46A' },
  { name: 'Gây cấn', slug: 'gay-can', icon: '😱', color: '#F4A261' },
  { name: 'Chiến tranh', slug: 'chien-tranh', icon: '⚔️', color: '#8D99AE' },
  { name: 'Miền Tây', slug: 'mien-tay', icon: '🤠', color: '#D4A373' }
];

const seedGenres = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Clear existing genres
    await Genre.deleteMany();
    console.log('Cleared existing genres');

    // Insert new genres
    await Genre.insertMany(genres);
    console.log('Genres seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedGenres();
