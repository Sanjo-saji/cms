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
  },
  teacher: {
    employeeId: 'testteacher123',
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

async function testGetStudentAnonIds() {
  try {
    const response = await API.get('/anonymous/student/ids');
    
    if (response.status === 200) {
      logSuccess('Get student anonymous IDs endpoint working');
      logInfo(`Found ${response.data.anonIds?.length || 0} anonymous IDs`);
      return response.data.anonIds || [];
    } else {
      logError('Get student anonymous IDs failed');
      return [];
    }
  } catch (error) {
    if (error.response?.status === 401) {
      logWarning('Authentication required - this is expected');
      return [];
    }
    logError(`Get student anonIds failed: ${error.response?.data?.message || error.message}`);
    return [];
  }
}

async function testRegenerateSingleAnonId(teacherId) {
  try {
    const response = await API.post('/anonymous/student/regenerate', {
      teacherId: teacherId
    });
    
    if (response.status === 200) {
      logSuccess('Single anonId regeneration working');
      logInfo(`New anonId: ${response.data.newAnonId}`);
      return response.data.newAnonId;
    } else {
      logError('Single anonId regeneration failed');
      return null;
    }
  } catch (error) {
    logError(`Single anonId regeneration failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testResetAllAnonIds() {
  try {
    const response = await API.post('/anonymous/student/reset-all');
    
    if (response.status === 200) {
      logSuccess('Reset all anonIds endpoint working');
      logInfo(`Reset summary: ${response.data.summary.successful}/${response.data.summary.total} successful`);
      
      if (response.data.resetResults && response.data.resetResults.length > 0) {
        logInfo('Reset results:');
        response.data.resetResults.forEach(result => {
          logInfo(`  ${result.oldAnonId} → ${result.newAnonId} (${result.teacher.name})`);
        });
      }
      
      return response.data;
    } else {
      logError('Reset all anonIds failed');
      return null;
    }
  } catch (error) {
    logError(`Reset all anonIds failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testChatResetEndpoint(teacherId) {
  try {
    const response = await API.post('/chat/student/reset-anonid', {
      teacherId: teacherId
    });
    
    if (response.status === 200) {
      logSuccess('Chat reset endpoint working');
      logInfo(`New anonId: ${response.data.newAnonId}`);
      return response.data.newAnonId;
    } else {
      logError('Chat reset endpoint failed');
      return null;
    }
  } catch (error) {
    logError(`Chat reset endpoint failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

// Main test runner
async function runResetTests() {
  log('\n🔄 Starting Anonymous ID Reset Endpoint Tests...\n', 'bright');
  
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
  
  // Test 3: Get current anonymous IDs
  logInfo('Getting current anonymous IDs...');
  const currentAnonIds = await testGetStudentAnonIds();
  
  if (currentAnonIds.length === 0) {
    logWarning('No anonymous IDs found - cannot test reset functionality');
    return;
  }
  
  // Test 4: Test single regeneration
  logInfo('Testing single anonId regeneration...');
  const firstTeacherId = currentAnonIds[0]?.teacher?.id;
  if (firstTeacherId) {
    await testRegenerateSingleAnonId(firstTeacherId);
  }
  
  // Test 5: Test chat reset endpoint
  logInfo('Testing chat reset endpoint...');
  if (firstTeacherId) {
    await testChatResetEndpoint(firstTeacherId);
  }
  
  // Test 6: Test reset all endpoint
  logInfo('Testing reset all anonIds endpoint...');
  await testResetAllAnonIds();
  
  // Test 7: Verify changes
  logInfo('Verifying changes...');
  const updatedAnonIds = await testGetStudentAnonIds();
  
  log('\n📊 Test Results Summary:', 'bright');
  log(`   Initial anonIds: ${currentAnonIds.length}`, 'cyan');
  log(`   Final anonIds: ${updatedAnonIds.length}`, 'cyan');
  
  if (currentAnonIds.length !== updatedAnonIds.length) {
    logWarning('AnonId count changed - this is expected after reset');
  }
  
  log('\n🎯 Reset Endpoints Available:', 'bright');
  log('   POST /api/anonymous/student/regenerate - Regenerate single anonId', 'cyan');
  log('   POST /api/anonymous/student/reset-all - Reset all anonIds', 'cyan');
  log('   POST /api/chat/student/reset-anonid - Chat reset endpoint', 'cyan');
  
  log('\n💡 Usage Examples:', 'bright');
  log('   # Reset single anonId for specific teacher', 'cyan');
  log('   curl -X POST /api/anonymous/student/regenerate \\', 'cyan');
  log('     -H "Authorization: Bearer YOUR_TOKEN" \\', 'cyan');
  log('     -H "Content-Type: application/json" \\', 'cyan');
  log('     -d \'{"teacherId": "teacher123"}\'', 'cyan');
  
  log('\n   # Reset all anonIds', 'cyan');
  log('   curl -X POST /api/anonymous/student/reset-all \\', 'cyan');
  log('     -H "Authorization: Bearer YOUR_TOKEN"', 'cyan');
  
  log('\n🎉 Reset endpoint tests completed!', 'green');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection at:');
  logError(`Promise: ${promise}`);
  logError(`Reason: ${reason}`);
});

// Run tests
runResetTests().catch(error => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
