const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

class GeminiService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async chat(messages, context = {}) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Format messages for Gemini
        const contents = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const response = await axios.post(
          `${GEMINI_API_URL}?key=${this.apiKey}`,
          {
            contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              },
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        // Check if response is valid
        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
          console.error('Invalid Gemini response:', JSON.stringify(response.data, null, 2));
          throw new Error('No response from Gemini AI');
        }

        const reply = response.data.candidates[0].content.parts[0].text;
        const usage = response.data.usageMetadata || {};

        return {
          content: reply,
          tokens: {
            prompt: usage.promptTokenCount || 0,
            completion: usage.candidatesTokenCount || 0,
            total: usage.totalTokenCount || 0
          }
        };

      } catch (error) {
        lastError = error;
        const status = error.response?.status;
        
        // Retry on 503 (overloaded) or 429 (rate limit)
        if ((status === 503 || status === 429) && attempt < maxRetries) {
          const waitTime = attempt * 2000; // 2s, 4s, 6s
          console.log(`⏳ Gemini API busy, retrying in ${waitTime/1000}s... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // Log error
        console.error('Gemini API Error:', error.response?.data || error.message);
        if (error.response?.data) {
          console.error('Full error:', JSON.stringify(error.response.data, null, 2));
        }
        
        // Don't retry on other errors
        break;
      }
    }

    // All retries failed
    throw new Error(`Gemini API Error: ${lastError.message}`);
  }

  // Build system prompt with context
  buildSystemPrompt(userContext = {}) {
    const { userName, subscription, favoriteGenres, watchHistory } = userContext;

    let prompt = `Bạn là trợ lý AI thông minh của MOZI - nền tảng xem phim trực tuyến hàng đầu Việt Nam.

🎬 VỀ MOZI:
Mozi là nền tảng streaming phim với hàng nghìn bộ phim chất lượng cao, từ Hollywood đến Châu Á. 
Mozi cung cấp trải nghiệm xem phim mượt mà với nhiều tính năng thông minh.

📊 CÁC GÓI ĐĂNG KÝ:

1. FREE (Miễn phí):
   - Xem phim chất lượng 480p
   - Có quảng cáo
   - 1 thiết bị
   - Thư viện phim giới hạn

2. BASIC (49.000đ/tháng):
   - Xem phim 720p HD
   - Ít quảng cáo hơn
   - 1 thiết bị
   - Toàn bộ thư viện phim

3. PREMIUM (99.000đ/tháng - PHỔ BIẾN NHẤT):
   - Xem phim 1080p Full HD
   - Không quảng cáo
   - 2 thiết bị cùng lúc
   - Tải xuống offline
   - Nội dung độc quyền
   - Xem trước phim mới

4. VIP (199.000đ/tháng):
   - Xem phim 4K Ultra HD
   - Không quảng cáo
   - 4 thiết bị cùng lúc
   - Tải xuống không giới hạn
   - Nội dung VIP độc quyền
   - Xem sớm phim mới nhất
   - Hỗ trợ ưu tiên 24/7

💎 TÍNH NĂNG MOZI:

1. Xem Phim:
   - Thư viện phim đa dạng: Hành động, Kinh dị, Hài, Lãng mạn, Khoa học viễn tưởng...
   - Chất lượng từ 480p đến 4K
   - Phụ đề tiếng Việt
   - Tua nhanh, tua lại
   - Lưu vị trí xem (continue watching)

2. Danh Sách Cá Nhân:
   - Yêu thích (Favorites): Lưu phim yêu thích
   - Xem sau (Watchlist): Đánh dấu phim muốn xem
   - Lịch sử xem (History): Xem lại phim đã xem
   - Tiếp tục xem: Xem tiếp từ vị trí đã dừng

3. Tìm Kiếm & Khám Phá:
   - Tìm kiếm theo tên phim, diễn viên, đạo diễn
   - Lọc theo thể loại, năm, rating
   - Phim trending (đang hot)
   - Phim mới nhất
   - Phim được đề xuất dựa trên sở thích

4. Đánh Giá & Tương Tác:
   - Đánh giá phim (1-5 sao)
   - Viết review
   - Bình luận và thảo luận
   - Like/Unlike reviews

5. Thống Kê Cá Nhân:
   - Tổng phim đã xem
   - Thời gian xem
   - Thể loại yêu thích
   - Hoạt động theo tháng
   - Thành tích (achievements)

6. Trang Admin (Dành cho quản trị viên):
   - Quản lý phim
   - Quản lý người dùng
   - Thống kê hệ thống
   - Import phim từ TMDB

🎯 NHIỆM VỤ CỦA BẠN:
1. Tư vấn phim phù hợp với sở thích user
2. Giải thích tính năng của Mozi
3. Hướng dẫn sử dụng website
4. So sánh các gói đăng ký
5. Trả lời câu hỏi về phim
6. Hỗ trợ kỹ thuật cơ bản

💬 PHONG CÁCH TRẢ LỜI:
- Thân thiện, nhiệt tình như người bạn
- Ngắn gọn, súc tích (2-4 câu)
- Dùng emoji phù hợp 🎬🍿✨💎🔥
- Gọi user bằng tên nếu biết
- Đưa ra gợi ý cụ thể, có thể hành động
- Không dài dòng, không lặp lại

📌 LƯU Ý QUAN TRỌNG:
- Luôn đề cập đến tính năng của Mozi khi phù hợp
- Gợi ý nâng cấp gói khi user hỏi về tính năng cao cấp
- Hướng dẫn cách sử dụng tính năng cụ thể
- Nếu không biết thông tin phim, hãy thừa nhận và gợi ý tìm kiếm

`;

    if (userName) {
      prompt += `\n👤 NGƯỜI DÙNG: ${userName}`;
    }

    if (favoriteGenres && favoriteGenres.length > 0) {
      prompt += `\n❤️ THỂ LOẠI YÊU THÍCH: ${favoriteGenres.join(', ')}`;
    }

    if (watchHistory && watchHistory.length > 0) {
      const recentMovies = watchHistory.slice(0, 5).map(h => h.movie?.title).filter(Boolean);
      if (recentMovies.length > 0) {
        prompt += `\n📺 ĐÃ XEM GẦN ĐÂY: ${recentMovies.join(', ')}`;
      }
    }

    prompt += `\n\n🎬 Hãy trả lời một cách hữu ích và thân thiện!`;

    return prompt;
  }

  // Analyze user intent
  analyzeIntent(message) {
    const lowerMsg = message.toLowerCase();

    // Recommend intent
    if (
      lowerMsg.includes('gợi ý') ||
      lowerMsg.includes('đề xuất') ||
      lowerMsg.includes('recommend') ||
      lowerMsg.includes('phim hay') ||
      lowerMsg.includes('nên xem') ||
      lowerMsg.includes('xem gì')
    ) {
      return 'recommend';
    }

    // Search intent
    if (
      lowerMsg.includes('tìm') ||
      lowerMsg.includes('search') ||
      lowerMsg.includes('có phim') ||
      lowerMsg.includes('phim nào') ||
      lowerMsg.includes('tìm kiếm')
    ) {
      return 'search';
    }

    // Info intent
    if (
      lowerMsg.includes('là gì') ||
      lowerMsg.includes('thông tin') ||
      lowerMsg.includes('nội dung') ||
      lowerMsg.includes('diễn viên') ||
      lowerMsg.includes('đạo diễn') ||
      lowerMsg.includes('về phim') ||
      lowerMsg.includes('kể về')
    ) {
      return 'info';
    }

    // Support intent - Subscription & Features
    if (
      lowerMsg.includes('gói') ||
      lowerMsg.includes('subscription') ||
      lowerMsg.includes('đăng ký') ||
      lowerMsg.includes('giá') ||
      lowerMsg.includes('tính năng') ||
      lowerMsg.includes('premium') ||
      lowerMsg.includes('vip') ||
      lowerMsg.includes('basic') ||
      lowerMsg.includes('free') ||
      lowerMsg.includes('nâng cấp') ||
      lowerMsg.includes('upgrade') ||
      lowerMsg.includes('thanh toán') ||
      lowerMsg.includes('payment')
    ) {
      return 'support';
    }

    // How-to intent - Usage instructions
    if (
      lowerMsg.includes('làm sao') ||
      lowerMsg.includes('cách') ||
      lowerMsg.includes('how to') ||
      lowerMsg.includes('hướng dẫn') ||
      lowerMsg.includes('sử dụng') ||
      lowerMsg.includes('thêm vào') ||
      lowerMsg.includes('xóa') ||
      lowerMsg.includes('tải xuống') ||
      lowerMsg.includes('download')
    ) {
      return 'howto';
    }

    return 'general';
  }

  // Extract genres from message
  extractGenres(message) {
    const genres = [
      'hành động', 'phiêu lưu', 'hoạt hình', 'hài', 'tội phạm',
      'tài liệu', 'chính kịch', 'gia đình', 'giả tưởng', 'lịch sử',
      'kinh dị', 'nhạc', 'bí ẩn', 'lãng mạn', 'khoa học viễn tưởng',
      'gây cấn', 'chiến tranh', 'miền tây'
    ];

    const lowerMsg = message.toLowerCase();
    return genres.filter(genre => lowerMsg.includes(genre));
  }

  // Get feature info based on keywords
  getFeatureInfo(message) {
    const lowerMsg = message.toLowerCase();
    let info = '';

    // Favorites
    if (lowerMsg.includes('yêu thích') || lowerMsg.includes('favorite')) {
      info += '\n\n💖 TÍNH NĂNG YÊU THÍCH:\n';
      info += '- Click icon ❤️ trên phim để thêm vào danh sách yêu thích\n';
      info += '- Xem tất cả phim yêu thích tại trang "My List"\n';
      info += '- Dễ dàng truy cập lại phim bạn thích nhất';
    }

    // Watchlist
    if (lowerMsg.includes('xem sau') || lowerMsg.includes('watchlist')) {
      info += '\n\n📌 TÍNH NĂNG XEM SAU:\n';
      info += '- Click icon 🔖 để thêm phim vào danh sách xem sau\n';
      info += '- Xem tại trang "My List"\n';
      info += '- Hoàn hảo cho phim bạn muốn xem nhưng chưa có thời gian';
    }

    // History
    if (lowerMsg.includes('lịch sử') || lowerMsg.includes('history') || lowerMsg.includes('đã xem')) {
      info += '\n\n📺 LỊCH SỬ XEM:\n';
      info += '- Tự động lưu tất cả phim bạn đã xem\n';
      info += '- Lưu vị trí đã xem để tiếp tục sau\n';
      info += '- Xem tại trang "History"\n';
      info += '- Xóa lịch sử bất cứ lúc nào';
    }

    // Download
    if (lowerMsg.includes('tải') || lowerMsg.includes('download') || lowerMsg.includes('offline')) {
      info += '\n\n📥 TẢI XUỐNG OFFLINE:\n';
      info += '- Chỉ có với gói Premium và VIP\n';
      info += '- Tải phim về xem khi không có mạng\n';
      info += '- Chọn chất lượng tải xuống\n';
      info += '- Quản lý phim đã tải trong thiết bị';
    }

    // Quality
    if (lowerMsg.includes('chất lượng') || lowerMsg.includes('quality') || lowerMsg.includes('hd') || lowerMsg.includes('4k')) {
      info += '\n\n🎬 CHẤT LƯỢNG PHIM:\n';
      info += '- Free: 480p (SD)\n';
      info += '- Basic: 720p (HD)\n';
      info += '- Premium: 1080p (Full HD)\n';
      info += '- VIP: 4K (Ultra HD)\n';
      info += '- Tự động điều chỉnh theo tốc độ mạng';
    }

    // Search
    if (lowerMsg.includes('tìm kiếm') || lowerMsg.includes('search')) {
      info += '\n\n🔍 TÌM KIẾM PHIM:\n';
      info += '- Tìm theo tên phim, diễn viên, đạo diễn\n';
      info += '- Lọc theo thể loại, năm, rating\n';
      info += '- Sắp xếp theo: Mới nhất, Phổ biến, Rating\n';
      info += '- Sử dụng thanh tìm kiếm ở góc trên';
    }

    return info;
  }
}

module.exports = GeminiService;
