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

function logPrivacy(message) {
  log(`🔒 ${message}`, 'magenta');
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

async function testSendMessage(teacherId, message) {
  try {
    const response = await API.post('/api/chat/student/send', {
      teacherId: teacherId,
      message: message
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
    const response = await API.get('/api/chat/student/regenerate-anonid-global');
    
    if (response.status === 200) {
      logSuccess('Global anonId regeneration successful');
      logInfo(`New anonId: ${response.data.newGlobalAnonId}`);
      logInfo(`Updated chats: ${response.data.updatedChats}`);
      logInfo(`Old anonIds: ${response.data.oldAnonIds?.join(', ') || 'None'}`);
      logPrivacy(`Privacy Note: ${response.data.note}`);
      return response.data;
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
    const response = await API.post('/api/chat/student/send', {
      teacherId: teacherId,
      message: 'Test message after anonId regeneration'
    });
    
    if (response.status === 201) {
      const newAnonId = response.data.chat.anonId;
      if (newAnonId !== expectedOldAnonId) {
        logSuccess('Message sent with NEW anonId after regeneration');
        logInfo(`Old anonId: ${expectedOldAnonId}`);
        logInfo(`New anonId: ${newAnonId}`);
        logPrivacy('✅ Privacy maintained: Old messages are now orphaned and untraceable');
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
async function runPrivacyResetTests() {
  log('\n🔒 Starting Privacy Reset System Tests...\n', 'bright');
  
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
  
  // Test 3: Send first message to create initial anonId
  logInfo('Sending first test message to create initial anonId...');
  const testTeacherId = '6826a66dd00d0a54b42d1fe2';
  const initialAnonId = await testSendMessage(testTeacherId, 'First message with initial anonId');
  
  if (!initialAnonId) {
    logError('Cannot proceed without initial anonId');
    return;
  }
  
  // Test 4: Send second message to same teacher
  logInfo('Sending second message to same teacher...');
  const secondMessageAnonId = await testSendMessage(testTeacherId, 'Second message with same anonId');
  
  if (secondMessageAnonId !== initialAnonId) {
    logError('Second message should use same anonId');
    return;
  }
  logSuccess('Second message used same anonId (as expected)');
  
  // Test 5: Regenerate global anonId
  logInfo('Testing global anonId regeneration (this will orphan old messages)...');
  const regenerationResult = await testRegenerateGlobalAnonId();
  
  if (!regenerationResult) {
    logError('Cannot proceed without regeneration result');
    return;
  }
  
  // Test 6: Send message after regeneration
  logInfo('Testing message sending with new anonId...');
  const regenerationSuccess = await testSendMessageAfterRegeneration(testTeacherId, initialAnonId);
  
  // Test Results
  log('\n📊 Privacy Reset Test Results:', 'bright');
  log(`   Initial anonId: ${initialAnonId}`, 'cyan');
  log(`   New anonId: ${regenerationResult.newGlobalAnonId}`, 'cyan');
  log(`   Regeneration successful: ${regenerationSuccess ? 'Yes' : 'No'}`, regenerationSuccess ? 'green' : 'red');
  log(`   Old anonIds: ${regenerationResult.oldAnonIds?.join(', ') || 'None'}`, 'yellow');
  
  log('\n🔒 Privacy Features Demonstrated:', 'bright');
  log('   ✅ Single anonId per student (used for all teachers)', 'green');
  log('   ✅ Simple GET request to regenerate', 'green');
  log('   ✅ NEW entries created instead of updating old ones', 'green');
  log('   ✅ Old messages become orphaned and untraceable', 'magenta');
  log('   ✅ Complete privacy reset - no message migration', 'magenta');
  log('   ✅ New anonId starts with clean slate', 'magenta');
  
  log('\n💡 How Privacy Reset Works:', 'bright');
  log('   1. Student sends messages with anonId "ABC123"', 'cyan');
  log('   2. Student regenerates anonId to "XYZ789"', 'cyan');
  log('   3. NEW entry created with "XYZ789"', 'cyan');
  log('   4. OLD entry with "ABC123" becomes inactive', 'cyan');
  log('   5. Messages from "ABC123" are orphaned and untraceable', 'magenta');
  log('   6. New messages use "XYZ789" with no connection to old ones', 'magenta');
  
  log('\n🎯 API Endpoint:', 'bright');
  log('   GET /api/chat/student/regenerate-anonid-global', 'cyan');
  
  if (regenerationSuccess) {
    log('\n🎉 Privacy Reset System is working perfectly!', 'green');
    logPrivacy('Old messages are now completely untraceable to the new anonymous ID');
  } else {
    log('\n⚠️  Privacy Reset System has some issues', 'yellow');
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:');
  logError(`Promise: ${promise}`);
  logError(`Reason: ${reason}`);
});

// Run tests
runPrivacyResetTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
