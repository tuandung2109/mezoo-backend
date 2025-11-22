const axios = require('axios');
require('dotenv').config();

const API_URL = 'https://mozi-backend.onrender.com/api';

// Test credentials
const TEST_USER = {
  email: 'admin@mozi.com',
  password: 'admin123456'
};

let token = '';
const sessionId = `test-${Date.now()}`;

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  test: (msg) => console.log(`${colors.cyan}▶${colors.reset} ${msg}`),
  response: (msg) => console.log(`${colors.yellow}→${colors.reset} ${msg}`)
};

// Login to get token
async function login() {
  try {
    log.test('Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
    token = response.data.data.token;
    log.success(`Logged in as ${response.data.data.username}`);
    return true;
  } catch (error) {
    log.error(`Login failed: ${error.message}`);
    return false;
  }
}

// Test 1: Send simple message
async function testSimpleMessage() {
  try {
    log.test('Test 1: Sending simple message');
    const response = await axios.post(
      `${API_URL}/chat`,
      {
        message: 'Xin chào!',
        sessionId
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success('Message sent successfully');
    log.response(`Bot: ${response.data.data.message}`);
    return true;
  } catch (error) {
    log.error(`Test 1 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 2: Movie recommendation
async function testMovieRecommendation() {
  try {
    log.test('Test 2: Requesting movie recommendation');
    const response = await axios.post(
      `${API_URL}/chat`,
      {
        message: 'Gợi ý phim hành động hay cho tôi',
        sessionId
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success('Recommendation received');
    log.response(`Bot: ${response.data.data.message}`);
    
    if (response.data.data.recommendedMovies?.length > 0) {
      log.info(`Recommended ${response.data.data.recommendedMovies.length} movies:`);
      response.data.data.recommendedMovies.forEach((movie, i) => {
        console.log(`  ${i + 1}. ${movie.title} (⭐ ${movie.rating.average.toFixed(1)})`);
      });
    }
    return true;
  } catch (error) {
    log.error(`Test 2 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Search movies
async function testMovieSearch() {
  try {
    log.test('Test 3: Searching for movies');
    const response = await axios.post(
      `${API_URL}/chat`,
      {
        message: 'Tìm phim kinh dị cho tôi',
        sessionId
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success('Search completed');
    log.response(`Bot: ${response.data.data.message}`);
    log.info(`Intent detected: ${response.data.data.intent}`);
    return true;
  } catch (error) {
    log.error(`Test 3 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Get chat history
async function testChatHistory() {
  try {
    log.test('Test 4: Getting chat history');
    const response = await axios.get(
      `${API_URL}/chat/history?sessionId=${sessionId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success(`Retrieved ${response.data.data.length} messages`);
    log.info('Last 3 messages:');
    response.data.data.slice(-3).forEach((msg, i) => {
      console.log(`  ${msg.role}: ${msg.content.substring(0, 50)}...`);
    });
    return true;
  } catch (error) {
    log.error(`Test 4 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Get quick suggestions
async function testQuickSuggestions() {
  try {
    log.test('Test 5: Getting quick suggestions');
    const response = await axios.get(
      `${API_URL}/chat/suggestions`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success(`Retrieved ${response.data.data.length} suggestions`);
    log.info('Suggestions:');
    response.data.data.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });
    return true;
  } catch (error) {
    log.error(`Test 5 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Get chat sessions
async function testChatSessions() {
  try {
    log.test('Test 6: Getting chat sessions');
    const response = await axios.get(
      `${API_URL}/chat/sessions`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success(`Retrieved ${response.data.data.length} sessions`);
    if (response.data.data.length > 0) {
      log.info('Recent sessions:');
      response.data.data.slice(0, 3).forEach((session, i) => {
        console.log(`  ${i + 1}. ${session._id} (${session.messageCount} messages)`);
      });
    }
    return true;
  } catch (error) {
    log.error(`Test 6 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Clear chat history
async function testClearHistory() {
  try {
    log.test('Test 7: Clearing chat history');
    const response = await axios.delete(
      `${API_URL}/chat/history?sessionId=${sessionId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    log.success('Chat history cleared');
    return true;
  } catch (error) {
    log.error(`Test 7 failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 MOZI CHATBOT API TESTS');
  console.log('='.repeat(60) + '\n');

  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    log.error('Cannot proceed without login');
    return;
  }

  console.log('');

  // Run tests
  const tests = [
    testSimpleMessage,
    testMovieRecommendation,
    testMovieSearch,
    testChatHistory,
    testQuickSuggestions,
    testChatSessions,
    testClearHistory
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) passed++;
    else failed++;
    console.log('');
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total: ${passed + failed}`);
  console.log('='.repeat(60) + '\n');

  if (failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.error(`${failed} test(s) failed`);
  }
}

// Run
runTests().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
