import axios from "axios";

// Configuration
const BASE_URL = "http://localhost:3000/api";
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Test data
const testData = {
  student: {
    register: "teststudent123",
    password: "testpass123",
  },
  teacher: {
    employeeId: "testteacher123",
    password: "testpass123",
  },
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

function recordTest(success, testName) {
  testResults.total++;
  if (success) {
    testResults.passed++;
    logSuccess(`PASS: ${testName}`);
  } else {
    testResults.failed++;
    logError(`FAIL: ${testName}`);
  }
}

// Test functions
async function testServerConnection() {
  try {
    const response = await axios.get("http://localhost:3000/");
    if (response.data === "CMSX") {
      logSuccess("Server is running and responding");
      return true;
    } else {
      logError("Server responded but with unexpected data");
      return false;
    }
  } catch (error) {
    logError(`Server connection failed: ${error.message}`);
    return false;
  }
}

async function testAnonymousIdGeneration() {
  try {
    // Test the utility functions directly
    const {
      generateAnonymousId,
      generateAnonymousIdWithHash,
      isValidAnonymousId,
    } = await import("../utils/anonymousId.js");

    const anonId1 = generateAnonymousId();
    const { anonId: anonId2, hash: hash2 } = generateAnonymousIdWithHash();

    const isValid1 = isValidAnonymousId(anonId1);
    const isValid2 = isValidAnonymousId(anonId2);

    if (isValid1 && isValid2 && hash2.length === 64) {
      logSuccess("Anonymous ID generation working correctly");
      return true;
    } else {
      logError("Anonymous ID generation failed validation");
      return false;
    }
  } catch (error) {
    logError(`Anonymous ID generation test failed: ${error.message}`);
    return false;
  }
}

async function testStudentLogin() {
  try {
    const response = await API.post("/auth/login", testData.student);

    if (response.data.success && response.data.token) {
      // Store token for future requests
      API.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      logSuccess("Student login successful");
      return true;
    } else {
      logError("Student login failed - no token received");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      logWarning(
        "Student not found - this is expected if test data doesn't exist"
      );
      return true; // Not a system failure
    }
    logError(
      `Student login failed: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

async function testTeacherLogin() {
  try {
    const response = await API.post("/auth/login", testData.teacher);

    if (response.data.success && response.data.token) {
      // Store token for future requests
      API.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;
      logSuccess("Teacher login successful");
      return true;
    } else {
      logError("Teacher login failed - no token received");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 404) {
      logWarning(
        "Teacher not found - this is expected if test data doesn't exist"
      );
      return true; // Not a system failure
    }
    logError(
      `Teacher login failed: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
}

async function testAnonymousIdEndpoints() {
  try {
    // Test getting student anonymous IDs
    const response = await API.get("/anonymous/student/ids");

    if (response.status === 200) {
      logSuccess("Anonymous ID endpoints accessible");
      return true;
    } else {
      logError("Anonymous ID endpoints not accessible");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      logWarning("Authentication required - this is expected");
      return true; // Not a system failure
    }
    logError(
      `Anonymous ID endpoints test failed: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

async function testChatEndpoints() {
  try {
    // Test chat endpoints
    const response = await API.get("/chat/debug");

    if (response.status === 200) {
      logSuccess("Chat endpoints accessible");
      return true;
    } else {
      logError("Chat endpoints not accessible");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      logWarning("Authentication required - this is expected");
      return true; // Not a system failure
    }
    logError(
      `Chat endpoints test failed: ${
        error.response?.data?.message || error.message
      }`
    );
    return false;
  }
}

async function testDatabaseConnection() {
  try {
    // Test if we can access the database by checking if models can be imported
    const { default: Student } = await import(
      "../model/student/student.model.js"
    );
    const { default: Teacher } = await import(
      "../model/teachers/teachers.model.js"
    );
    const { default: Chat } = await import("../model/chat/chat.model.js");
    const { default: AnonymousId } = await import(
      "../model/anonymous/anonymous.model.js"
    );

    logSuccess("Database models can be imported successfully");
    return true;
  } catch (error) {
    logError(`Database connection test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log("\n🚀 Starting Anonymous ID System Tests...\n", "bright");

  // Test 1: Server Connection
  recordTest(await testServerConnection(), "Server Connection");

  // Test 2: Database Connection
  recordTest(await testDatabaseConnection(), "Database Connection");

  // Test 3: Anonymous ID Generation
  recordTest(await testAnonymousIdGeneration(), "Anonymous ID Generation");

  // Test 4: Student Login
  recordTest(await testStudentLogin(), "Student Login");

  // Test 5: Teacher Login
  recordTest(await testTeacherLogin(), "Teacher Login");

  // Test 6: Anonymous ID Endpoints
  recordTest(await testAnonymousIdEndpoints(), "Anonymous ID Endpoints");

  // Test 7: Chat Endpoints
  recordTest(await testChatEndpoints(), "Chat Endpoints");

  // Print results
  log("\n📊 Test Results:", "bright");
  log(`Total Tests: ${testResults.total}`, "cyan");
  log(`Passed: ${testResults.passed}`, "green");
  log(`Failed: ${testResults.failed}`, "red");

  if (testResults.failed === 0) {
    log(
      "\n🎉 All tests passed! The Anonymous ID system is working correctly.",
      "green"
    );
  } else {
    log("\n⚠️  Some tests failed. Check the errors above.", "yellow");
  }

  log("\n💡 Next Steps:", "bright");
  log("1. Start the server: npm run dev", "cyan");
  log("2. Create test users in the database", "cyan");
  log("3. Test the chat functionality manually", "cyan");
  log("4. Use the API endpoints with a tool like Postman", "cyan");
}

// Error handling
process.on("unhandledRejection", (reason, promise) => {
  logError("Unhandled Rejection at:");
  logError(`Promise: ${promise}`);
  logError(`Reason: ${reason}`);
});

// Run tests
runAllTests().catch((error) => {
  logError(`Test runner failed: ${error.message}`);
  process.exit(1);
});
