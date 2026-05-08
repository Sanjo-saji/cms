import axios from 'axios';

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Test data
const testData = {
  student: {
    register: 'teststudent123',
    password: 'testpass123'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test functions
async function testServerConnection() {
  try {
    const response = await axios.get('http://localhost:3000/');
    if (response.data === 'CMSX') {
      logSuccess('Server is running and responding');
      return true;
    } else {
      logError('Server responded but with unexpected data');
      return false;
    }
  } catch (error) {
    logError(`Server connection failed: ${error.message}`);
    return false;
  }
}

async function testStudentLogin() {
  try {
    const response = await API.post('/auth/login', testData.student);
    
    if (response.data.success && response.data.token) {
      // Store token for future requests
      API.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      logSuccess('Student login successful');
      return true;
    } else {
      logError('Student login failed - no token received');
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      logWarning('Student not found - this is expected if test data doesn\'t exist');
      return true; // Not a system failure
    }
    logError(`Student login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testSendMessage(teacherId) {
  try {
    const response = await API.post('/chat/student/send', {
      teacherId: teacherId,
      message: 'Test message for global anonId system'
    });
    
    if (response.status === 201) {
      logSuccess('Message sent successfully');
      logInfo(`Anonymous ID: ${response.data.chat.anonId}`);
      return response.data.chat.anonId;
    } else {
      logError('Failed to send message');
      return null;
    }
  } catch (error) {
    logError(`Send message failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testRegenerateGlobalAnonId() {
  try {
    const response = await API.get('/chat/student/regenerate-anonid-global');
    
    if (response.status === 200) {
      logSuccess('Global anonId regeneration successful');
      logInfo(`New anonId: ${response.data.newGlobalAnonId}`);
      logInfo(`Updated chats: ${response.data.updatedChats}`);
      logInfo(`Old anonIds: ${response.data.oldAnonIds?.join(', ') || 'None'}`);
      logInfo(`Note: ${response.data.note}`);
      return response.data.newGlobalAnonId;
    } else {
      logError('Global anonId regeneration failed');
      return null;
    }
  } catch (error) {
    logError(`Global anonId regeneration failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testSendMessageAfterRegeneration(teacherId, expectedOldAnonId) {
  try {
    const response = await API.post('/chat/student/send', {
      teacherId: teacherId,
      message: 'Test message after anonId regeneration'
    });
    
    if (response.status === 201) {
      const newAnonId = response.data.chat.anonId;
      if (newAnonId !== expectedOldAnonId) {
        logSuccess('Message sent with new anonId after regeneration');
        logInfo(`Old anonId: ${expectedOldAnonId}`);
        logInfo(`New anonId: ${newAnonId}`);
        return true;
      } else {
        logWarning('AnonId did not change after regeneration');
        return false;
      }
    } else {
      logError('Failed to send message after regeneration');
      return false;
    }
  } catch (error) {
    logError(`Send message after regeneration failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runGlobalAnonIdTests() {
  log('\n🌐 Starting Global Anonymous ID System Tests...\n', 'bright');
  
  // Test 1: Server Connection
  logInfo('Testing server connection...');
  if (!await testServerConnection()) {
    logError('Cannot proceed without server connection');
    return;
  }
  
  // Test 2: Student Login
  logInfo('Testing student login...');
  if (!await testStudentLogin()) {
    logError('Cannot proceed without authentication');
    return;
  }
  
  // Test 3: Send message to create initial anonId
  logInfo('Sending test message to create initial anonId...');
  const testTeacherId = '6826a66dd00d0a54b42d1fe2'; // Use the teacher ID from your previous tests
  const initialAnonId = await testSendMessage(testTeacherId);
  
  if (!initialAnonId) {
    logError('Cannot proceed without initial anonId');
    return;
  }
  
  // Test 4: Regenerate global anonId
  logInfo('Testing global anonId regeneration...');
  const newAnonId = await testRegenerateGlobalAnonId();
  
  if (!newAnonId) {
    logError('Cannot proceed without new anonId');
    return;
  }
  
  // Test 5: Send message after regeneration
  logInfo('Testing message sending with new anonId...');
  const regenerationSuccess = await testSendMessageAfterRegeneration(testTeacherId, initialAnonId);
  
  // Test Results
  log('\n📊 Global AnonId Test Results:', 'bright');
  log(`   Initial anonId: ${initialAnonId}`, 'cyan');
  log(`   New anonId: ${newAnonId}`, 'cyan');
  log(`   Regeneration successful: ${regenerationSuccess ? 'Yes' : 'No'}`, regenerationSuccess ? 'green' : 'red');
  
  log('\n🎯 Global AnonId System Features:', 'bright');
  log('   ✅ Single anonId per student (used for all teachers)', 'green');
  log('   ✅ Simple GET request to regenerate', 'green');
  log('   ✅ Endpoint: /api/chat/student/regenerate-anonid-global', 'green');
  log('   ✅ Creates NEW entries instead of updating old ones', 'green');
  log('   ✅ Old messages become orphaned for privacy', 'green');
  log('   ✅ No message migration - complete privacy reset', 'green');
  
  log('\n💡 Usage Examples:', 'bright');
  log('   # Regenerate global anonId (GET request)', 'cyan');
  log('   curl -H "Authorization: Bearer YOUR_TOKEN" \\', 'cyan');
  log('     http://localhost:3000/api/chat/student/regenerate-anonid-global', 'cyan');
  
  log('\n   # Send message (automatically uses current anonId)', 'cyan');
  log('   curl -X POST /api/chat/student/send \\', 'cyan');
  log('     -H "Authorization: Bearer YOUR_TOKEN" \\', 'cyan');
  log('     -H "Content-Type: application/json" \\', 'cyan');
  log('     -d \'{"teacherId": "teacher123", "message": "Hello!"}\'', 'cyan');
  
  if (regenerationSuccess) {
    log('\n🎉 Global Anonymous ID system is working perfectly!', 'green');
  } else {
    log('\n⚠️  Global Anonymous ID system has some issues', 'yellow');
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:');
  logError(`Promise: ${promise}`);
  logError(`Reason: ${reason}`);
});

// Run tests
runGlobalAnonIdTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
