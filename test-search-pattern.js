// Test search pattern extraction

const testMessages = [
  "Biệt Kích Diệt Sói",
  "phim Biệt Kích Diệt Sói",
  "Toi muốn tìm Biệt Kích Diệt Sói",
  "tìm Biệt Kích Diệt Sói",
  "Avengers 4"
];

testMessages.forEach(message => {
  let searchTitle = null;
  
  // Pattern 1: Text in quotes
  const quotedMatch = message.match(/[""]([^""]+)[""]/);
  if (quotedMatch) {
    searchTitle = quotedMatch[1];
  }
  
  // Pattern 2: "phim X"
  if (!searchTitle) {
    const phimMatch = message.match(/(?:về\s+)?phim\s+(.+?)(?:\s+(?:là|có|thế|nào|không|nhỉ|ạ)|\?|$)/i);
    if (phimMatch) {
      searchTitle = phimMatch[1].trim();
    }
  }
  
  // Pattern 2.5: "tìm X" or "muốn tìm X"
  if (!searchTitle) {
    const timMatch = message.match(/(?:toi\s+)?(?:muốn\s+)?(?:tìm|tim)\s+(.+?)(?:\s+\d{2}:\d{2})?$/i);
    if (timMatch) {
      searchTitle = timMatch[1].trim();
    }
  }
  
  // Pattern 3: Direct name
  if (!searchTitle) {
    const cleanMsg = message
      .replace(/^(tuyệt vời|mọi thứ về|cho tôi biết về|thông tin về|nội dung|kể về|giới thiệu|tìm)\s+/i, '')
      .replace(/\s+(là gì|thế nào|như thế nào|nhỉ|ạ|\?|!|\.)+$/i, '')
      .replace(/^phim\s+/i, '')
      .trim();
    
    if (cleanMsg.length === 0 && message.trim().length > 2 && message.trim().length < 50) {
      searchTitle = message.trim();
    } else if (cleanMsg.length > 2 && cleanMsg.length < 100) {
      searchTitle = cleanMsg;
    }
  }
  
  console.log(`"${message}" → "${searchTitle}"`);
});
