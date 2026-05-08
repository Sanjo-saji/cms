# 🧪 Testing Guide for Anonymous ID System

This guide will help you test the anonymous ID system step by step.

## 🚀 **Quick Start Testing**

### 1. **Test Utility Functions (No Server Required)**
```bash
cd cmsw
node test-anonymous-system.js
```
This tests the core anonymous ID generation and validation functions.

### 2. **Test Full System (Server Required)**
```bash
cd cmsw
node test-full-system.js
```
This tests the complete system including API endpoints.

## 🔧 **Manual Testing Steps**

### **Step 1: Start the Server**
```bash
cd cmsw
npm run dev
```
Wait for: `Server is running on port 3000`

### **Step 2: Test Basic Connectivity**
```bash
curl http://localhost:3000/
```
Expected: `CMSX`

### **Step 3: Test Anonymous ID Generation**
```bash
curl -X POST http://localhost:3000/api/chat/student/send \
  -H "Content-Type: application/json" \
  -d '{"teacherId": "test123", "message": "Hello teacher!"}'
```
Expected: `401 Unauthorized` (no authentication)

### **Step 4: Test with Authentication**

#### **A. Create Test Users in Database**
You'll need to create test users first. You can do this by:
1. Using your existing database management tool
2. Or creating a simple script to add test users

#### **B. Test Student Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"register": "your_student_id", "password": "your_password"}'
```

#### **C. Test Teacher Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "your_teacher_id", "password": "your_password"}'
```

## 📱 **Using Postman for Testing**

### **1. Student Authentication**
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "register": "your_student_id",
  "password": "your_password"
}
```

### **2. Send Student Message**
```
POST http://localhost:3000/api/chat/student/send
Headers: 
  Authorization: Bearer {token_from_login}
Body (JSON):
{
  "teacherId": "teacher_object_id",
  "message": "Hello teacher, I have a question!"
}
```

### **3. Get Student's Anonymous IDs**
```
GET http://localhost:3000/api/anonymous/student/ids
Headers: 
  Authorization: Bearer {token_from_login}
```

### **4. Regenerate Anonymous ID**
```
POST http://localhost:3000/api/anonymous/student/regenerate
Headers: 
  Authorization: Bearer {token_from_login}
Body (JSON):
{
  "teacherId": "teacher_object_id"
}
```

### **5. Teacher Send Message**
```
POST http://localhost:3000/api/chat/teacher/send
Headers: 
  Authorization: Bearer {teacher_token}
Body (JSON):
{
  "anonId": "ABC12345",
  "message": "Hello student! How can I help you?"
}
```

## 🗄️ **Database Testing**

### **Check Anonymous ID Collection**
```javascript
// In MongoDB shell or Compass
use your_database_name
db.anonymousids.find()
```

### **Check Chat Collection**
```javascript
db.chats.find()
```

### **Check Student Collection**
```javascript
db.students.find()
```

## 🔍 **Debug Endpoints**

### **Chat Structure Debug**
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/chat/debug
```

### **Raw Chat Data**
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/chat/debug-raw
```

## ⚠️ **Common Issues & Solutions**

### **1. "Chat validation failed" Error**
- **Cause**: Old message format in database
- **Solution**: The updated model now handles migration automatically

### **2. "Unauthorized" Errors**
- **Cause**: Missing or invalid authentication token
- **Solution**: Ensure you're logged in and using the correct token

### **3. "Anonymous ID not found"**
- **Cause**: The anonId doesn't exist or is inactive
- **Solution**: Check if the student has sent a message to that teacher

### **4. Database Connection Issues**
- **Cause**: MongoDB not running or wrong connection string
- **Solution**: Check your `.env` file and MongoDB service

## 📊 **Expected Test Results**

### **Successful Anonymous ID Generation**
- 8-character alphanumeric string (e.g., `A1B2C3D4`)
- All uppercase letters and numbers
- Unique for each student-teacher pair

### **Successful Message Sending**
- Student message creates/updates anonymous ID
- Teacher can respond using the anonymous ID
- Messages are stored with proper sender identification

### **Successful Regeneration**
- Old anonymous ID becomes inactive
- New anonymous ID is generated
- Chat history is preserved

## 🎯 **Test Scenarios**

### **Scenario 1: First-time Student Message**
1. Student sends message to teacher
2. System generates new anonymous ID
3. Message is stored with anonymous ID
4. Student receives confirmation with anonymous ID

### **Scenario 2: Student Regenerates ID**
1. Student requests new anonymous ID
2. Old ID becomes inactive
3. New ID is generated
4. Teacher can still access chat history

### **Scenario 3: Teacher Response**
1. Teacher sends message using anonymous ID
2. Message is stored in correct chat thread
3. Student can view response in their chat

## 🚨 **Security Testing**

### **Test Unauthorized Access**
```bash
# Try to access without token
curl http://localhost:3000/api/anonymous/student/ids
# Should return 401 Unauthorized
```

### **Test Invalid Anonymous ID**
```bash
# Try to send message with invalid anonId
curl -X POST http://localhost:3000/api/chat/teacher/send \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"anonId": "INVALID", "message": "Test"}'
# Should return 400 Bad Request
```

## 📝 **Test Checklist**

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Anonymous ID generation works
- [ ] Student can send message
- [ ] Anonymous ID is created
- [ ] Teacher can view anonymous ID
- [ ] Teacher can respond using anonId
- [ ] Student can regenerate anonId
- [ ] Old anonId becomes inactive
- [ ] Chat history is preserved
- [ ] Security measures work (unauthorized access blocked)
- [ ] Validation works (invalid inputs rejected)

## 🎉 **Success Criteria**

The system is working correctly when:
1. ✅ All utility functions pass validation
2. ✅ API endpoints respond correctly
3. ✅ Anonymous IDs are generated uniquely
4. ✅ Messages are stored and retrieved properly
5. ✅ Regeneration works without data loss
6. ✅ Security measures block unauthorized access
7. ✅ Database operations complete successfully

## 🔧 **Troubleshooting**

If tests fail:
1. Check server logs for errors
2. Verify database connection
3. Ensure all dependencies are installed
4. Check if models are properly imported
5. Verify authentication middleware is working
6. Check database schema compatibility

## 📞 **Need Help?**

If you encounter issues:
1. Check the server console for error messages
2. Verify your MongoDB connection
3. Ensure all required environment variables are set
4. Check if the database collections exist
5. Review the README_ANONYMOUS_ID.md for detailed information
