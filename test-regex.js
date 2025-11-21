const message = 'phim Frankenstein';

// Pattern 2: "phim X" or "về phim X"
const phimMatch = message.match(/(?:về\s+)?phim\s+([A-Za-zÀ-ỹ0-9\s:]+?)(?:\s+(?:là|có|thế|nào|không|nhỉ|ạ|\?|$))/i);

console.log('Message:', message);
console.log('Match:', phimMatch);

if (phimMatch) {
  console.log('Extracted:', phimMatch[1].trim());
} else {
  console.log('No match!');
  
  // Try simpler pattern
  const simpleMatch = message.match(/phim\s+(.+)/i);
  console.log('Simple match:', simpleMatch);
  if (simpleMatch) {
    console.log('Simple extracted:', simpleMatch[1].trim());
  }
}
