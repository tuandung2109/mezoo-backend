// Test intent detection

function analyzeIntent(message) {
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

  // Search intent - expanded to catch movie names
  if (
    lowerMsg.includes('tìm') ||
    lowerMsg.includes('search') ||
    lowerMsg.includes('có phim') ||
    lowerMsg.includes('phim nào') ||
    lowerMsg.includes('tìm kiếm') ||
    lowerMsg.includes('phim ') // "phim X"
  ) {
    return 'search';
  }
  
  // Short movie name queries (support Vietnamese characters)
  const trimmed = message.trim();
  const wordCount = trimmed.split(/\s+/).length;
  
  const isCommonPhrase = /^(xin chào|chào|hello|hi|hey|cảm ơn|thank|tôi muốn|tôi cần|bạn có thể|làm ơn|làm sao)/i.test(trimmed);
  
  if (!isCommonPhrase && wordCount >= 2 && wordCount <= 4 && /^[a-zA-ZÀ-ỹ0-9\s:.\-]+$/i.test(trimmed) && trimmed.length >= 3 && trimmed.length < 50) {
    return 'search';
  }

  return 'general';
}

const testMessages = [
  "Biệt Kích Diệt Sói",
  "phim Biệt Kích Diệt Sói",
  "Avengers 4",
  "Frankenstein",
  "Gợi ý phim hành động",
  "Xin chào",
  "Hello",
  "Làm sao thêm phim vào yêu thích",
  "Cảm ơn bạn",
  "Tôi muốn xem phim",
  "Bạn có thể giúp tôi",
  "F1"
];

console.log('Intent Detection Test:\n');
testMessages.forEach(msg => {
  const intent = analyzeIntent(msg);
  console.log(`"${msg}" → ${intent}`);
});
